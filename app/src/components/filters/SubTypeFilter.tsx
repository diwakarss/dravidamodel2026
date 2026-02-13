"use client";

import {
  Train,
  Route,
  Bus,
  Droplets,
  Zap,
  Cross,
  GraduationCap,
  Building2,
  Trophy,
  Landmark,
  Building,
  Ship,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { INFRASTRUCTURE_SUB_TYPES } from "@/lib/constants/subTypes";
import type { InfrastructureSubType } from "@/lib/schemas/project";

// Map icon names to components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Train,
  Route,
  Bus,
  Droplets,
  Zap,
  Cross,
  GraduationCap,
  Building2,
  Trophy,
  Landmark,
  Building,
  Ship,
};

interface SubTypeFilterProps {
  activeSubTypes: InfrastructureSubType[];
  onToggle: (subType: InfrastructureSubType) => void;
  counts: Record<InfrastructureSubType, number>;
  locale: string;
  compact?: boolean;
}

export function SubTypeFilter({
  activeSubTypes,
  onToggle,
  counts,
  locale,
  compact = false,
}: SubTypeFilterProps) {
  // Compact mode: horizontal pill layout for mobile
  if (compact) {
    return (
      <div
        role="group"
        aria-label={locale === "ta" ? "திட்ட வகை வடிப்பான்கள்" : "Project type filters"}
        className="flex flex-wrap gap-2"
      >
        {INFRASTRUCTURE_SUB_TYPES.map((subType) => {
          const IconComponent = ICON_MAP[subType.icon];
          const isActive = activeSubTypes.includes(subType.id);
          const count = counts[subType.id] || 0;

          if (count === 0) return null;

          return (
            <button
              key={subType.id}
              type="button"
              onClick={() => onToggle(subType.id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
                "border",
                isActive
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
              )}
            >
              {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
              <span>{locale === "ta" ? subType.label.ta : subType.label.en}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20" : "bg-slate-100"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: vertical list layout for desktop
  return (
    <div
      role="group"
      aria-label={locale === "ta" ? "திட்ட வகை வடிப்பான்கள்" : "Project type filters"}
      className="space-y-1"
    >
      {INFRASTRUCTURE_SUB_TYPES.map((subType) => {
        const IconComponent = ICON_MAP[subType.icon];
        const isActive = activeSubTypes.includes(subType.id);
        const count = counts[subType.id] || 0;

        // Skip if no projects of this type
        if (count === 0) return null;

        return (
          <button
            key={subType.id}
            type="button"
            onClick={() => onToggle(subType.id)}
            aria-pressed={isActive}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500",
              isActive && "bg-slate-100 ring-2 ring-navy-500"
            )}
          >
            {IconComponent && (
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  subType.color
                )}
              >
                <IconComponent className="w-4 h-4" />
              </span>
            )}
            <span className="flex-1 text-left text-slate-800">
              {locale === "ta" ? subType.label.ta : subType.label.en}
            </span>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                isActive
                  ? "bg-navy-900 text-white"
                  : "bg-slate-200 text-slate-700"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
