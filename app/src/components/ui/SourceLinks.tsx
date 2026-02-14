"use client";

import { cn } from "@/lib/utils/cn";

export interface Source {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

interface SourceLinksProps {
  sources: Source[];
  locale: string;
  className?: string;
  maxVisible?: number;
}

// Sort sources: government first, then media, then other
function sortSources(sources: Source[]): Source[] {
  const priority: Record<string, number> = {
    government: 0,
    media: 1,
    other: 2,
  };
  return [...sources].sort((a, b) => {
    const aPriority = priority[a.type || "other"] ?? 2;
    const bPriority = priority[b.type || "other"] ?? 2;
    return aPriority - bPriority;
  });
}

// Check if URL is a government source
function isGovSource(url: string): boolean {
  const govDomains = [
    ".gov.in",
    ".tn.gov.in",
    "tn.gov.in",
    "pib.gov.in",
    "pmindia.gov.in",
    "india.gov.in",
  ];
  return govDomains.some((domain) => url.includes(domain));
}

export function SourceLinks({
  sources,
  locale,
  className,
  maxVisible = 2,
}: SourceLinksProps) {
  if (!sources || sources.length === 0) return null;

  // Auto-detect government sources if type not specified
  const sourcesWithType = sources.map((s) => ({
    ...s,
    type: s.type || (isGovSource(s.url) ? "government" : "other"),
  }));

  const sorted = sortSources(sourcesWithType);
  const visible = sorted.slice(0, maxVisible);
  const remaining = sorted.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      <span className="text-slate-500 font-medium">
        {locale === "ta" ? "ஆதாரம்:" : "Sources:"}
      </span>
      {visible.map((source, idx) => (
        <a
          key={idx}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
            source.type === "government"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          title={source.title}
        >
          {source.type === "government" && (
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="truncate max-w-[120px]">{source.title}</span>
        </a>
      ))}
      {remaining > 0 && (
        <span className="text-slate-400 text-xs">+{remaining} more</span>
      )}
    </div>
  );
}

// Compact version for smaller cards
export function SourceLinksCompact({
  sources,
  locale,
}: {
  sources: Source[];
  locale: string;
}) {
  if (!sources || sources.length === 0) return null;

  const hasGovSource = sources.some(
    (s) => s.type === "government" || isGovSource(s.url)
  );

  return (
    <div className="flex items-center gap-1 text-xs text-slate-500">
      {hasGovSource && (
        <span className="inline-flex items-center gap-0.5 text-green-700">
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {locale === "ta" ? "அரசு" : "Govt"}
        </span>
      )}
      <span>
        {sources.length} {locale === "ta" ? "ஆதாரங்கள்" : "sources"}
      </span>
    </div>
  );
}
