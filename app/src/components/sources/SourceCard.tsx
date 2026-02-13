import type { SourceEntry } from "@/lib/schemas/source";
import { cn } from "@/lib/utils/cn";

interface SourceCardProps {
  source: SourceEntry;
  locale: string;
  className?: string;
}

const CATEGORY_STYLES = {
  government: "border-l-navy-600",
  media: "border-l-teal-500",
  reports: "border-l-amber-500",
  other: "border-l-slate-400",
};

const CATEGORY_LABELS = {
  government: { en: "Government", ta: "அரசு" },
  media: { en: "Media", ta: "ஊடகம்" },
  reports: { en: "Reports", ta: "அறிக்கைகள்" },
  other: { en: "Other", ta: "பிற" },
};

export function SourceCard({ source, locale, className }: SourceCardProps) {
  const name = locale === "ta" ? source.name.ta : source.name.en;
  const description = locale === "ta" ? source.description.ta : source.description.en;
  const categoryLabel =
    locale === "ta"
      ? CATEGORY_LABELS[source.category].ta
      : CATEGORY_LABELS[source.category].en;

  const displayUrl = source.url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block p-4 bg-white rounded-lg border border-slate-200 border-l-4 transition-all hover:shadow-md hover:border-slate-300",
        CATEGORY_STYLES[source.category],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-navy-900 truncate">{name}</h3>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
              {categoryLabel}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
          <p className="text-xs text-slate-400 mt-2 truncate">{displayUrl}</p>
        </div>
        <svg
          className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
}
