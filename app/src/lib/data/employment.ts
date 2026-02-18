// Tamil Nadu Employment and Skilling Schemes Data (2021-2026)
// Data loaded from employment.json

import employmentData from "@/data/employment.json";

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EmploymentScheme {
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
  outcomes?: { en: string; ta: string };
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export interface EmploymentStats {
  naanMudhalvanTrained: string;
  naanMudhalvanPlacements: string;
  startups: string;
  womenLedStartups: string;
  jobFairPlacements: string;
  gimInvestments: string;
  gimJobs: string;
  unemploymentUrban: string;
  unemploymentRural: string;
}

// Export data from JSON
export const employmentSchemes: EmploymentScheme[] = employmentData.employmentSchemes as EmploymentScheme[];
export const employmentStats: EmploymentStats = employmentData.employmentStats as EmploymentStats;

export function getEmploymentStats() {
  return {
    totalSchemes: employmentSchemes.length,
    studentsTrained: 4138000,
    totalPlacements: 328000,
    activeStartups: 12000,
    womenStartupPercent: 50.1,
    incubators: 120,
    proposedJobs: 664000,
  };
}
