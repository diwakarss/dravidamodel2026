"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Container } from "./Container";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
      <Container className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
              2021-2026
            </p>
            <h1 className="font-display text-xl md:text-2xl font-bold">
              {locale === "ta"
                ? "தமிழ்நாடு உள்கட்டமைப்பு காட்சியகம்"
                : "Tamil Nadu Infrastructure Showcase"}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchLocale("en")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                locale === "en"
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white"
              )}
            >
              EN
            </button>
            <button
              onClick={() => switchLocale("ta")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded transition-colors font-tamil",
                locale === "ta"
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white"
              )}
            >
              த
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
