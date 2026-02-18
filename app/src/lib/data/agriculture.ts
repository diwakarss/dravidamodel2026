// Tamil Nadu Agriculture Schemes Data (2021-2026)
// Data loaded from agriculture.json

import agricultureData from "@/data/agriculture.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface AgricultureScheme {
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

export interface AgricultureStats {
  farmersWithFreeElectricity: string;
  uzhavarSandhaiMarkets: number;
  cropInsuranceCoverage: string;
  irrigationCoverage: string;
}

// Export data from JSON
export const agricultureSchemes: AgricultureScheme[] = agricultureData.agricultureSchemes as AgricultureScheme[];
export const agricultureStats: AgricultureStats = agricultureData.agricultureStats as AgricultureStats;

export function getAgricultureStats() {
  return {
    totalSchemes: agricultureSchemes.length,
    farmersElectricity: 2100000,
    marketsCount: agricultureStats.uzhavarSandhaiMarkets,
    irrigationPercent: 60,
  };
}
