// Tamil Nadu Tamil History & Archaeology Data (2021-2026)
// Data loaded from tamilHistory.json

import tamilHistoryData from "@/data/tamilHistory.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface HistoryScheme {
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

export interface HistoryStats {
  excavationSites: number;
  artifactsDiscovered: string;
  museumsUpgraded: number;
  budgetIncrease: string;
  oldestFinding: string;
}

// Export data from JSON
export const historySchemes: HistoryScheme[] = tamilHistoryData.historySchemes as HistoryScheme[];
export const historyStats: HistoryStats = tamilHistoryData.historyStats as HistoryStats;

export function getHistoryStats() {
  return {
    totalSchemes: historySchemes.length,
    museumsBuilt: 5,
    excavationSites: 15,
    languageBudgetCrore: 500,
    heritageProjects: 20,
  };
}
