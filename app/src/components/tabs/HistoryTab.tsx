"use client";

import { SchemesGrid } from "@/components/schemes";
import { historySchemes, getHistoryStats } from "@/lib/data/tamilHistory";

interface HistoryTabProps {
  locale: string;
}

export function HistoryTab({ locale }: HistoryTabProps) {
  const stats = getHistoryStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-amber-700 to-amber-800 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "தமிழ் வரலாறு" : "Tamil History"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">{stats.excavationSites}</p>
              <p className="text-xs text-amber-200">{locale === "ta" ? "தளங்கள்" : "Sites"}</p>
            </div>
            <div className="w-px h-8 bg-amber-500" />
            <div>
              <p className="text-lg font-bold">18K+</p>
              <p className="text-xs text-amber-200">{locale === "ta" ? "தொல்பொருட்கள்" : "Artifacts"}</p>
            </div>
            <div className="w-px h-8 bg-amber-500" />
            <div>
              <p className="text-lg font-bold">3.2K</p>
              <p className="text-xs text-amber-200">{locale === "ta" ? "ஆண்டுகள்" : "Years"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-amber-700 to-amber-800 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "தமிழ் வரலாறு & தொல்லியல்" : "Tamil History & Archaeology"}
            </h2>
            <p className="text-amber-100 text-base mt-1">
              {locale === "ta"
                ? "பண்டைய தமிழ் நாகரிகத்தை வெளிப்படுத்துதல்"
                : "Uncovering ancient Tamil civilization"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">{stats.excavationSites}</p>
              <p className="text-base text-amber-100">
                {locale === "ta" ? "அகழாய்வு தளங்கள்" : "Excavation Sites"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">18,000+</p>
              <p className="text-base text-amber-100">
                {locale === "ta" ? "தொல்பொருட்கள்" : "Artifacts Discovered"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">3,200</p>
              <p className="text-base text-amber-100">
                {locale === "ta" ? "ஆண்டுகள் பழமை" : "Years of History"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={historySchemes} locale={locale} />
      </div>
    </div>
  );
}
