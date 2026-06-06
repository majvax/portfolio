import { Navbar } from "@/components/navbar"


export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }>;} ) {
    const { lang } = await params as { lang: "en" | "fr" };
    return (
        <div className="flex flex-col h-screen">
            <Navbar className="fixed top-0 left-0 right-0 z-50" currentLang={lang}/>
            <main className="flex-1 overflow-y-auto snap-y snap-mandatory h-screen">
                {children}
            </main>
        </div>
    )
}
