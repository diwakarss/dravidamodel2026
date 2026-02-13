import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import {
  formatBudget,
  formatTimeline,
  getLocalizedName,
} from "@/lib/utils/format";
import type { Project } from "@/lib/schemas/project";

interface ProjectCardProps {
  project: Project;
  locale: string;
  onClick?: () => void;
}

export function ProjectCard({ project, locale, onClick }: ProjectCardProps) {
  return (
    <Card hover onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <TypeBadge type={project.type} />
        <StatusBadge status={project.status} locale={locale} />
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-semibold text-navy-900 leading-tight">
        {getLocalizedName(project.name, locale)}
      </h3>
      {locale === "ta" ? (
        <p className="text-sm text-slate-600 mt-1">{project.name.en}</p>
      ) : (
        <p className="font-tamil text-base text-slate-600 mt-1 leading-relaxed">
          {project.name.ta}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {locale === "ta" ? "பட்ஜெட்" : "Budget"}
          </p>
          <p className="text-sm font-semibold font-display text-navy-700">
            {formatBudget(project.budget, locale)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {locale === "ta" ? "மாவட்டம்" : "District"}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {project.location.district}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {locale === "ta" ? "காலம்" : "Timeline"}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {formatTimeline(project.timeline, locale)}
          </p>
        </div>
      </div>
    </Card>
  );
}
