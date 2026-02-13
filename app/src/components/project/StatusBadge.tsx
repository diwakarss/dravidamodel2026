import { cn } from "@/lib/utils/cn";
import type { ProjectStatus } from "@/lib/schemas/project";

interface StatusBadgeProps {
  status: ProjectStatus;
  locale?: string;
  className?: string;
}

const statusConfig: Record<
  ProjectStatus,
  { bg: string; text: string; label: { en: string; ta: string } }
> = {
  Completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: { en: "Completed", ta: "நிறைவு" },
  },
  Ongoing: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: { en: "Ongoing", ta: "நடப்பில்" },
  },
  Planned: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: { en: "Planned", ta: "திட்டமிடப்பட்டது" },
  },
};

export function StatusBadge({
  status,
  locale = "en",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full",
        config.bg,
        config.text,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {locale === "ta" ? config.label.ta : config.label.en}
    </span>
  );
}
