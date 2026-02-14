"use client";

import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils/cn";

export type TabId =
  | "infrastructure"
  | "industries"
  | "education"
  | "healthcare"
  | "welfare"
  | "employment"
  | "history"
  | "agriculture"
  | "environment"
  | "sports";

interface Tab {
  id: TabId;
  label: { en: string; ta: string };
  enabled: boolean;
}

const TABS: Tab[] = [
  {
    id: "infrastructure",
    label: { en: "Infrastructure", ta: "உள்கட்டமைப்பு" },
    enabled: true,
  },
  {
    id: "industries",
    label: { en: "Industries", ta: "தொழிற்சாலை" },
    enabled: true,
  },
  {
    id: "education",
    label: { en: "Education", ta: "கல்வி" },
    enabled: true,
  },
  {
    id: "healthcare",
    label: { en: "Healthcare", ta: "சுகாதாரம்" },
    enabled: true,
  },
  {
    id: "welfare",
    label: { en: "Welfare", ta: "நலத்திட்டம்" },
    enabled: true,
  },
  {
    id: "employment",
    label: { en: "Employment", ta: "வேலைவாய்ப்பு" },
    enabled: true,
  },
  {
    id: "history",
    label: { en: "Tamil History", ta: "தமிழ் வரலாறு" },
    enabled: true,
  },
  {
    id: "agriculture",
    label: { en: "Agriculture", ta: "வேளாண்மை" },
    enabled: true,
  },
  {
    id: "environment",
    label: { en: "Green Energy", ta: "பசுமை ஆற்றல்" },
    enabled: true,
  },
  {
    id: "sports",
    label: { en: "Sports & Culture", ta: "விளையாட்டு & கலாச்சாரம்" },
    enabled: true,
  },
];

interface HeaderProps {
  locale: string;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  showTabs?: boolean;
}

export function Header({
  locale,
  activeTab = "infrastructure",
  onTabChange,
  showTabs = true,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const skipToContentLabel =
    locale === "ta" ? "உள்ளடக்கத்திற்கு செல்" : "Skip to content";

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <>
      <a href="#main-content" className="skip-link">
        {skipToContentLabel}
      </a>
      <header className="border-b border-slate-200 bg-white relative z-[1000]">
        {/* Large Desktop Header (1440px+) - Show all tabs inline */}
        <div className="hidden 2xl:flex items-center justify-between px-4 py-2">
          {/* Left: Title stacked */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 leading-tight">
              {locale === "ta" ? "திராவிட மாடல்" : "Dravida Model"}
            </h1>
            <p className="text-sm text-slate-700 font-semibold">
              {locale === "ta" ? "காட்சியகம் 2021–26" : "Showcase 2021–26"}
            </p>
          </div>

          {/* Center: All Tabs visible */}
          {showTabs && onTabChange && (
            <nav className="flex-1 flex justify-center mx-4">
              <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => tab.enabled && onTabChange(tab.id)}
                    disabled={!tab.enabled}
                    className={cn(
                      "relative px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-white text-navy-900 shadow-sm"
                        : tab.enabled
                          ? "text-slate-700 hover:text-slate-900"
                          : "text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {locale === "ta" ? tab.label.ta : tab.label.en}
                  </button>
                ))}
              </div>
            </nav>
          )}
          {!showTabs && <div className="flex-1" />}

          {/* Right: Language Switcher */}
          <div className="flex-shrink-0">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {/* Tablet/Small Desktop Header (768px - 1440px) - Dropdown menu */}
        <div className="hidden md:flex 2xl:hidden items-center justify-between px-4 py-2">
          {/* Left: Title stacked */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-navy-900 leading-tight">
              {locale === "ta" ? "திராவிட மாடல்" : "Dravida Model"}
            </h1>
            <p className="text-xs text-slate-700 font-semibold">
              {locale === "ta" ? "காட்சியகம் 2021–26" : "Showcase 2021–26"}
            </p>
          </div>

          {/* Center: Dropdown */}
          {showTabs && onTabChange && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg"
              >
                <span className="text-sm font-semibold text-navy-900">
                  {activeTabData
                    ? locale === "ta"
                      ? activeTabData.label.ta
                      : activeTabData.label.en
                    : ""}
                </span>
                <svg
                  className={cn(
                    "w-4 h-4 text-slate-600 transition-transform",
                    menuOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[1001]">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (tab.enabled) {
                          onTabChange(tab.id);
                          setMenuOpen(false);
                        }
                      }}
                      disabled={!tab.enabled}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm font-medium text-left transition-colors",
                        activeTab === tab.id
                          ? "bg-navy-900 text-white"
                          : tab.enabled
                            ? "text-slate-700 hover:bg-slate-50"
                            : "text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {locale === "ta" ? tab.label.ta : tab.label.en}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right: Language Switcher */}
          <div className="flex-shrink-0">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {/* Mobile Header (< 768px) */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left: Compact title */}
            <div className="flex-shrink-0">
              <h1 className="font-display text-lg font-bold tracking-tight text-navy-900">
                {locale === "ta" ? "திராவிட மாடல்" : "Dravida Model"}
              </h1>
            </div>

            {/* Center: Current tab dropdown */}
            {showTabs && onTabChange && (
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <span className="text-sm font-semibold text-navy-900">
                  {activeTabData
                    ? locale === "ta"
                      ? activeTabData.label.ta
                      : activeTabData.label.en
                    : ""}
                </span>
                <svg
                  className={cn(
                    "w-4 h-4 text-slate-600 transition-transform",
                    menuOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}

            {/* Right: Language Switcher */}
            <div className="flex-shrink-0">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>

          {/* Mobile Tab Menu (dropdown) */}
          {menuOpen && showTabs && onTabChange && (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 relative z-[1001]">
              <div className="grid grid-cols-2 gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.enabled) {
                        onTabChange(tab.id);
                        setMenuOpen(false);
                      }
                    }}
                    disabled={!tab.enabled}
                    className={cn(
                      "px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors text-left",
                      activeTab === tab.id
                        ? "bg-navy-900 text-white"
                        : tab.enabled
                          ? "bg-white text-slate-700 border border-slate-200"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {locale === "ta" ? tab.label.ta : tab.label.en}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Backdrop for dropdown */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
