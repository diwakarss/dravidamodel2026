"use client";

import { useEffect, useCallback, useRef } from "react";
import type { Project } from "@/lib/schemas/project";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import { ProjectPhoto } from "./ProjectPhoto";
import { SourceLink } from "@/components/sources/SourceLink";
import { formatBudget, formatTimeline, getLocalizedName } from "@/lib/utils/format";

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
  locale: string;
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
  locale,
}: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasNavigation = onNext && onPrev && currentIndex !== undefined && totalCount !== undefined;

  // Open/close dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  // Labels
  const labels = {
    budget: locale === "ta" ? "பட்ஜெட்" : "Budget",
    timeline: locale === "ta" ? "காலவரிசை" : "Timeline",
    district: locale === "ta" ? "மாவட்டம்" : "District",
    sources: locale === "ta" ? "ஆதாரங்கள்" : "Sources",
    close: locale === "ta" ? "மூடு" : "Close",
    prev: locale === "ta" ? "முந்தைய" : "Previous",
    next: locale === "ta" ? "அடுத்த" : "Next",
    of: locale === "ta" ? "இல்" : "of",
  };

  const primaryName = getLocalizedName(project.name, locale);
  const secondaryName = locale === "ta" ? project.name.en : project.name.ta;

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg mx-auto my-4 md:my-auto p-0 bg-white rounded-xl shadow-elevated backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <TypeBadge type={project.type} />
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
            aria-label={labels.close}
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo */}
          <ProjectPhoto
            photoUrl={project.media.photoUrl}
            photoCaption={project.media.photoCaption}
            className="mx-4 mt-4"
          />

          {/* Title */}
          <div className="px-4 pt-4">
            <h2 className="font-display text-xl font-bold text-navy-900">{primaryName}</h2>
            <p className="text-sm text-slate-500 mt-1">{secondaryName}</p>
          </div>

          {/* Status & District */}
          <div className="flex items-center gap-3 px-4 pt-3">
            <StatusBadge status={project.status} locale={locale} />
            <span className="text-sm text-slate-600">{project.location.district}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 px-4 pt-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{labels.budget}</p>
              <p className="text-sm font-semibold text-navy-900 mt-1">
                {formatBudget(project.budget, locale)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{labels.timeline}</p>
              <p className="text-sm font-semibold text-navy-900 mt-1">
                {formatTimeline(project.timeline, locale)}
              </p>
            </div>
          </div>

          {/* CM Attribution */}
          {(project.media.cmPhotoInitiation || project.media.cmPhotoCompletion) && (
            <div className="px-4 pt-4">
              <div className="flex gap-3">
                {project.media.cmPhotoInitiation && (
                  <div className="flex items-center gap-2">
                    <img
                      src={project.media.cmPhotoInitiation}
                      alt="CM Initiation"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-600">
                      {locale === "ta" ? "முதலமைச்சர் தொடங்கினார்" : "Inaugurated by CM"}
                    </span>
                  </div>
                )}
                {project.media.cmPhotoCompletion && (
                  <div className="flex items-center gap-2">
                    <img
                      src={project.media.cmPhotoCompletion}
                      alt="CM Completion"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-600">
                      {locale === "ta" ? "முதலமைச்சர் நிறைவு செய்தார்" : "Completed by CM"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="px-4 pt-4 pb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{labels.sources}</p>
            <div className="space-y-2">
              {project.sources.map((source, i) => (
                <SourceLink key={i} title={source.title} url={source.url} />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        {hasNavigation && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onPrev}
              className="touch-target flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {labels.prev}
            </button>
            <span className="text-sm text-slate-500">
              {currentIndex + 1} {labels.of} {totalCount}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="touch-target flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {labels.next}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
