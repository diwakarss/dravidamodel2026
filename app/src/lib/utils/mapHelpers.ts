import type { Project } from "@/lib/schemas/project";

// Tamil Nadu bounding box
export const TN_BOUNDS: [[number, number], [number, number]] = [
  [8.0, 76.2], // Southwest corner
  [13.6, 80.4], // Northeast corner
];

export const TN_CENTER: [number, number] = [10.8, 78.7];
export const TN_INITIAL_ZOOM = 7;
export const DISTRICT_ZOOM = 10;

// Aggregate project counts by district
export function getProjectCountsByDistrict(
  projects: Project[]
): Record<string, number> {
  return projects.reduce(
    (acc, project) => {
      const district = normalizeDistrictName(project.location.district);
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// Get choropleth color based on project count
// Uses navy color scale from design tokens
export function getChoroplethColor(count: number, maxCount: number): string {
  if (count === 0) return "#e0ecf6"; // light

  const intensity = count / maxCount;

  if (intensity < 0.2) return "#bdd4eb";
  if (intensity < 0.4) return "#94b8d8";
  if (intensity < 0.6) return "#6b9bc4";
  if (intensity < 0.8) return "#4a7ca8";
  return "#264d73"; // navy-700
}

// District name normalization for matching
const DISTRICT_ALIASES: Record<string, string> = {
  tiruchirappalli: "Tiruchirappalli",
  trichy: "Tiruchirappalli",
  kancheepuram: "Kanchipuram",
  kanchipuram: "Kanchipuram",
  "the nilgiris": "The Nilgiris",
  nilgiris: "The Nilgiris",
  ooty: "The Nilgiris",
  "multiple (chennai)": "Chennai",
  thoothukudi: "Thoothukudi",
  tuticorin: "Thoothukudi",
};

export function normalizeDistrictName(name: string): string {
  const lower = name.toLowerCase().trim();
  return DISTRICT_ALIASES[lower] || name;
}

// Get unique district list from GeoJSON properties
export function getDistrictFromGeoJSON(
  feature: GeoJSON.Feature
): string | null {
  return (feature.properties?.district as string) || null;
}
