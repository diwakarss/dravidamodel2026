// Tamil Nadu Social Welfare Schemes Data (2021-2026)
// Data loaded from socialWelfare.json

import socialWelfareData from "@/data/socialWelfare.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface WelfareScheme {
  id: string;
  name: { en: string; ta: string };
  description: { en: string; ta: string };
  launchDate?: string;
  beneficiaries: {
    count: string;
    description: { en: string; ta: string };
  };
  budget: {
    amount: string;
    year?: string;
    details?: string;
  };
  eligibility?: { en: string; ta: string };
  highlights?: { en: string; ta: string }[];
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
