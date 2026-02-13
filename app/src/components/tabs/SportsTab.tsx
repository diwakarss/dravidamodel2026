"use client";

import { SchemesGrid } from "@/components/schemes";
import { sportsCultureSchemes, getSportsCultureStats } from "@/lib/data/sportsCulture";

interface SportsTabProps {
  locale: string;
}

export function SportsTab({ locale }: SportsTabProps) {
  const stats = getSportsCultureStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "விளையாட்டு & கலாச்சாரம்" : "Sports & Culture"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">{stats.chessCountries}</p>
              <p className="text-xs text-rose-200">{locale === "ta" ? "நாடுகள்" : "Countries"}</p>
            </div>
            <div className="w-px h-8 bg-rose-400" />
            <div>
              <p className="text-lg font-bold">₹3Cr</p>
              <p className="text-xs text-rose-200">{locale === "ta" ? "தங்கம்" : "Gold"}</p>
            </div>
            <div className="w-px h-8 bg-rose-400" />
            <div>
              <p className="text-lg font-bold">44K</p>
              <p className="text-xs text-rose-200">{locale === "ta" ? "கோவில்கள்" : "Temples"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "விளையாட்டு & கலாச்சாரம்" : "Sports & Culture"}
            </h2>
            <p className="text-rose-100 text-base mt-1">
              {locale === "ta"
                ? "விளையாட்டு சிறப்பு & கலை பாரம்பரியம்"
                : "Sports excellence & cultural heritage"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">{stats.chessCountries}</p>
              <p className="text-base text-rose-100">
                {locale === "ta" ? "ஒலிம்பியாட் நாடுகள்" : "Chess Olympiad Nations"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹3 Crore</p>
              <p className="text-base text-rose-100">
                {locale === "ta" ? "ஒலிம்பிக் தங்கம்" : "Olympic Gold Prize"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">44,000+</p>
              <p className="text-base text-rose-100">
                {locale === "ta" ? "கோவில்கள் பாதுகாப்பு" : "Temples Conserved"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={sportsCultureSchemes} locale={locale} />
      </div>
    </div>
  );
}
