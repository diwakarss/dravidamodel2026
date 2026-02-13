"use client";

import { getStats } from "@/lib/data/projects";
import { formatBudgetCompact } from "@/lib/utils/format";

interface StatsPanelProps {
  locale: string;
}

export function StatsPanel({ locale }: StatsPanelProps) {
  const stats = getStats();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
        {locale === "ta" ? "புள்ளிவிவரங்கள்" : "Statistics"}
      </h2>

      {/* Total Projects */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-xl p-4">
        <p className="font-display text-4xl font-bold">{stats.total}</p>
        <p className="text-sm text-white/90 mt-1">
          {locale === "ta" ? "மொத்த திட்டங்கள்" : "Total Projects"}
        </p>
      </div>

      {/* Total Investment */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <p className="font-display text-2xl font-bold text-navy-900">
          {formatBudgetCompact(stats.totalBudget)}
        </p>
        <p className="text-sm text-slate-700 mt-1">
          {locale === "ta" ? "மொத்த முதலீடு" : "Total Investment"}
        </p>
      </div>

      {/* Districts Covered */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <p className="font-display text-2xl font-bold text-teal-700">
          {stats.districtsCount}
        </p>
        <p className="text-sm text-slate-700 mt-1">
          {locale === "ta" ? "மாவட்டங்கள்" : "Districts Covered"}
        </p>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
          {locale === "ta" ? "நிலை" : "Status"}
        </h3>

        <div className="space-y-3">
          {/* Completed */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700">
                {locale === "ta" ? "நிறைவு" : "Completed"}
              </span>
              <span className="font-semibold text-green-700">
                {stats.byStatus.Completed}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${Math.round((stats.byStatus.Completed / stats.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Ongoing */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700">
                {locale === "ta" ? "நடப்பு" : "Ongoing"}
              </span>
              <span className="font-semibold text-amber-700">
                {stats.byStatus.Ongoing}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${Math.round((stats.byStatus.Ongoing / stats.total) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Planned */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700">
                {locale === "ta" ? "திட்டமிடப்பட்ட" : "Planned"}
              </span>
              <span className="font-semibold text-blue-700">
                {stats.byStatus.Planned}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${Math.round((stats.byStatus.Planned / stats.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completed Investment */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-600 text-white rounded-xl p-4">
        <p className="font-display text-2xl font-bold">
          {formatBudgetCompact(stats.completedBudget)}
        </p>
        <p className="text-sm text-white/90 mt-1">
          {locale === "ta" ? "நிறைவு முதலீடு" : "Completed Investment"}
        </p>
      </div>

      {/* Footer Attribution */}
      <div className="pt-4 text-center">
        <p className="text-xs text-slate-500">
          Made with 🖤{" "}
          <a
            href="#"
            className="text-slate-600 hover:text-slate-800 font-medium hover:underline"
          >
            Nalan AI
          </a>
        </p>
      </div>
    </div>
  );
}
