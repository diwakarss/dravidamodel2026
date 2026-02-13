"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Project, ProjectType, ProjectStatus } from "@/lib/schemas/project";

interface FilterState {
  types: ProjectType[];
  statuses: ProjectStatus[];
}

interface UseFiltersReturn {
  filters: FilterState;
  toggleType: (type: ProjectType) => void;
  toggleStatus: (status: ProjectStatus) => void;
  clearAll: () => void;
  isTypeActive: (type: ProjectType) => boolean;
  isStatusActive: (status: ProjectStatus) => boolean;
  hasActiveFilters: boolean;
  filteredProjects: Project[];
}

export function useFilters(projects: Project[]): UseFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse initial state from URL
  const [filters, setFilters] = useState<FilterState>(() => {
    const typesParam = searchParams.get("type");
    const statusesParam = searchParams.get("status");

    return {
      types: typesParam ? (typesParam.split(",") as ProjectType[]) : [],
      statuses: statusesParam ? (statusesParam.split(",") as ProjectStatus[]) : [],
    };
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.types.length > 0) {
      params.set("type", filters.types.join(","));
    }
    if (filters.statuses.length > 0) {
      params.set("status", filters.statuses.join(","));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, pathname, router]);

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

  return {
    filters,
    toggleType,
    toggleStatus,
    clearAll,
    isTypeActive,
    isStatusActive,
    hasActiveFilters,
    filteredProjects,
  };
}
