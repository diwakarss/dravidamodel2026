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
  renewableCapacityGW: number;
  renewableTarget: string;
  renewableTargetGW: number;
  windCapacity: string;
  solarGrowth: string;
  evManufacturing: string;
  evChargingPoints: number;
  treesPlanted: number;
}

// Export data from JSON
export const environmentSchemes: EnvironmentScheme[] = environmentData.environmentSchemes as EnvironmentScheme[];
export const environmentStats: EnvironmentStats = environmentData.environmentStats as EnvironmentStats;

export function getEnvironmentStats() {
  return {
    totalSchemes: environmentSchemes.length,
    renewableGW: environmentStats.renewableCapacityGW,
    targetGW: environmentStats.renewableTargetGW,
    evChargingPoints: environmentStats.evChargingPoints,
    treesPlanted: environmentStats.treesPlanted,
  };
}
