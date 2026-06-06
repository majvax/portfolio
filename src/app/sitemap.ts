import type { MetadataRoute } from "next";
import { getAllPostIds, getSortedPostsData } from "@/lib/posts";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const LANGS = ["en", "fr"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ];

    for (const lang of LANGS) {
        entries.push({
            url: `${SITE_URL}/${lang}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.9,
        });
        entries.push({
            url: `${SITE_URL}/${lang}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        });
        const posts = getSortedPostsData(lang);
        const ids = new Set(getAllPostIds(lang));
        for (const post of posts) {
            if (!ids.has(post.id)) continue;
            entries.push({
                url: `${SITE_URL}/${lang}/blog/${post.id}`,
                lastModified: new Date(post.date),
                changeFrequency: "yearly",
                priority: 0.7,
            });
        }
    }

    return entries;
}
