import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { blogTranslations } from "@/utils/translations";

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }];
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
                {allPostsData.map(({ id, title, date }) => (
                    <li key={id} className="border-t-2 pt-4">
                        <Link
                            href={`/${lang}/blog/${id}`}
                            className="text-xl font-semibold text-primary hover:underline"
                        >
                            {title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            {new Date(date).toLocaleDateString(lang, {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
