// Shared types for Tamil Nadu government schemes
// Used across all domain-specific data modules

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface BilingualText {
  en: string;
  ta: string;
}

export interface SchemeBeneficiaries {
  count: string;
  description: BilingualText;
}

export interface SchemeBudget {
  amount: string;
  year?: string;
  details?: string;
}

// Base interface for all scheme types
export interface BaseScheme {
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
