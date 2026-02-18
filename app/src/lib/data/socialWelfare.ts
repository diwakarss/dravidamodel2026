// Tamil Nadu Social Welfare Schemes Data (2021-2026)
// Data loaded from socialWelfare.json

import socialWelfareData from "@/data/socialWelfare.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface WelfareScheme {
  id: string;
  name: BilingualText;
  description: BilingualText;
  launchDate?: string;
  beneficiaries: SchemeBeneficiaries;
  budget: SchemeBudget;
  eligibility?: BilingualText;
  highlights?: BilingualText[];
  icon: string;
  sources?: SchemeSource[];
}

export interface WelfareStats {
  magalirBeneficiaries: string;
  magalirBeneficiariesNum: number;
  magalirBudget: string;
  magalirBudgetCrore: number;
  pdsShops: number;
  universalPds: boolean;
  pensionAmount: string;
  pensionSchemes: number;
  vidiyalSubsidy: string;
  pongalBeneficiaries: string;
  farmLoanWaiver: string;
  farmersHelped: number;
}

// Export data from JSON
export const welfareSchemes: WelfareScheme[] = socialWelfareData.welfareSchemes as WelfareScheme[];
export const welfareStats: WelfareStats = socialWelfareData.welfareStats as WelfareStats;

export function getWelfareStats() {
  return {
    totalSchemes: welfareSchemes.length,
    magalirBeneficiaries: welfareStats.magalirBeneficiariesNum,
    magalirBudgetCrore: welfareStats.magalirBudgetCrore,
    pdsShops: welfareStats.pdsShops,
    pensionSchemes: welfareStats.pensionSchemes,
    farmersHelped: welfareStats.farmersHelped,
  };
}
