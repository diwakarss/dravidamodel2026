"use client";

import { useState, useMemo, useCallback } from "react";
import type { Project, ProjectType, ProjectStatus } from "@/lib/schemas/project";

interface FilterState {
  types: ProjectType[];
  statuses: ProjectStatus[];
}

interface UseFiltersReturn {
  filters: FilterState;
  activeTypes: ProjectType[];
  activeStatuses: ProjectStatus[];
  toggleType: (type: ProjectType) => void;
  toggleStatus: (status: ProjectStatus) => void;
  clearAll: () => void;
  isTypeActive: (type: ProjectType) => boolean;
  isStatusActive: (status: ProjectStatus) => boolean;
  hasActiveFilters: boolean;
  filteredProjects: Project[];
  typeCounts: Record<ProjectType, number>;
  statusCounts: Record<ProjectStatus, number>;
}

export function useFilters(projects: Project[]): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    statuses: [],
  });

  const toggleType = useCallback((type: ProjectType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleStatus = useCallback((status: ProjectStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters({ types: [], statuses: [] });
  }, []);

  const isTypeActive = useCallback(
    (type: ProjectType) => filters.types.includes(type),
    [filters.types]
  );

  const isStatusActive = useCallback(
    (status: ProjectStatus) => filters.statuses.includes(status),
    [filters.statuses]
  );

  const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Type filter: if types selected, project must match one of them
      if (filters.types.length > 0 && !filters.types.includes(project.type)) {
        return false;
      }
      // Status filter: if statuses selected, project must match one of them
      if (filters.statuses.length > 0 && !filters.statuses.includes(project.status)) {
        return false;
      }
      return true;
    });
  }, [projects, filters]);

  // Count projects by type and status (from all projects, not filtered)
  const typeCounts = useMemo(() => {
    const counts: Record<ProjectType, number> = {
      "Public Transport": 0,
      "Roads/Highways": 0,
      "Water/Sanitation": 0,
      "Education/Health": 0,
      "Power/Utilities": 0,
      Other: 0,
    };
    for (const project of projects) {
      counts[project.type]++;
    }
    return counts;
  }, [projects]);

  const statusCounts = useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      Completed: 0,
      Ongoing: 0,
      Planned: 0,
    };
    for (const project of projects) {
      counts[project.status]++;
    }
    return counts;
  }, [projects]);

  return {
    filters,
    activeTypes: filters.types,
    activeStatuses: filters.statuses,
    toggleType,
    toggleStatus,
    clearAll,
    isTypeActive,
    isStatusActive,
    hasActiveFilters,
    filteredProjects,
    typeCounts,
    statusCounts,
  };
}
