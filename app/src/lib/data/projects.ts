import {
  ProjectsDataSchema,
  type ProjectsData,
  type Project,
  type ProjectStatus,
} from "../schemas/project";
import projectsJson from "@/data/infrastructure.json";
import { normalizeDistrictName, isSingleDistrict } from "../utils/mapHelpers";

const validationResult = ProjectsDataSchema.safeParse(projectsJson);

if (!validationResult.success) {
  console.error("Project data validation failed:");
  console.error(validationResult.error.format());
  throw new Error("Invalid project data. Build cannot proceed.");
}

export const projectsData: ProjectsData = validationResult.data;

export const projects: Project[] = projectsData.projects;
export const totalProjects: number = projectsData.totalProjects;
export const dataChecksum: string = projectsData.checksum;

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getProjectsByDistrict(district: string): Project[] {
  return projects.filter((p) => p.location.district === district);
}

export function getProjectsByStatus(status: ProjectStatus): Project[] {
  return projects.filter((p) => p.status === status);
}

export function getProjectsByType(type: string): Project[] {
  return projects.filter((p) => p.type === type);
}

interface Stats {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  totalBudget: number;
  completedBudget: number;
  districtsCount: number;
  typeCount: number;
}

export function getStats(): Stats {
  const byStatus: Record<ProjectStatus, number> = {
    Completed: 0,
    Ongoing: 0,
    Planned: 0,
  };
  const districts = new Set<string>();
  const types = new Set<string>();
  let totalBudget = 0;
  let completedBudget = 0;

  for (const p of projects) {
    byStatus[p.status]++;
    const budget = p.budget?.crore ?? 0;
    totalBudget += budget;
    if (p.status === "Completed") {
      completedBudget += budget;
    }
    types.add(p.type);
    // Only count single districts, exclude "Multiple*" entries
    if (isSingleDistrict(p.location.district)) {
      districts.add(normalizeDistrictName(p.location.district));
    }
  }

  return {
    total: projects.length,
    byStatus,
    totalBudget,
    completedBudget,
    districtsCount: districts.size,
    typeCount: types.size,
  };
}

export function getDistricts(): string[] {
  return [...new Set(projects.map((p) => p.location.district))].sort();
}

export function getTypes(): string[] {
  return [...new Set(projects.map((p) => p.type))].sort();
}
