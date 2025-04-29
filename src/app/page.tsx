"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const SUPPORTED_LOCALES = ["en", "fr"];
const DEFAULT_LOCALE = "en";

export default function RootRedirectPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    let frame: number;
    let start: number | null = null;
    const duration = 500; // ms

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);
      if (elapsed < duration) {
        frame = requestAnimationFrame(animate);
      }
    }
    frame = requestAnimationFrame(animate);

    // Redirect after timeout
    const timeout = setTimeout(() => {
      let preferred = DEFAULT_LOCALE;
      if (typeof navigator !== "undefined") {
        const lang = navigator.language.split("-")[0];
        if (SUPPORTED_LOCALES.includes(lang)) {
          preferred = lang;
        }
      }
      router.replace(`/${preferred}`);
    }, duration);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <span className="mt-6 text-lg text-muted-foreground">Loading…</span>
      <div className="w-64">
        <Progress value={progress} />
      </div>
    </div>
  );
}
