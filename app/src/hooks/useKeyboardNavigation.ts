"use client";

import { useCallback } from "react";

interface UseKeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onSelect?: () => void;
  onEscape?: () => void;
  orientation?: "horizontal" | "vertical";
}

/**
 * Hook for keyboard navigation in list-like components.
 * Supports arrow keys, Enter/Space for selection, and Escape.
 */
export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onSelect,
  onEscape,
  orientation = "horizontal",
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          onNext?.();
          break;
        case prevKey:
          e.preventDefault();
          onPrevious?.();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect?.();
          break;
        case "Escape":
          onEscape?.();
          break;
      }
    },
    [onNext, onPrevious, onSelect, onEscape, orientation]
  );

  return { handleKeyDown };
}
