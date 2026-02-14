"use client";

import { getStats } from "@/lib/data/projects";
import { formatBudgetCompact } from "@/lib/utils/format";

interface MobileStatsBarProps {
  locale: string;
}

export function MobileStatsBar({ locale }: MobileStatsBarProps) {
  const stats = getStats();

  return (
    <div className="bg-white border-b border-slate-200 px-2 py-1.5">
      <div className="grid grid-cols-4 gap-1">
        {/* Total Projects */}
        <div className="text-center px-1">
          <p className="text-base font-bold text-navy-900 leading-none">{stats.total}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "திட்டங்கள்" : "Projects"}
          </p>
        </div>

        {/* Investment */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-navy-900 leading-none">
            {formatBudgetCompact(stats.totalBudget)}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "முதலீடு" : "Investment"}
          </p>
        </div>

        {/* Districts */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-teal-700 leading-none">
            {stats.districtsCount}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "மாவட்டம்" : "Districts"}
          </p>
        </div>

        {/* Completed */}
        <div className="text-center px-1 border-l border-slate-200">
          <p className="text-base font-bold text-green-700 leading-none">{stats.byStatus.Completed}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
            {locale === "ta" ? "நிறைவு" : "Done"}
          </p>
        </div>
      </div>
    </div>
  );
}
