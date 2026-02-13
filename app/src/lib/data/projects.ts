import {
  ProjectsDataSchema,
  type ProjectsData,
  type Project,
  type ProjectStatus,
} from "../schemas/project";
import projectsJson from "@/data/projects.json";

// Validate at import time (build time for static export)
const validationResult = ProjectsDataSchema.safeParse(projectsJson);

if (!validationResult.success) {
  console.error("Project data validation failed:");
  console.error(validationResult.error.format());
  throw new Error("Invalid project data. Build cannot proceed.");
}

export const projectsData: ProjectsData = validationResult.data;

// Convenience exports
export const projects: Project[] = projectsData.projects;
export const totalProjects: number = projectsData.totalProjects;
export const dataChecksum: string = projectsData.checksum;

// Helper functions
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

// Stats
export function getStats() {
  const byStatus = {
    Completed: projects.filter((p) => p.status === "Completed").length,
    Ongoing: projects.filter((p) => p.status === "Ongoing").length,
    Planned: projects.filter((p) => p.status === "Planned").length,
  };

  const totalBudget = projects.reduce((sum, p) => {
    return sum + (p.budget?.crore ?? 0);
  }, 0);

  const districts = new Set(projects.map((p) => p.location.district));

  return {
    total: projects.length,
    byStatus,
    totalBudget,
    districtsCount: districts.size,
  };
}

// Get all unique districts
export function getDistricts(): string[] {
  return [...new Set(projects.map((p) => p.location.district))].sort();
}

// Get all unique types
export function getTypes(): string[] {
  return [...new Set(projects.map((p) => p.type))].sort();
}
