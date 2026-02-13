"use client";

import { SchemesGrid } from "@/components/schemes";
import { employmentSchemes, getEmploymentStats } from "@/lib/data/employment";

interface EmploymentTabProps {
  locale: string;
}

export function EmploymentTab({ locale }: EmploymentTabProps) {
  const stats = getEmploymentStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "வேலைவாய்ப்பு" : "Employment"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">{(stats.studentsTrained / 100000).toFixed(0)}L</p>
              <p className="text-xs text-orange-200">{locale === "ta" ? "பயிற்சி" : "Trained"}</p>
            </div>
            <div className="w-px h-8 bg-orange-400" />
            <div>
              <p className="text-lg font-bold">{(stats.totalPlacements / 100000).toFixed(0)}L</p>
              <p className="text-xs text-orange-200">{locale === "ta" ? "வேலை" : "Placed"}</p>
            </div>
            <div className="w-px h-8 bg-orange-400" />
            <div>
              <p className="text-lg font-bold">{(stats.activeStartups / 1000).toFixed(0)}K</p>
              <p className="text-xs text-orange-200">{locale === "ta" ? "ஸ்டார்ட்அப்" : "Startups"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "வேலைவாய்ப்பு திட்டங்கள்" : "Employment Schemes"}
            </h2>
            <p className="text-orange-100 text-base mt-1">
              {locale === "ta"
                ? "திறன் மேம்பாடு மற்றும் வேலைவாய்ப்பு"
                : "Skill development and employment generation"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">{(stats.studentsTrained / 100000).toFixed(0)} Lakh</p>
              <p className="text-base text-orange-100">
                {locale === "ta" ? "பயிற்சி பெற்றவர்கள்" : "Students Trained"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{(stats.totalPlacements / 100000).toFixed(0)} Lakh</p>
              <p className="text-base text-orange-100">
                {locale === "ta" ? "வேலை வாய்ப்பு" : "Placements"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{(stats.activeStartups / 1000).toFixed(0)}K+</p>
              <p className="text-base text-orange-100">
                {locale === "ta" ? "செயலில் ஸ்டார்ட்அப்கள்" : "Active Startups"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={employmentSchemes} locale={locale} />
      </div>
    </div>
  );
}
