"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/schemas/project";
import { formatBudgetCompact } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface SummaryDashboardProps {
  projects: Project[];
  totalProjectCount: number;
  locale: string;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Completed: "bg-green-500",
  Ongoing: "bg-blue-500",
  Planned: "bg-slate-400",
};

const STATUS_LABELS: Record<ProjectStatus, { en: string; ta: string }> = {
  Completed: { en: "Completed", ta: "முடிவடைந்தது" },
  Ongoing: { en: "Ongoing", ta: "நடப்பில்" },
  Planned: { en: "Planned", ta: "திட்டமிடப்பட்டது" },
};

export function SummaryDashboard({
  projects,
  totalProjectCount,
  locale,
}: SummaryDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = useMemo(() => {
    const byStatus: Record<ProjectStatus, number> = {
      Completed: 0,
      Ongoing: 0,
      Planned: 0,
    };
    let totalBudget = 0;
    const districts = new Set<string>();

    for (const p of projects) {
      byStatus[p.status]++;
      totalBudget += p.budget?.crore ?? 0;
      districts.add(p.location.district);
    }

    const completionRate = projects.length > 0
      ? Math.round((byStatus.Completed / projects.length) * 100)
      : 0;

    return {
      total: projects.length,
      byStatus,
      totalBudget,
      districtsCount: districts.size,
      completionRate,
    };
  }, [projects]);

  const isFiltered = projects.length !== totalProjectCount;

  const labels = {
    projects: locale === "ta" ? "திட்டங்கள்" : "Projects",
    investment: locale === "ta" ? "முதலீடு" : "Investment",
    districts: locale === "ta" ? "மாவட்டங்கள்" : "Districts",
    showing: locale === "ta" ? "காட்டுகிறது" : "Showing",
    of: locale === "ta" ? "இல்" : "of",
    showStats: locale === "ta" ? "புள்ளிவிவரங்கள்" : "Show Statistics",
    hideStats: locale === "ta" ? "மறை" : "Hide",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Mobile: collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full flex items-center justify-between p-4"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-navy-900">{stats.total}</span>
          <span className="text-slate-600">{labels.projects}</span>
          {isFiltered && (
            <span className="text-xs text-slate-500">
              ({labels.of} {totalProjectCount})
            </span>
          )}
        </div>
        <svg
          className={cn("w-5 h-5 text-slate-400 transition-transform", isExpanded && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Stats grid - expanded on mobile when toggled, always visible on desktop */}
      <div className={cn("md:block", isExpanded ? "block" : "hidden")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 pt-0 md:pt-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{labels.projects}</p>
            <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
            {isFiltered && (
              <p className="text-xs text-slate-500">
                {labels.of} {totalProjectCount}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{labels.investment}</p>
            <p className="text-2xl font-bold text-teal-600">{formatBudgetCompact(stats.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{labels.districts}</p>
            <p className="text-2xl font-bold text-navy-900">{stats.districtsCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {locale === "ta" ? "முடிவடைந்தது" : "Completed"}
            </p>
            <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
          </div>
        </div>

        {/* Status breakdown bar */}
        <div className="px-4 pb-4">
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
            {(["Completed", "Ongoing", "Planned"] as ProjectStatus[]).map((status) => {
              const count = stats.byStatus[status];
              const width = stats.total > 0 ? (count / stats.total) * 100 : 0;
              if (width === 0) return null;
              return (
                <div
                  key={status}
                  className={cn(STATUS_COLORS[status])}
                  style={{ width: `${Math.max(width, 2)}%` }}
                  title={`${STATUS_LABELS[status][locale === "ta" ? "ta" : "en"]}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {(["Completed", "Ongoing", "Planned"] as ProjectStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[status])} />
                <span>{stats.byStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
