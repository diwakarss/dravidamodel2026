// Tamil Nadu Education Schemes Data (2021-2026)
// Data loaded from education.json

import educationData from "@/data/education.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EducationScheme {
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
  coverage: string;
  highlights?: { en: string; ta: string }[];
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
