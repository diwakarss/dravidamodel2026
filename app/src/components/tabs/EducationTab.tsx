"use client";

import { SchemesGrid } from "@/components/schemes";
import { educationSchemes, getEducationStats } from "@/lib/data/education";

interface EducationTabProps {
  locale: string;
}

export function EducationTab({ locale }: EducationTabProps) {
  const stats = getEducationStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "கல்வி" : "Education"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">₹55K Cr</p>
              <p className="text-xs text-blue-200">{locale === "ta" ? "பட்ஜெட்" : "Budget"}</p>
            </div>
            <div className="w-px h-8 bg-blue-400" />
            <div>
              <p className="text-lg font-bold">96L</p>
              <p className="text-xs text-blue-200">{locale === "ta" ? "மாணவர்" : "Students"}</p>
            </div>
            <div className="w-px h-8 bg-blue-400" />
            <div>
              <p className="text-lg font-bold">{stats.totalSchemes}</p>
              <p className="text-xs text-blue-200">{locale === "ta" ? "திட்டங்கள்" : "Schemes"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "கல்வி திட்டங்கள்" : "Education Schemes"}
            </h2>
            <p className="text-blue-100 text-base mt-1">
              {locale === "ta"
                ? "2021-2026 இல் முக்கிய கல்வி முன்னெடுப்புகள்"
                : "Key education initiatives 2021-2026"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">₹55,261 Cr</p>
              <p className="text-base text-blue-100">
                {locale === "ta" ? "மொத்த பட்ஜெட்" : "Total Budget"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">96 Lakh</p>
              <p className="text-base text-blue-100">
                {locale === "ta" ? "பயனாளிகள்" : "Beneficiaries"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">31,008</p>
              <p className="text-base text-blue-100">
                {locale === "ta" ? "பள்ளிகள்" : "Schools"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={educationSchemes} locale={locale} />
      </div>
    </div>
  );
}
