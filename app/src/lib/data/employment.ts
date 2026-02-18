// Tamil Nadu Employment and Skilling Schemes Data (2021-2026)
// Data loaded from employment.json

import employmentData from "@/data/employment.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface EmploymentScheme {
  id: string;
  name: BilingualText;
  description: BilingualText;
  launchDate?: string;
  beneficiaries: SchemeBeneficiaries;
  budget?: SchemeBudget;
  outcomes?: BilingualText;
  highlights?: BilingualText[];
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
