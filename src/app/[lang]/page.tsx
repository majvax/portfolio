import { HeroSection } from "@/components/hero-section"
import { buildMetadata } from "@/lib/seo"
import { seoTranslations } from "@/utils/translations"
import type { Metadata } from "next"

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: "en" | "fr" }> }): Promise<Metadata> {
    const { lang } = await params;
    const t = seoTranslations[lang].home;
    return buildMetadata({ lang, path: "", title: t.title, description: t.description });
}

export default async function Home({params}: { params: Promise<{ lang: "en" | "fr" }> }) {
    const { lang } = await params;
    return (
        <HeroSection currentLang={lang} />
    )
}
