export const heroTranslations = {
  fr: {
    title: "Guillaume Dehez",
    subtitle: "Étudiant ingénieur en cybersécurité & aspirant rétro-ingénieur",
    description:
      "Étudiant ingénieur cyber de 20 ans. Passionné de reverse, je passe mon temps à désosser des binaires sous IDA, à coder en C++ et à enchaîner les CTFs.",
  },
  en: {
    title: "Guillaume Dehez",
    subtitle: "Cybersecurity engineering student & aspiring reverse engineer",
    description:
      "Second-year cybersecurity engineering student, 20. CTFs, picking apart binaries in IDA, and a lot of C++ keep me busy after hours.",
  },
} as const;

export const blogTranslations = {
  fr: {
    title: "Derniers articles",
    intro:
      "Bienvenue sur mon blog ! Ici, je partage mes réflexions et mes découvertes sur la programmation, la cybersécurité et d'autres sujets qui m'intéressent. J'espère que vous trouverez ces articles intéressants et utiles.",
    minRead: (m: number) => `${m} min de lecture`,
    backToBlog: "Retour au blog",
  },
  en: {
    title: "Latest posts",
    intro:
      "Welcome to my blog! Here, I share my thoughts and discoveries on programming, cybersecurity, and other topics that interest me. I hope you find these articles interesting and helpful.",
    minRead: (m: number) => `${m} min read`,
    backToBlog: "Back to blog",
  },
} as const;

export const seoTranslations = {
  en: {
    home: {
      title: "Guillaume Dehez - Portfolio",
      description:
        "Personal portfolio of Guillaume Dehez, a 20-year-old cybersecurity engineering student focused on reverse engineering.",
    },
    blog: {
      title: "Blog - Guillaume Dehez",
      description:
        "Articles on programming, cybersecurity, reverse engineering, and CTF writeups by Guillaume Dehez.",
    },
  },
  fr: {
    home: {
      title: "Guillaume Dehez - Portfolio",
      description:
        "Portfolio personnel de Guillaume Dehez, étudiant ingénieur cybersécurité de 20 ans passionné par le reverse engineering.",
    },
    blog: {
      title: "Blog - Guillaume Dehez",
      description:
        "Articles sur la programmation, la cybersécurité, le reverse engineering et des writeups de CTF par Guillaume Dehez.",
    },
  },
} as const;
