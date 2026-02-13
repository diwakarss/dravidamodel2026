"use client";

import { getStats } from "@/lib/data/projects";
import { formatBudgetCompact } from "@/lib/utils/format";

interface MobileStatsBarProps {
  locale: string;
}

export function MobileStatsBar({ locale }: MobileStatsBarProps) {
  const stats = getStats();

  return (
    <div className="bg-white border-b border-slate-200 px-3 py-2">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {/* Total Projects */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-navy-900">{stats.total}</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "திட்டங்கள்" : "Projects"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* Investment */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-navy-900">
            {formatBudgetCompact(stats.totalBudget)}
          </span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "முதலீடு" : "Investment"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* Districts */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-teal-700">{stats.districtsCount}</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "மாவட்டங்கள்" : "Districts"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-300" />

        {/* Completed */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg font-bold text-green-700">{stats.byStatus.Completed}</span>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {locale === "ta" ? "நிறைவு" : "Completed"}
          </span>
        </div>
      </div>
    </div>
  );
}
