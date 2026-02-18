// Tamil Nadu Tamil History & Archaeology Data (2021-2026)
// Data loaded from tamilHistory.json

import tamilHistoryData from "@/data/tamilHistory.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface HistoryScheme {
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
