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
// Uses soft, pastel teal color scale for better visual appeal
export function getChoroplethColor(count: number, maxCount: number): string {
  if (count === 0) return "#f0fdf4"; // very light mint

  const intensity = count / maxCount;

  if (intensity < 0.2) return "#dcfce7"; // light green-100
  if (intensity < 0.4) return "#bbf7d0"; // green-200
  if (intensity < 0.6) return "#86efac"; // green-300
  if (intensity < 0.8) return "#4ade80"; // green-400
  return "#22c55e"; // green-500
}

// District name normalization for matching
// Maps variant spellings to canonical GeoJSON names
const DISTRICT_ALIASES: Record<string, string> = {
  // Tiruchirappalli variants
  tiruchirappalli: "Tiruchirappalli",
  trichy: "Tiruchirappalli",
  // Kancheepuram variants
  kanchipuram: "Kancheepuram",
  kancheepuram: "Kancheepuram",
  // Nilgiris variants
  "the nilgiris": "The Nilgiris",
  nilgiris: "The Nilgiris",
  ooty: "The Nilgiris",
  // Thoothukudi variants
  thoothukudi: "Thoothukudi",
  tuticorin: "Thoothukudi",
  // Tiruvallur variants
  tiruvallur: "Thiruvallur",
  thiruvallur: "Thiruvallur",
  // Chengalpattu variants
  chengalpet: "Chengalpattu",
  chengalpattu: "Chengalpattu",
  // Kanyakumari variants
  kanyakumari: "Kanniyakumari",
  kanniyakumari: "Kanniyakumari",
  // Tiruvarur variants
  tiruvarur: "Thiruvarur",
  thiruvarur: "Thiruvarur",
};

export function normalizeDistrictName(name: string): string {
  const lower = name.toLowerCase().trim();
  return DISTRICT_ALIASES[lower] || name;
}

/**
 * Check if a district name represents a single valid district
 * (not "Multiple" or statewide entries)
 */
export function isSingleDistrict(district: string): boolean {
  const lower = district.toLowerCase().trim();
  return !lower.startsWith("multiple");
}

// Get unique district list from GeoJSON properties
export function getDistrictFromGeoJSON(
  feature: GeoJSON.Feature
): string | null {
  return (feature.properties?.district as string) || null;
}
