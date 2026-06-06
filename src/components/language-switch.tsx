"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import Link from "next/link"

const SUPPORTED_LANGS = ["en", "fr"] as const
export const PREFERRED_LANG_KEY = "preferred-lang"

export function LanguageSwitcher({ currentLang, onSelect }: { currentLang: "en" | "fr"; onSelect?: () => void }) {
    const pathname = usePathname()

    const handleClick = (lang: string) => {
        try {
            localStorage.setItem(PREFERRED_LANG_KEY, lang)
        } catch {
            // localStorage may be unavailable (private mode, etc.) — ignore
        }
        onSelect?.()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {SUPPORTED_LANGS.map((lang) => (
                    <DropdownMenuItem asChild key={lang} disabled={lang === currentLang}>
                        <Link
                            href={pathname.replace(/^\/[a-z]{2}/, `/${lang}`)}
                            aria-current={lang === currentLang ? "page" : undefined}
                            aria-label={`Switch to ${lang === "en" ? "English" : "French"}`}
                            onClick={() => handleClick(lang)}
                        >
                            {lang.toUpperCase()}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
