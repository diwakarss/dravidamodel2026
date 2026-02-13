"use client";

import { cn } from "@/lib/utils/cn";

interface FilterChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FilterChip({
  label,
  count,
  active = false,
  onClick,
  icon,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full border transition-all duration-150",
        !active &&
          "bg-white border-slate-200 text-slate-600 hover:border-navy-400",
        active && "bg-navy-900 border-navy-900 text-white",
        className
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            !active && "bg-slate-100",
            active && "bg-white/20"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
