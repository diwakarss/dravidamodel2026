"use client";

import { SchemesGrid } from "@/components/schemes";
import { agricultureSchemes, getAgricultureStats } from "@/lib/data/agriculture";

interface AgricultureTabProps {
  locale: string;
}

export function AgricultureTab({ locale }: AgricultureTabProps) {
  const stats = getAgricultureStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-green-700 to-green-800 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "வேளாண்மை" : "Agriculture"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">21L</p>
              <p className="text-xs text-green-200">{locale === "ta" ? "விவசாயிகள்" : "Farmers"}</p>
            </div>
            <div className="w-px h-8 bg-green-500" />
            <div>
              <p className="text-lg font-bold">{stats.marketsCount}</p>
              <p className="text-xs text-green-200">{locale === "ta" ? "சந்தைகள்" : "Markets"}</p>
            </div>
            <div className="w-px h-8 bg-green-500" />
            <div>
              <p className="text-lg font-bold">60%</p>
              <p className="text-xs text-green-200">{locale === "ta" ? "நீர்ப்பாசனம்" : "Irrigated"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "வேளாண்மை திட்டங்கள்" : "Agriculture Schemes"}
            </h2>
            <p className="text-green-100 text-base mt-1">
              {locale === "ta"
                ? "விவசாயிகளின் நலனுக்கான திட்டங்கள்"
                : "Programs for farmer welfare"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">21+ Lakh</p>
              <p className="text-base text-green-100">
                {locale === "ta" ? "இலவச மின்சாரம்" : "Free Electricity"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.marketsCount}</p>
              <p className="text-base text-green-100">
                {locale === "ta" ? "உழவர் சந்தைகள்" : "Uzhavar Sandhais"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">60%+</p>
              <p className="text-base text-green-100">
                {locale === "ta" ? "நீர்ப்பாசன கவரேஜ்" : "Irrigation Coverage"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={agricultureSchemes} locale={locale} />
      </div>
    </div>
  );
}
