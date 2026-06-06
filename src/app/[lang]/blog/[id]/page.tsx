import { getAllPostIds, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildMetadata, dateLocale, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { blogTranslations } from "@/utils/translations";
import type { Metadata } from "next";


export function generateStaticParams() {
    const SUPPORTED_LANGS = ["en", "fr"] as const;

    return SUPPORTED_LANGS.flatMap(lang =>
        getAllPostIds(lang).map(id => ({ lang, id }))
    );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: "en" | "fr", id: string }> }): Promise<Metadata> {
    const { lang, id } = await params;
    const postData = await getPostData(id, lang);
    if (!postData) return {};
    return buildMetadata({
        lang,
        path: `/blog/${id}`,
        title: postData.title,
        description: postData.description,
        type: "article",
        publishedTime: new Date(postData.date).toISOString(),
    });
}

export default async function PostPage({ params }: { params: Promise<{ lang: "en" | "fr", id: string }> }) {
    const { lang, id } = await params;
    const postData = await getPostData(id, lang);

    if (!postData) {
        notFound();
    }

    const url = `${SITE_URL}/${lang}/blog/${id}`;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: postData.title,
        description: postData.description,
        datePublished: new Date(postData.date).toISOString(),
        dateModified: new Date(postData.date).toISOString(),
        author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
        image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        inLanguage: lang === "en" ? "en-US" : "fr-FR",
        wordCount: postData.wordCount,
    };

    return (
        <main className="max-w-2xl mx-auto pt-20 px-4 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>{blogTranslations[lang].backToBlog}</span>
            </Link>
            <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
            <div className="text-sm text-muted-foreground mb-8">
                {new Date(postData.date).toLocaleDateString(dateLocale(lang), {
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
