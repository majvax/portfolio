import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SITE_URL, THEME_COLOR } from "@/lib/seo"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "Guillaume Dehez - Portfolio",
    description: "Personal portfolio of Guillaume Dehez - Software Engineer",
}

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
        { media: "(prefers-color-scheme: dark)", color: THEME_COLOR },
    ],
}

const setHtmlLangScript = `
    var p = location.pathname;
    if (p.startsWith('/fr')) document.documentElement.lang = 'fr';
    else document.documentElement.lang = 'en';
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className="scroll-smooth">
            <head>
                <script dangerouslySetInnerHTML={{ __html: setHtmlLangScript }} />
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
