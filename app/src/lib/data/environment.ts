// Tamil Nadu Environment & Green Energy Data (2021-2026)
// Data loaded from environment.json

import environmentData from "@/data/environment.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EnvironmentScheme {
  id: string;
  name: { en: string; ta: string };
  description: { en: string; ta: string };
  launchDate?: string;
  beneficiaries: {
    count: string;
    description: { en: string; ta: string };
  };
  budget?: {
    amount: string;
    year?: string;
    details?: string;
  };
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export interface EnvironmentStats {
  renewableCapacity: string;
  renewableTarget: string;
  windCapacity: string;
  solarGrowth: string;
  evManufacturing: string;
}

// Export data from JSON
export const environmentSchemes: EnvironmentScheme[] = environmentData.environmentSchemes as EnvironmentScheme[];
export const environmentStats: EnvironmentStats = environmentData.environmentStats as EnvironmentStats;

export function getEnvironmentStats() {
  return {
    totalSchemes: environmentSchemes.length,
    renewableGW: 22,
    targetGW: 20,
    evChargingPoints: 5000,
    treesPlanted: 100000000,
  };
}
