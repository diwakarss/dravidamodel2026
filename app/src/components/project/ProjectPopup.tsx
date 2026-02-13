"use client";

import Image from "next/image";
import type { Project } from "@/lib/schemas/project";
import { getProjectCMs, type ChiefMinister } from "@/lib/utils/cmMapping";
import { formatBudget, getLocalizedName } from "@/lib/utils/format";
import { getSubTypeConfig } from "@/lib/constants/subTypes";
import { cn } from "@/lib/utils/cn";
import { ProjectPhoto } from "./ProjectPhoto";

interface ProjectPopupProps {
  project: Project;
  locale: string;
  onClose?: () => void;
}

function CMCard({
  cm,
  label,
  year,
  locale,
  showLabel = true,
}: {
  cm: ChiefMinister;
  label: string;
  year: number;
  locale: string;
  showLabel?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
      <div className="relative w-10 h-12 flex-shrink-0 overflow-hidden rounded">
        <Image
          src={cm.photoUrl}
          alt={locale === "ta" ? cm.name.ta : cm.name.en}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="min-w-0">
        {showLabel && <p className="text-xs font-medium text-slate-600">{label}</p>}
        <p className="text-sm font-semibold text-slate-900 truncate">
          {locale === "ta" ? cm.name.ta : cm.name.en}
        </p>
        <p className="text-xs text-slate-600">
          {cm.party} • {year}
        </p>
      </div>
    </div>
  );
}

export function ProjectPopup({ project, locale, onClose }: ProjectPopupProps) {
  const { startYear, completionYear } = project.timeline;
  const cms = getProjectCMs(startYear, completionYear);
  const subTypeConfig = project.subType ? getSubTypeConfig(project.subType) : null;

  const statusColors: Record<string, string> = {
    Completed: "bg-green-100 text-green-800",
    Ongoing: "bg-amber-100 text-amber-800",
    Planned: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Project Photo */}
      {project.media.photoUrl && (
        <ProjectPhoto
          photoUrl={project.media.photoUrl}
          photoCaption={project.media.photoCaption}
          aspectRatio="16:9"
        />
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 leading-tight">
              {getLocalizedName(project.name, locale === "ta" ? "ta" : "en")}
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {project.location.district}
              {project.location.city && project.location.city !== project.location.district
                ? `, ${project.location.city}`
                : ""}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={locale === "ta" ? "மூடு" : "Close"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusColors[project.status])}>
            {project.status}
          </span>
          {subTypeConfig && (
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", subTypeConfig.color)}>
              {locale === "ta" ? subTypeConfig.label.ta : subTypeConfig.label.en}
            </span>
          )}
        </div>
      </div>

      {/* Budget & Timeline */}
      <div className="p-4 bg-slate-50 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-4">
          {project.budget?.crore && (
            <div>
              <p className="text-xs font-medium text-slate-600">
                {locale === "ta" ? "பட்ஜெட்" : "Budget"}
              </p>
              <p className="text-lg font-bold text-navy-900">
                {formatBudget(project.budget, locale)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-slate-600">
              {locale === "ta" ? "காலம்" : "Timeline"}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {startYear}
              {completionYear && completionYear !== startYear ? ` - ${completionYear}` : ""}
              {!completionYear && project.status === "Ongoing" && " - ..."}
            </p>
          </div>
        </div>
      </div>

      {/* CM Attribution */}
      {(cms.initiation || cms.completion) && (
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
            {locale === "ta" ? "முதலமைச்சர்" : "Chief Minister"}
          </p>
          <div className="space-y-2">
            {(() => {
              const sameCM = !cms.completion || cms.completion.id === cms.initiation?.id;
              return (
                <>
                  {cms.initiation && (
                    <CMCard
                      cm={cms.initiation}
                      label={locale === "ta" ? "தொடக்கம்" : "Initiated"}
                      year={startYear}
                      locale={locale}
                      showLabel={!sameCM}
                    />
                  )}
                  {cms.completion && cms.completion.id !== cms.initiation?.id && (
                    <CMCard
                      cm={cms.completion}
                      label={locale === "ta" ? "நிறைவு" : "Completed"}
                      year={completionYear!}
                      locale={locale}
                      showLabel={true}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Source Links */}
      {project.sources.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
            {locale === "ta" ? "ஆதாரங்கள்" : "Sources"}
          </p>
          <div className="space-y-1.5">
            {project.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-700 hover:text-teal-800 font-medium flex items-start gap-1.5 group"
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="group-hover:underline">
                  {source.title || new URL(source.url).hostname.replace('www.', '')}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
