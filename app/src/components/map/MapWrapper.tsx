"use client";

import dynamic from "next/dynamic";
import type { Project } from "@/lib/schemas/project";

interface MapWrapperProps {
  className?: string;
  locale: string;
  filteredProjects?: Project[];
  onProjectSelect?: (project: Project) => void;
}

const TNMap = dynamic(
  () => import("./TNMap").then((mod) => mod.TNMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-slate-500">Loading map...</span>
      </div>
    ),
  }
);

export function MapWrapper({ className, locale, filteredProjects, onProjectSelect }: MapWrapperProps) {
  return (
    <TNMap
      className={className}
      locale={locale}
      filteredProjects={filteredProjects}
      onProjectSelect={onProjectSelect}
    />
  );
}
