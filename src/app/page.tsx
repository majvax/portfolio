"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PREFERRED_LANG_KEY } from "@/components/language-switch";

const SUPPORTED_LOCALES = ["en", "fr"];
const DEFAULT_LOCALE = "en";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let preferred = DEFAULT_LOCALE;

    try {
      const saved = localStorage.getItem(PREFERRED_LANG_KEY);
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        router.replace(`/${saved}`);
        return;
      }
    } catch {
      // localStorage unavailable — fall through to navigator detection
    }

    if (typeof navigator !== "undefined") {
      const lang = navigator.language.split("-")[0];
      if (SUPPORTED_LOCALES.includes(lang)) {
        preferred = lang;
      }
    }
    router.replace(`/${preferred}`);
  }, [router]);

  return (
    <noscript>
      <meta httpEquiv="refresh" content="0; url=/en" />
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>JavaScript is disabled. Choose a language:</p>
        <p>
          <a href="/en">English</a> · <a href="/fr">Français</a>
        </p>
      </div>
    </noscript>
  );
}
