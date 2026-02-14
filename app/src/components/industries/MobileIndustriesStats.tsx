"use client";

import { industriesSummary, getIndustriesStats } from "@/lib/data/industries";

interface MobileIndustriesStatsProps {
  locale: string;
}

export function MobileIndustriesStats({ locale }: MobileIndustriesStatsProps) {
  const stats = getIndustriesStats();

  return (
    <div className="bg-white border-b border-slate-200 px-2 py-1.5">
      <div className="grid grid-cols-4 gap-1">
        {/* Total Projects */}
        <div className="text-center px-1">
          <p className="text-base font-bold text-navy-900 leading-none">{stats.totalParks}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "திட்டங்கள்" : "Projects"}
          </p>
        </div>

        {/* Total Investment */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-amber-700 leading-none">₹8.17L Cr</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "முதலீடு" : "Investment"}
          </p>
        </div>

        {/* Jobs */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-teal-700 leading-none">28.9L</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "வேலைகள்" : "Jobs"}
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-green-700 leading-none">82.2%</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "நிறைவேற்றம்" : "Converted"}
          </p>
        </div>
      </div>
    </div>
  );
}
