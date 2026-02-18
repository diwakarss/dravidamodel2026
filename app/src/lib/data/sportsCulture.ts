// Tamil Nadu Sports & Culture Data (2021-2026)
// Data loaded from sportsCulture.json

import sportsCultureData from "@/data/sportsCulture.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface SportsCultureScheme {
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
