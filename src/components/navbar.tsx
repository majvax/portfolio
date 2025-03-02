"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const NavLinks: { name: string, href: string }[] = [
    // { name: "Home", href: "#home" },
    // { name: "Education", href: "#education" },
    // { name: "About", href: "#about" },
    // { name: "Skills", href: "#skills" },
    // { name: "Projects", href: "#projects" },
    // { name: "Experience", href: "#experience" },
    // { name: "Contact", href: "#contact" },
];

export function Navbar({ className = "" }: { className?: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${className}`}>
            <nav className="mx-auto max-w-[1400px] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="#home" className="text-xl font-bold">
                    Guillaume Dehez
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:gap-6">
                    {NavLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <ThemeToggle />
                </div>

                {/* Mobile Navigation Toggle */}
                <button
                    className="block md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
                    <div className="flex flex-col p-4 space-y-4">
                        {NavLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-medium py-2 transition-colors hover:text-primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                    setIsMenuOpen(false);
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
