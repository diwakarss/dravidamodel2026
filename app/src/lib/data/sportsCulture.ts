// Tamil Nadu Sports & Culture Data (2021-2026)
// Data loaded from sportsCulture.json

import sportsCultureData from "@/data/sportsCulture.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface SportsCultureScheme {
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

export interface SportsCultureStats {
  chessOlympiadCountries: number;
  athleteAwardOlympicGold: string;
  stadiumsUpgraded: number;
  templesUnderHRCE: string;
}

// Export data from JSON
export const sportsCultureSchemes: SportsCultureScheme[] = sportsCultureData.sportsCultureSchemes as SportsCultureScheme[];
export const sportsCultureStats: SportsCultureStats = sportsCultureData.sportsCultureStats as SportsCultureStats;

export function getSportsCultureStats() {
  return {
    totalSchemes: sportsCultureSchemes.length,
    chessCountries: sportsCultureStats.chessOlympiadCountries,
    olympicGoldPrize: 30000000,
    templesCount: 44000,
  };
}
