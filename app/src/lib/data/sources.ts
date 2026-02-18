// Data Sources - Tamil Nadu Government & Media
// Data loaded from sources.json

import sourcesData from "@/data/sources.json";
import type { BilingualText } from "@/lib/types/scheme";

export interface DataSource {
  id: string;
  name: BilingualText;
  url: string;
  description: BilingualText;
  category: "government" | "media";
}

// Export data from JSON
export const sources: DataSource[] = sourcesData.sources as DataSource[];

export function getSourcesByCategory(category: "government" | "media"): DataSource[] {
  return sources.filter((s) => s.category === category);
}

export function getSourcesStats() {
  return {
    totalSources: sources.length,
    governmentSources: sources.filter((s) => s.category === "government").length,
    mediaSources: sources.filter((s) => s.category === "media").length,
  };
}
