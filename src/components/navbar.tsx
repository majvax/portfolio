"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switch"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const NavLinks: { name: string, href: string }[] = [
    { name: "Blog", href: "/blog" },
];

export function Navbar({ className, currentLang }: { className: string; currentLang: "en" | "fr"; }) {
    const [open, setOpen] = useState(false);


    return (
        <header className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${className}`}>
            <nav className="mx-auto max-w-[1400px] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={`/${currentLang}`} className="text-3xl font-bold">
                    Guillaume Dehez
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:gap-6">
                    {NavLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={`/${currentLang}${link.href}`}
                            className="text-2xl font-semibold transition-colors hover:underline"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <LanguageSwitcher currentLang={currentLang} />
                    <ThemeToggle />
                </div>
    
                
                <div className="md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button aria-label="Open menu">
                                <Menu size={24} />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 flex flex-col h-full">
                            <SheetTitle className="sr-only">Main navigation</SheetTitle>
                            <div className="flex flex-col flex-1 justify-start items-stretch pt-8 px-8 gap-6">
                                <Link 
                                    key="Home"
                                    href={`/${currentLang}`}
                                    className="text-2xl font-semibold py-2 hover:underline"
                                    onClick={() => setOpen(false)}
                                >
                                    Home
                                </Link>
                                {NavLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={`/${currentLang}${link.href}`}
                                        className="text-2xl font-semibold py-2 hover:underline"
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-auto flex flex-row gap-4 p-8 border-t">
                                <ThemeToggle />
                                <LanguageSwitcher currentLang={currentLang} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
