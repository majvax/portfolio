import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { heroTranslations } from "@/utils/translations"


type HeroSectionProps = {
    currentLang: "en" | "fr";
}

export function HeroSection({ currentLang }: HeroSectionProps) {
    const t = heroTranslations[currentLang];
    return (
        <section id="home" className="h-screen w-full flex items-center pt-16">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-16">
                    {/* Text Content - Left */}
                    <div className="animate-hero-fade-up flex flex-col items-center md:items-start">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-center md:text-left">
                            {t.title}
                        </h1>
                        <p className="mt-4 text-xl md:text-2xl text-muted-foreground text-center md:text-left">
                            {t.subtitle}
                        </p>

                        <p className="mt-4 text-lg text-muted-foreground max-w-[600px] text-center md:text-left">
                            {t.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                            <Link href="https://github.com/majvax" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Github className="h-5 w-5" />
                                    Github
                                </Button>
                            </Link>
                            <Link href="https://www.linkedin.com/in/guillaume-dehez/" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Linkedin className="h-5 w-5" />
                                    LinkedIn
                                </Button>
                            </Link>
                            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer">
                                <Button variant="default" size="lg" className="gap-2">
                                    <FileText className="h-5 w-5" />
                                    Resume
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Profile Picture - Right */}
                    <div className="animate-hero-fade-scale relative w-56 h-56 md:w-72 md:h-72 overflow-hidden rounded-2xl border-4 border-primary/20 shadow-xl">
                        <Image
                            src="/photo-hero.jpg"
                            alt="Guillaume Dehez"
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 224px, 288px"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
