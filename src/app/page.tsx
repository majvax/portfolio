"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "fr"];
const DEFAULT_LOCALE = "en";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let preferred = DEFAULT_LOCALE;
    if (typeof navigator !== "undefined") {
      const lang = navigator.language.split("-")[0];
      if (SUPPORTED_LOCALES.includes(lang)) {
        preferred = lang;
      }
    }
    router.replace(`/${preferred}`);
  }, [router]);

  return null;
}
