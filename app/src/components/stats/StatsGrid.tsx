import { StatCard } from "./StatCard";
import { getStats } from "@/lib/data/projects";
import { formatBudgetCompact } from "@/lib/utils/format";

interface StatsGridProps {
  locale: string;
}

export function StatsGrid({ locale }: StatsGridProps) {
  const stats = getStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        value={stats.total}
        label={locale === "ta" ? "மொத்த திட்டங்கள்" : "Total Projects"}
        labelTamil={locale !== "ta" ? "மொத்த திட்டங்கள்" : undefined}
      />
      <StatCard
        value={formatBudgetCompact(stats.totalBudget)}
        label={locale === "ta" ? "மொத்த முதலீடு" : "Total Investment"}
        labelTamil={locale !== "ta" ? "மொத்த முதலீடு" : undefined}
      />
      <StatCard
        value={stats.districtsCount}
        label={locale === "ta" ? "மாவட்டங்கள்" : "Districts"}
        labelTamil={locale !== "ta" ? "மாவட்டங்கள்" : undefined}
        variant="accent"
      />
      <StatCard
        value={`${Math.round((stats.byStatus.Completed / stats.total) * 100)}%`}
        label={locale === "ta" ? "நிறைவடைந்தவை" : "Completed"}
        labelTamil={locale !== "ta" ? "நிறைவடைந்தவை" : undefined}
      />
    </div>
  );
}
