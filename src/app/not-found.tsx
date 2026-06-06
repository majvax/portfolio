"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Astronaut, Sparkle } from "@/components/astronaut";

const labels = {
    en: { title: "Lost in space" },
    fr: { title: "Perdu dans l'espace" },
} as const;

const DOTS = [
    { top: "12%", left: "8%", size: 5, opacity: 0.4 },
    { top: "22%", left: "82%", size: 6, opacity: 0.5 },
    { top: "75%", left: "10%", size: 5, opacity: 0.4 },
    { top: "85%", left: "78%", size: 6, opacity: 0.5 },
    { top: "40%", left: "5%", size: 4, opacity: 0.3 },
    { top: "60%", left: "92%", size: 5, opacity: 0.4 },
    { top: "30%", left: "20%", size: 3, opacity: 0.3 },
    { top: "70%", left: "88%", size: 3, opacity: 0.3 },
    { top: "18%", left: "55%", size: 4, opacity: 0.3 },
];

const SPARKLES = [
    { top: "10%", left: "30%", size: 14, opacity: 0.5, delay: 0 },
    { top: "20%", left: "70%", size: 18, opacity: 0.55, delay: 0.6 },
    { top: "55%", left: "12%", size: 16, opacity: 0.5, delay: 1.2 },
    { top: "65%", left: "75%", size: 14, opacity: 0.5, delay: 0.4 },
    { top: "32%", left: "88%", size: 12, opacity: 0.4, delay: 1.6 },
    { top: "82%", left: "35%", size: 16, opacity: 0.5, delay: 0.9 },
];

const RINGS = [
    { top: "78%", left: "20%", size: 14, opacity: 0.35 },
    { top: "25%", left: "92%", size: 10, opacity: 0.3 },
];

export default function NotFound() {
    const [lang, setLang] = useState<"en" | "fr">("en");

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/fr")) {
            setLang("fr");
        }
    }, []);

    const t = labels[lang];

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar className="fixed top-0 left-0 right-0 z-50" currentLang={lang} />
            <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16 relative overflow-hidden text-foreground">
                {/* Background dots */}
                {DOTS.map((d, i) => (
                    <div
                        key={`d${i}`}
                        className="absolute rounded-full bg-foreground"
                        style={{
                            top: d.top,
                            left: d.left,
                            width: `${d.size}px`,
                            height: `${d.size}px`,
                            opacity: d.opacity,
                        }}
                    />
                ))}

                {/* Background rings */}
                {RINGS.map((r, i) => (
                    <div
                        key={`r${i}`}
                        className="absolute rounded-full border-2 border-foreground"
                        style={{
                            top: r.top,
                            left: r.left,
                            width: `${r.size}px`,
                            height: `${r.size}px`,
                            opacity: r.opacity,
                        }}
                    />
                ))}

                {/* Sparkles */}
                {SPARKLES.map((s, i) => (
                    <Sparkle
                        key={`s${i}`}
                        className="absolute animate-twinkle text-foreground"
                        style={{
                            top: s.top,
                            left: s.left,
                            width: `${s.size}px`,
                            height: `${s.size}px`,
                            opacity: s.opacity,
                            animationDelay: `${s.delay}s`,
                        }}
                    />
                ))}

                <div className="relative z-10 flex flex-col items-center gap-10 max-w-2xl text-center">
                    <div className="flex items-end gap-4 md:gap-8">
                        <div
                            className="text-7xl md:text-9xl font-black tracking-tighter select-none text-foreground"
                            style={{ transform: "rotate(-8deg)" }}
                        >
                            404
                        </div>
                        <div className="animate-float">
                            <Astronaut className="w-40 h-44 md:w-56 md:h-64" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
                </div>
            </main>
        </div>
    );
}
