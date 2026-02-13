"use client";

import { industriesSummary, getIndustriesStats } from "@/lib/data/industries";

interface MobileIndustriesStatsProps {
  locale: string;
}

export function MobileIndustriesStats({ locale }: MobileIndustriesStatsProps) {
  const stats = getIndustriesStats();

  return (
    <div className="bg-white border-b border-slate-200 px-3 py-2">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {/* Total Projects */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-navy-900">{stats.totalParks}</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "திட்டங்கள்" : "Projects"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* Total Investment */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-amber-700">₹8.17L Cr</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "முதலீடு" : "Committed"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* Jobs */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-teal-700">28.9L</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "வேலைகள்" : "Jobs"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* MoUs */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-purple-700">{industriesSummary.totalMoUs}</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "புரிந்துணர்வு" : "MoUs"}
          </span>
        </div>
      </div>
    </div>
  );
}
