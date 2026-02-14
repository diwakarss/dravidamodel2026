"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { SourceLinks, type Source } from "@/components/ui/SourceLinks";

interface SchemeCardProps {
  name: { en: string; ta: string };
  description: { en: string; ta: string } | string;
  beneficiaries: {
    count: string;
    description: { en: string; ta: string } | string;
  };
  budget?: {
    amount: string;
    year?: string;
    details?: string;
  };
  highlights?: ({ en: string; ta: string } | string)[];
  icon: string;
  locale: string;
  onClick?: () => void;
  sources?: Source[];
}

// Helper to get localized text
function getLocalizedText(
  text: { en: string; ta: string } | string,
  locale: string
): string {
  if (typeof text === "string") return text;
  return locale === "ta" ? text.ta : text.en;
}

export function SchemeCard({
  name,
  description,
  beneficiaries,
  budget,
  highlights,
  icon,
  locale,
  onClick,
  sources,
}: SchemeCardProps) {
  return (
    <Card hover onClick={onClick} className="h-full flex flex-col">
      {/* Header with icon and name */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl" role="img" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
            {locale === "ta" ? name.ta : name.en}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-700 mb-4 line-clamp-3 sm:line-clamp-2">
        {getLocalizedText(description, locale)}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Beneficiaries */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
          <p className="text-sm uppercase tracking-wide text-teal-800 font-semibold mb-1">
            {locale === "ta" ? "பயனாளிகள்" : "Beneficiaries"}
          </p>
          <p className="text-lg font-bold text-slate-900">
            {beneficiaries.count}
          </p>
          <p className="text-xs sm:text-sm text-teal-700 mt-0.5 line-clamp-2 sm:line-clamp-1">
            {getLocalizedText(beneficiaries.description, locale)}
          </p>
        </div>

        {/* Budget */}
        {budget && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm uppercase tracking-wide text-amber-800 font-semibold mb-1">
              {locale === "ta" ? "நிதி ஒதுக்கீடு" : "Budget"}
            </p>
            <p className="text-lg font-bold text-slate-900">{budget.amount}</p>
            {budget.year && (
              <p className="text-sm text-amber-700 mt-0.5">{budget.year}</p>
            )}
          </div>
        )}
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="mt-auto pt-3 border-t border-slate-200">
          <ul className="space-y-1.5">
            {highlights.slice(0, 3).map((highlight, idx) => (
              <li
                key={idx}
                className="text-sm text-slate-700 flex items-start gap-2"
              >
                <span className="text-teal-600 font-bold mt-0.5">•</span>
                <span className="line-clamp-2 sm:line-clamp-1">
                  {getLocalizedText(highlight, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <SourceLinks sources={sources} locale={locale} maxVisible={2} />
        </div>
      )}
    </Card>
  );
}

// Compact version for smaller screens or dense layouts
export function SchemeCardCompact({
  name,
  beneficiaries,
  budget,
  icon,
  locale,
  onClick,
}: Omit<SchemeCardProps, "description" | "highlights">) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-lg border border-slate-200 p-3",
        "hover:border-teal-300 hover:shadow-md transition-all",
        "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base truncate">
            {locale === "ta" ? name.ta : name.en}
          </h3>
          <p className="text-sm text-slate-700">{beneficiaries.count}</p>
        </div>
        {budget && (
          <div className="text-right">
            <p className="text-base font-bold text-amber-700">{budget.amount}</p>
          </div>
        )}
      </div>
    </button>
  );
}
