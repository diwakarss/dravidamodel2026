"use client";

import { SchemeCard } from "./SchemeCard";

// Support both old string format and new localized format
interface Scheme {
  id: string;
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
}

interface SchemesGridProps {
  schemes: Scheme[];
  locale: string;
  title?: { en: string; ta: string };
  subtitle?: { en: string; ta: string };
}

export function SchemesGrid({
  schemes,
  locale,
  title,
  subtitle,
}: SchemesGridProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 bg-white">
          <h2 className="font-display text-xl font-bold text-navy-900">
            {locale === "ta" ? title.ta : title.en}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">
              {locale === "ta" ? subtitle.ta : subtitle.en}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              name={scheme.name}
              description={scheme.description}
              beneficiaries={scheme.beneficiaries}
              budget={scheme.budget}
              highlights={scheme.highlights}
              icon={scheme.icon}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
