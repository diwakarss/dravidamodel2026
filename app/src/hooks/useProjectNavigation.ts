"use client";

import { useState, useCallback, useMemo } from "react";
import type { Project } from "@/lib/schemas/project";

interface UseProjectNavigationProps {
  projects: Project[];
  initialProjectId?: string;
}

interface UseProjectNavigationReturn {
  currentProject: Project | null;
  currentIndex: number;
  totalCount: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToProject: (id: string) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function useProjectNavigation({
  projects,
  initialProjectId,
}: UseProjectNavigationProps): UseProjectNavigationReturn {
  const initialIndex = useMemo(() => {
    if (!initialProjectId) return 0;
    const idx = projects.findIndex((p) => p.id === initialProjectId);
    return idx >= 0 ? idx : 0;
  }, [projects, initialProjectId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const totalCount = projects.length;
  const currentProject = totalCount > 0 ? projects[currentIndex] : null;

  const goToNext = useCallback(() => {
    if (totalCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalCount);
  }, [totalCount]);

  const goToPrevious = useCallback(() => {
    if (totalCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
  }, [totalCount]);

  const goToProject = useCallback(
    (id: string) => {
      const idx = projects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    },
    [projects]
  );

  return {
    currentProject,
    currentIndex,
    totalCount,
    goToNext,
    goToPrevious,
    goToProject,
    hasNext: totalCount > 1,
    hasPrevious: totalCount > 1,
  };
}
