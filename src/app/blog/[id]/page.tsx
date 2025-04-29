import { getAllPostIds, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";


export function generateStaticParams() {
    const ids = getAllPostIds();
    return ids.map((id) => ({ id }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const postData = await getPostData(id);

    if (!postData) {
        notFound();
    }

    return (
        <main className="max-w-2xl mx-auto pt-20 px-4">
            <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
            <div className="text-sm text-muted-foreground mb-8">{new Date(postData.date).toLocaleDateString()}</div>
            <article
                className="prose prose-neutral dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
            />
        </main>
    );
}
