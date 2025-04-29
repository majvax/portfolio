import { HeroSection } from "@/components/hero-section"

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }];
}

export default async function Home({params}: { params: Promise<{ lang: "en" | "fr" }> }) {
    const { lang } = await params;
    return (
        <HeroSection currentLang={lang} />
    )
}
