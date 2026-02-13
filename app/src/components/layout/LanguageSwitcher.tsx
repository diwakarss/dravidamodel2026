"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    // Preserve the hash (tab state) when switching languages
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.push(newPath + hash);
  };

  return (
    <div className="flex gap-1 bg-navy-100 rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-label={
          locale === "en" ? "Current language: English" : "Switch to English"
        }
        className={cn(
          "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
          locale === "en"
            ? "bg-navy-900 text-white"
            : "text-navy-600 hover:text-navy-800"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("ta")}
        aria-label={
          locale === "ta" ? "Current language: Tamil" : "Switch to Tamil"
        }
        className={cn(
          "px-2.5 py-1 text-xs font-medium rounded-md transition-colors font-tamil",
          locale === "ta"
            ? "bg-navy-900 text-white"
            : "text-navy-600 hover:text-navy-800"
        )}
      >
        தமிழ்
      </button>
    </div>
  );
}
