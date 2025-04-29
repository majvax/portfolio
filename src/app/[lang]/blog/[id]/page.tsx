import { getAllPostIds, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";


export function generateStaticParams() {
    const SUPPORTED_LANGS = ["en", "fr"] as const;
 
    return SUPPORTED_LANGS.flatMap(lang =>
        getAllPostIds(lang).map(id => ({ lang, id }))
    );
}

export default async function PostPage({ params }: { params: Promise<{ lang: "en" | "fr", id: string }> }) {
    const { lang, id } = await params;
    const postData = await getPostData(id, lang);

    if (!postData) {
        notFound();
    }

    return (
        <main className="max-w-2xl mx-auto pt-20 px-4">
            <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
            <div className="text-sm text-muted-foreground mb-8">
                {new Date(postData.date).toLocaleDateString(lang, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}
            </div>
            <article
                className="prose prose-neutral dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
            />
        </main>
    );
}
