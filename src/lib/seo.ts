import type { Metadata } from "next";

export const SITE_URL = "https://guillaume-dehez.com";
export const SITE_NAME = "Guillaume Dehez";
export const DEFAULT_OG_IMAGE = "/og.jpg";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const THEME_COLOR = "#0a0a0a";

export type Locale = "en" | "fr";

export function localeTag(lang: Locale): string {
    return lang === "en" ? "en_US" : "fr_FR";
}

export function dateLocale(lang: Locale): string {
    return lang === "en" ? "en-US" : "fr-FR";
}

export function languageAlternates(lang: Locale, path: string): Metadata["alternates"] {
    return {
        canonical: `${SITE_URL}/${lang}${path}`,
        languages: {
            en: `${SITE_URL}/en${path}`,
            fr: `${SITE_URL}/fr${path}`,
            "x-default": `${SITE_URL}/en${path}`,
        },
    };
}

interface BuildMetadataOptions {
    lang: Locale;
    path: string;
    title: string;
    description: string;
    type?: "website" | "article";
    publishedTime?: string;
    image?: string;
}

export function buildMetadata({
    lang,
    path,
    title,
    description,
    type = "website",
    publishedTime,
    image = DEFAULT_OG_IMAGE,
}: BuildMetadataOptions): Metadata {
    const url = `${SITE_URL}/${lang}${path}`;
    return {
        title,
        description,
        alternates: languageAlternates(lang, path),
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            locale: localeTag(lang),
            alternateLocale: localeTag(lang === "en" ? "fr" : "en"),
            type,
            ...(publishedTime ? { publishedTime } : {}),
            images: [{ url: image, width: DEFAULT_OG_IMAGE_WIDTH, height: DEFAULT_OG_IMAGE_HEIGHT, alt: SITE_NAME }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}
