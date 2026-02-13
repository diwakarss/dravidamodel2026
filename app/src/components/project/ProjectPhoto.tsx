"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ProjectPhotoProps {
  photoUrl: string | null;
  photoCaption?: string | null;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "square";
}

const aspectClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  square: "aspect-square",
};

export function ProjectPhoto({
  photoUrl,
  photoCaption,
  className,
  aspectRatio = "16:9",
}: ProjectPhotoProps) {
  const [hasError, setHasError] = useState(false);

  const showPlaceholder = !photoUrl || hasError;

  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <div
        className={cn(
          "relative bg-slate-100",
          aspectClasses[aspectRatio]
        )}
      >
        {showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <img
            src={photoUrl}
            alt={photoCaption || "Project photo"}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      {photoCaption && !showPlaceholder && (
        <p className="mt-2 text-xs text-slate-500 text-center">{photoCaption}</p>
      )}
    </div>
  );
}
