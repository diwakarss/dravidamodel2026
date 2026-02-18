// Tamil Nadu Environment & Green Energy Data (2021-2026)
// Data loaded from environment.json

import environmentData from "@/data/environment.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface EnvironmentScheme {
  id: string;
  name: BilingualText;
  description: BilingualText;
  launchDate?: string;
  beneficiaries: SchemeBeneficiaries;
  budget?: SchemeBudget;
  highlights?: BilingualText[];
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
