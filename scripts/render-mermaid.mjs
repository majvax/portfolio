import { createMermaidRenderer } from "mermaid-isomorphic";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const renderer = createMermaidRenderer();
const codes = new Set();

for (const lang of ["en", "fr"]) {
    const dir = join("posts", lang);
    const files = readdirSync(dir).filter(f => !f.startsWith("_") && f.endsWith(".md"));
    for (const file of files) {
        const content = readFileSync(join(dir, file), "utf8");
        const regex = /```mermaid\n([\s\S]*?)```/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
            codes.add(m[1].trim());
        }
    }
}

const codeArray = [...codes];
console.log(`Found ${codeArray.length} unique mermaid diagram(s)`);

const cache = {};
if (codeArray.length > 0) {
    const results = await renderer(codeArray);
    for (let i = 0; i < codeArray.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") {
            cache[codeArray[i]] = r.value.svg;
        } else {
            console.error(`Failed to render diagram ${i}:`, r.reason);
            process.exit(1);
        }
    }
}

writeFileSync(".mermaid-cache.json", JSON.stringify(cache));
console.log(`Cached ${Object.keys(cache).length} diagram(s) to .mermaid-cache.json`);
