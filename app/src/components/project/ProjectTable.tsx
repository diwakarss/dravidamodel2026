"use client";

import { useState, useMemo } from "react";
import type { Project, ProjectType } from "@/lib/schemas/project";
import { formatBudget, getLocalizedName } from "@/lib/utils/format";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";

type SortField = "name" | "district" | "type" | "status" | "budget" | "year";
type SortDirection = "asc" | "desc";

interface ProjectTableProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  locale: string;
}

export function ProjectTable({
  projects,
  onSelectProject,
  locale,
}: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = getLocalizedName(a.name, locale).localeCompare(
            getLocalizedName(b.name, locale)
          );
          break;
        case "district":
          comparison = a.location.district.localeCompare(b.location.district);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "budget":
          comparison = (a.budget?.crore ?? 0) - (b.budget?.crore ?? 0);
          break;
        case "year":
          comparison = a.timeline.startYear - b.timeline.startYear;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [projects, sortField, sortDirection, locale]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const labels = {
    caption:
      locale === "ta"
        ? "தமிழ்நாடு உள்கட்டமைப்பு திட்டங்களின் பட்டியல்"
        : "List of Tamil Nadu infrastructure projects",
    columns: {
      name: locale === "ta" ? "திட்ட பெயர்" : "Project Name",
      district: locale === "ta" ? "மாவட்டம்" : "District",
      type: locale === "ta" ? "வகை" : "Type",
      status: locale === "ta" ? "நிலை" : "Status",
      budget: locale === "ta" ? "பட்ஜெட்" : "Budget",
      year: locale === "ta" ? "தொடக்க ஆண்டு" : "Start Year",
    },
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm" role="grid">
        <caption className="sr-only">{labels.caption}</caption>
        <thead className="bg-slate-100 text-left">
          <tr>
            <SortableHeader
              label={labels.columns.name}
              field="name"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              className="min-w-[200px]"
            />
            <SortableHeader
              label={labels.columns.district}
              field="district"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label={labels.columns.type}
              field="type"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label={labels.columns.status}
              field="status"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label={labels.columns.budget}
              field="budget"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              className="text-right"
            />
            <SortableHeader
              label={labels.columns.year}
              field="year"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              className="text-center"
            />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {sortedProjects.map((project) => (
            <tr
              key={project.id}
              onClick={() => onSelectProject(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectProject(project);
                }
              }}
              tabIndex={0}
              role="row"
              className="hover:bg-slate-50 cursor-pointer focus:bg-teal-50 focus:outline-none"
            >
              <td className="py-3 px-4 font-medium text-navy-900">
                {getLocalizedName(project.name, locale)}
              </td>
              <td className="py-3 px-4 text-slate-600">
                {project.location.district}
              </td>
              <td className="py-3 px-4">
                <TypeBadge type={project.type as ProjectType} />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={project.status} locale={locale} />
              </td>
              <td className="py-3 px-4 text-right text-slate-600">
                {formatBudget(project.budget, locale)}
              </td>
              <td className="py-3 px-4 text-center text-slate-600">
                {project.timeline.startYear}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = field === currentField;

  return (
    <th
      scope="col"
      className={`py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none ${className}`}
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(field);
        }
      }}
      tabIndex={0}
      aria-sort={
        isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-teal-600">{direction === "asc" ? "↑" : "↓"}</span>
        )}
      </span>
    </th>
  );
}
