// Tamil Nadu Healthcare Schemes Data (2021-2026)
// Data loaded from healthcare.json

import healthcareData from "@/data/healthcare.json";
import type { SchemeSource, BilingualText, SchemeBeneficiaries, SchemeBudget } from "@/lib/types/scheme";

export type { SchemeSource };

export interface HealthcareScheme {
  id: string;
  name: BilingualText;
  description: BilingualText;
  launchYear?: string;
  beneficiaries: SchemeBeneficiaries;
  budget?: SchemeBudget;
  coverage: string;
  highlights?: BilingualText[];
  icon: string;
  sources?: SchemeSource[];
}

export interface HealthcareStats {
  totalBudget: string;
  insuranceCoverage: string;
  ambulances: number;
  medicalColleges: number;
  doorstepReach: string;
  hospitalsInNetwork: number;
  organDonations2024: number;
  palliativeCenters: number;
}

// Export data from JSON
export const healthcareSchemes: HealthcareScheme[] = healthcareData.healthcareSchemes as HealthcareScheme[];
export const healthcareStats: HealthcareStats = healthcareData.healthcareStats as HealthcareStats;

export function getHealthcareStats() {
  return {
    totalSchemes: healthcareSchemes.length,
    totalBudgetCrore: 21906,
    cmhisBeneficiaries: 15000000,
    dialysisCentres: 295,
    medicalColleges: healthcareStats.medicalColleges,
    urbanPHCs: 328,
    ambulanceFleet: healthcareStats.ambulances,
    newMedicalColleges: healthcareStats.medicalColleges,
  };
}
