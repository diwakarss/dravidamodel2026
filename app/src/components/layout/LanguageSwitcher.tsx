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
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-label={
          locale === "en" ? "Current language: English" : "Switch to English"
        }
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
        type="button"
        onClick={() => switchLocale("ta")}
        aria-label={
          locale === "ta" ? "Current language: Tamil" : "Switch to Tamil"
        }
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
  );
}
