import { cn } from "@/lib/utils/cn";
import type { ProjectType } from "@/lib/schemas/project";

interface TypeBadgeProps {
  type: ProjectType;
  className?: string;
}

const typeIcons: Record<ProjectType, React.ReactNode> = {
  "Public Transport": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16c0 1.1.9 2 2 2h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h6v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c1.1 0 2-.9 2-2V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
    </svg>
  ),
  "Roads/Highways": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 3v3h2V3h3v4h-3v3h2V7h3v4.5h-3V14h2v-2.5h3V17h-3v4h-3v-4h-2v4H8v-4H5v-5.5h3V9h2V6H7V3h4zm-2 8H6v2h3v-2z" />
    </svg>
  ),
  "Water/Sanitation": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z" />
    </svg>
  ),
  "Education/Health": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
    </svg>
  ),
  "Power/Utilities": (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
    </svg>
  ),
  Other: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
    </svg>
  ),
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const icon = typeIcons[type] || typeIcons["Other"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wide bg-slate-100 text-navy-700 rounded",
        className
      )}
    >
      {icon}
      {type}
    </span>
  );
}
