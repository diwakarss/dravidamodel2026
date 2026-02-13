"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { FilterBar } from "@/components/filters/FilterBar";
import { ProjectTable, ProjectModal } from "@/components/project";
import { SummaryDashboard } from "@/components/dashboard/SummaryDashboard";
import { useFilters } from "@/hooks/useFilters";
import { projects, totalProjects } from "@/lib/data/projects";
import type { Project } from "@/lib/schemas/project";

interface ProjectsPageContentProps {
  locale: string;
}

export function ProjectsPageContent({ locale }: ProjectsPageContentProps) {
  const {
    filteredProjects,
    activeTypes,
    activeStatuses,
    toggleType,
    toggleStatus,
    clearAll,
    typeCounts,
    statusCounts,
    hasActiveFilters,
  } = useFilters(projects);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Navigation within filtered projects
  const currentIndex = useMemo(() => {
    if (!selectedProject) return -1;
    return filteredProjects.findIndex((p) => p.id === selectedProject.id);
  }, [filteredProjects, selectedProject]);

  const goToNext = () => {
    if (currentIndex >= 0 && filteredProjects.length > 1) {
      const nextIndex = (currentIndex + 1) % filteredProjects.length;
      setSelectedProject(filteredProjects[nextIndex]);
    }
  };

  const goToPrevious = () => {
    if (currentIndex >= 0 && filteredProjects.length > 1) {
      const prevIndex =
        (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
      setSelectedProject(filteredProjects[prevIndex]);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const labels = {
    title: locale === "ta" ? "அனைத்து திட்டங்கள்" : "All Projects",
    description:
      locale === "ta"
        ? "தேடக்கூடிய பட்டியல் வடிவத்தில் அனைத்து உள்கட்டமைப்பு திட்டங்களையும் உலாவுங்கள்."
        : "Browse all infrastructure projects in a searchable list format.",
    showing: locale === "ta" ? "காட்டுகிறது" : "Showing",
    of: locale === "ta" ? "இல்" : "of",
    projectsLabel: locale === "ta" ? "திட்டங்கள்" : "projects",
  };

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 py-8">
      <Container>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
            {labels.title}
          </h1>
          <p className="text-slate-600">{labels.description}</p>
        </div>

        {/* Summary Dashboard */}
        <SummaryDashboard
          projects={filteredProjects}
          totalProjectCount={totalProjects}
          locale={locale}
        />

        {/* Filters */}
        <div className="my-6">
          <FilterBar
            activeTypes={activeTypes}
            activeStatuses={activeStatuses}
            onToggleType={toggleType}
            onToggleStatus={toggleStatus}
            onClearAll={clearAll}
            typeCounts={typeCounts}
            statusCounts={statusCounts}
            hasActiveFilters={hasActiveFilters}
            locale={locale}
          />
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-600 mb-4">
          {labels.showing} {filteredProjects.length} {labels.of} {totalProjects}{" "}
          {labels.projectsLabel}
        </p>

        {/* Table */}
        <ProjectTable
          projects={filteredProjects}
          onSelectProject={handleSelectProject}
          locale={locale}
        />

        {/* Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={handleCloseModal}
            onNext={goToNext}
            onPrev={goToPrevious}
            currentIndex={currentIndex}
            totalCount={filteredProjects.length}
            locale={locale}
          />
        )}
      </Container>
    </main>
  );
}
