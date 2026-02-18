// Tamil Nadu Education Schemes Data (2021-2026)
// Data loaded from education.json

import educationData from "@/data/education.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface EducationScheme {
  id: string;
  name: BilingualText;
  description: BilingualText;
  launchDate?: string;
  beneficiaries: SchemeBeneficiaries;
  budget: SchemeBudget;
  coverage: string;
  highlights?: BilingualText[];
  icon: string;
  sources?: SchemeSource[];
}

export interface EducationStats {
  totalBudget: string;
  schoolBudget: string;
  higherEdBudget: string;
  illamThediBeneficiaries: string;
  pudhmaaiPennBeneficiaries: string;
  tamilPudhalvanBeneficiaries: string;
  breakfastBeneficiaries: string;
  laptopsPlanned: string;
}

// Export data from JSON
export const educationSchemes: EducationScheme[] = educationData.educationSchemes as EducationScheme[];
export const educationStats: EducationStats = educationData.educationStats as EducationStats;

export function getEducationStats() {
  return {
    totalSchemes: educationSchemes.length,
    totalBudgetCrore: 47765,
    schoolStudents: 9000000,
    laptopsDistributed: 900000,
    volunteersCount: 189000,
  };
}
