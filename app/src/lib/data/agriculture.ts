// Tamil Nadu Agriculture Schemes Data (2021-2026)
// Data loaded from agriculture.json

import agricultureData from "@/data/agriculture.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface AgricultureScheme {
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
