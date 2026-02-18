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
  magalirBudget: string;
  pdsShops: number;
  universalPds: boolean;
  pensionAmount: string;
  vidiyalSubsidy: string;
  pongalBeneficiaries: string;
  farmLoanWaiver: string;
}

// Export data from JSON
export const welfareSchemes: WelfareScheme[] = socialWelfareData.welfareSchemes as WelfareScheme[];
export const welfareStats: WelfareStats = socialWelfareData.welfareStats as WelfareStats;

export function getWelfareStats() {
  return {
    totalSchemes: welfareSchemes.length,
    magalirBeneficiaries: 13100000,
    magalirBudgetCrore: 13027,
    pdsShops: 33609,
    pensionSchemes: 3,
    farmersHelped: 1643000,
  };
}
