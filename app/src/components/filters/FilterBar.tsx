"use client";

import { FilterChip } from "./FilterChip";
import type { ProjectType, ProjectStatus } from "@/lib/schemas/project";

interface FilterBarProps {
  activeTypes: ProjectType[];
  activeStatuses: ProjectStatus[];
  onToggleType: (type: ProjectType) => void;
  onToggleStatus: (status: ProjectStatus) => void;
  onClearAll: () => void;
  typeCounts: Record<ProjectType, number>;
  statusCounts: Record<ProjectStatus, number>;
  hasActiveFilters: boolean;
  locale: string;
}

const TYPE_ICONS: Record<ProjectType, React.ReactNode> = {
  "Public Transport": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4v4m-4-4h8l-1 4H9l-1-4zm-2-8h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  "Roads/Highways": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  "Water/Sanitation": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  "Education/Health": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  "Power/Utilities": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Other: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

const PROJECT_TYPES: ProjectType[] = [
  "Public Transport",
  "Roads/Highways",
  "Water/Sanitation",
  "Education/Health",
  "Power/Utilities",
  "Other",
];

const PROJECT_STATUSES: ProjectStatus[] = ["Completed", "Ongoing", "Planned"];

const TYPE_LABELS: Record<ProjectType, { en: string; ta: string }> = {
  "Public Transport": { en: "Transport", ta: "போக்குவரத்து" },
  "Roads/Highways": { en: "Roads", ta: "சாலைகள்" },
  "Water/Sanitation": { en: "Water", ta: "நீர்" },
  "Education/Health": { en: "Health", ta: "சுகாதாரம்" },
  "Power/Utilities": { en: "Power", ta: "மின்சாரம்" },
  Other: { en: "Other", ta: "பிற" },
};

const STATUS_LABELS: Record<ProjectStatus, { en: string; ta: string }> = {
  Completed: { en: "Completed", ta: "முடிவடைந்தது" },
  Ongoing: { en: "Ongoing", ta: "நடப்பில்" },
  Planned: { en: "Planned", ta: "திட்டமிடப்பட்டது" },
};

export function FilterBar({
  activeTypes,
  activeStatuses,
  onToggleType,
  onToggleStatus,
  onClearAll,
  typeCounts,
  statusCounts,
  hasActiveFilters,
  locale,
}: FilterBarProps) {
  const clearLabel = locale === "ta" ? "அனைத்தையும் நீக்கு" : "Clear All";

  return (
    <div className="space-y-3">
      {/* Type filters - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {PROJECT_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={locale === "ta" ? TYPE_LABELS[type].ta : TYPE_LABELS[type].en}
            count={typeCounts[type]}
            active={activeTypes.includes(type)}
            onClick={() => onToggleType(type)}
            icon={TYPE_ICONS[type]}
            className="flex-shrink-0"
          />
        ))}
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {PROJECT_STATUSES.map((status) => (
          <FilterChip
            key={status}
            label={locale === "ta" ? STATUS_LABELS[status].ta : STATUS_LABELS[status].en}
            count={statusCounts[status]}
            active={activeStatuses.includes(status)}
            onClick={() => onToggleStatus(status)}
          />
        ))}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="touch-target px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {clearLabel}
          </button>
        )}
      </div>
    </div>
  );
}
