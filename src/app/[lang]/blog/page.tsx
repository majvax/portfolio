import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { blogTranslations, seoTranslations } from "@/utils/translations";
import { buildMetadata, dateLocale } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: "en" | "fr" }> }): Promise<Metadata> {
    const { lang } = await params;
    const t = seoTranslations[lang].blog;
    return buildMetadata({ lang, path: "/blog", title: t.title, description: t.description });
}


export default async function BlogPage({params}: { params: Promise<{ lang: "en" | "fr" }> }) {
    const { lang } = await params;
    const allPostsData = getSortedPostsData(lang);
    const t = blogTranslations[lang];

    return (
        <main className="max-w-2xl mx-auto pt-20 px-4">
            <h1 className="text-3xl font-bold mb-8">
                {t.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
                {t.intro}
            </p>
            <ul className="space-y-6">
                {allPostsData.map(({ id, title, date, description, readingTime }) => (
                    <li key={id} className="border-t-2 pt-4">
                        <Link
                            href={`/${lang}/blog/${id}`}
                            className="text-xl font-semibold text-primary hover:underline"
                        >
                            {title}
                        </Link>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2">
                            <span>
                                {new Date(date).toLocaleDateString(dateLocale(lang), {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{t.minRead(readingTime)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {description}
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
