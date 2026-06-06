import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeMermaid from "rehype-mermaid";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";


export function getSortedPostsData(lang: "en" | "fr") {
    const postsDirectory = path.join(process.cwd(), "posts", lang);
    const fileNames = fs.readdirSync(postsDirectory).filter(f => !f.startsWith("_"));
    const allPostsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const matterResult = matter(fileContents);

        return {
            id,
            title: matterResult.data.title as string,
            date: matterResult.data.date as string,
        };
    });
    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostIds(lang: "en" | "fr") {
    const postsDirectory = path.join(process.cwd(), "posts", lang);
    const fileNames = fs.readdirSync(postsDirectory).filter(f => !f.startsWith("_"));
    return fileNames.map((fileName) => fileName.replace(/\.md$/, ""));
}

export async function getPostData(id: string, lang: "en" | "fr") {
    const postsDirectory = path.join(process.cwd(), "posts", lang);
    const fullPath = path.join(postsDirectory, `${id}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeMermaid)
        .use(rehypePrism, { showLineNumbers: true, defaultLanguage: "text" })
        .use(rehypeStringify)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        title: matterResult.data.title as string,
        date: matterResult.data.date as string,
        contentHtml,
    };
}
