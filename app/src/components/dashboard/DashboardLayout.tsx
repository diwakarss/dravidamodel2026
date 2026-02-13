"use client";

import { useState, useCallback } from "react";
import { MapWrapper } from "@/components/map/MapWrapper";
import { SubTypeFilter } from "@/components/filters/SubTypeFilter";
import { StatsPanel } from "./StatsPanel";
import { MobileStatsBar } from "./MobileStatsBar";
import { ProjectPopup } from "@/components/project/ProjectPopup";
import { useFilters } from "@/hooks/useFilters";
import { projects } from "@/lib/data/projects";
import type { InfrastructureSubType, Project } from "@/lib/schemas/project";
import { cn } from "@/lib/utils/cn";

interface DashboardLayoutProps {
  locale: string;
}

export function DashboardLayout({ locale }: DashboardLayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const {
    activeSubTypes,
    toggleSubType,
    subTypeCounts,
    filteredProjects,
    hasActiveFilters,
    clearAll,
  } = useFilters(projects);

  const handleToggleSubType = useCallback(
    (subType: InfrastructureSubType) => {
      toggleSubType(subType);
    },
    [toggleSubType]
  );

  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">
      {/* Mobile: Stats bar at top */}
      <div className="lg:hidden">
        <MobileStatsBar locale={locale} />
      </div>

      {/* Mobile: Collapsible filters */}
      <div className="lg:hidden border-b border-slate-200">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {locale === "ta" ? "வடிகட்டிகள்" : "Filters"}
            {hasActiveFilters && (
              <span className="bg-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeSubTypes.length}
              </span>
            )}
          </span>
          <svg
            className={cn("w-4 h-4 transition-transform", filtersOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersOpen && (
          <div className="px-4 py-3 bg-white border-t border-slate-100 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                {locale === "ta" ? "வகை மூலம் வடிகட்டு" : "Filter by type"}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  {locale === "ta" ? "அழி" : "Clear"}
                </button>
              )}
            </div>
            <SubTypeFilter
              activeSubTypes={activeSubTypes}
              onToggle={handleToggleSubType}
              counts={subTypeCounts}
              locale={locale}
              compact
            />
          </div>
        )}
      </div>

      {/* Desktop: Left Sidebar - Filters */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {locale === "ta" ? "வடிகட்டி" : "Filter by Type"}
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
              >
                {locale === "ta" ? "அழி" : "Clear all"}
              </button>
            )}
          </div>

          <SubTypeFilter
            activeSubTypes={activeSubTypes}
            onToggle={handleToggleSubType}
            counts={subTypeCounts}
            locale={locale}
          />
        </div>
      </aside>

      {/* Center - Map */}
      <main className="flex-1 relative min-h-0">
        {/* Active filters indicator - Desktop only */}
        {hasActiveFilters && (
          <div className="hidden lg:block absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{filteredProjects.length}</span>{" "}
              {locale === "ta" ? "திட்டங்கள் காட்டப்படுகின்றன" : "projects shown"}
            </p>
          </div>
        )}

        <MapWrapper
          className="h-full w-full"
          locale={locale}
          filteredProjects={filteredProjects}
          onProjectSelect={handleProjectSelect}
        />

        {/* Project Popup */}
        {selectedProject && (
          <div className="absolute top-4 right-4 z-[1001] max-w-[calc(100vw-2rem)] lg:max-w-sm">
            <ProjectPopup
              project={selectedProject}
              locale={locale}
              onClose={handleClosePopup}
            />
          </div>
        )}
      </main>

      {/* Right Sidebar - Stats (Desktop only) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 bg-slate-50 border-l border-slate-200 overflow-y-auto">
        <StatsPanel locale={locale} />
      </aside>
    </div>
  );
}
