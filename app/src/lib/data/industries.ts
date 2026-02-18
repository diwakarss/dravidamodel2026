// Tamil Nadu Industrial Investments Data (2021-2026)
// Data loaded from industries.json

import industriesData from "@/data/industries.json";
import type { BilingualText } from "@/lib/types/scheme";

export interface IndustrialPark {
  id: string;
  name: string;
  company?: string;
  location: string;
  district: string;
  coordinates?: { lat: number; lng: number };
  sector: string[];
  status: "operational" | "announced" | "under_construction";
  investmentCrore?: number;
  jobsCreated?: number;
  area?: string;
  notes?: string;
  year?: number;
  source?: string;
}

export interface SectorData {
  id: string;
  name: BilingualText;
  status: string;
  keyData: string;
  majorInvestors: string[];
  color: string;
}

export interface IndustriesSummary {
  gim2024MoUs: number;
  gim2024Investment: number;
  gim2024Jobs: number;
  investment2025MoUs: number;
  investment2025: number;
  investment2025Jobs: number;
  totalMoUs: number;
  totalInvestmentSince2021: number;
  projectedJobs: number;
  mouConversionRate: number;
  policyTarget: string;
  sipcotLandBank: string;
  electronicsExports2025: number;
  evProductionShare: number;
  dataLastUpdated: string;
}

// Export data from JSON
export const sectors: SectorData[] = industriesData.sectors as SectorData[];
export const industrialParks: IndustrialPark[] = industriesData.industrialParks as IndustrialPark[];
export const industriesSummary: IndustriesSummary = industriesData.industriesSummary as IndustriesSummary;

export function getIndustryDisplayName(park: IndustrialPark): string {
  return park.company ? `${park.company} - ${park.name}` : park.name;
}

export function getIndustriesStats() {
  const parksWithInvestment = industrialParks.filter((p) => p.investmentCrore);
  const totalInvestment = parksWithInvestment.reduce(
    (sum, p) => sum + (p.investmentCrore || 0),
    0
  );
  const totalJobs = industrialParks.reduce(
    (sum, p) => sum + (p.jobsCreated || 0),
    0
  );
  const operationalParks = industrialParks.filter(
    (p) => p.status === "operational"
  ).length;
  const announcedParks = industrialParks.filter(
    (p) => p.status === "announced"
  ).length;
  const underConstructionParks = industrialParks.filter(
    (p) => p.status === "under_construction"
  ).length;

  return {
    totalInvestment,
    totalJobs,
    operationalParks,
    announcedParks,
    underConstructionParks,
    totalParks: industrialParks.length,
    sectorsCount: sectors.length,
  };
}

export const companyInvestments = industrialParks.filter((p) => p.company);
