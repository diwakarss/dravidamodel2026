import type { Project } from "../schemas/project";

export function formatBudget(
  budget: Project["budget"],
  locale: string
): string {
  if (!budget || budget.crore === null || budget.crore === 0) {
    return locale === "ta" ? "தரவு இல்லை" : "Data not available";
  }

  // Format in lakhs crore for very large amounts
  if (budget.crore >= 10000) {
    return `₹${(budget.crore / 100).toFixed(0)}L Cr`;
  }
  // Format with comma separators
  return `₹${budget.crore.toLocaleString("en-IN")} Cr`;
}

export function formatYear(year: number | null, locale: string): string {
  if (!year) {
    return locale === "ta" ? "தரவு இல்லை" : "Data not available";
  }
  return year.toString();
}

export function formatTimeline(
  timeline: Project["timeline"],
  locale: string
): string {
  const start = timeline.startYear;
  const end = timeline.completionYear;

  if (!end) {
    return locale === "ta" ? `${start} — நடப்பில்` : `${start} — Ongoing`;
  }

  return `${start} — ${end}`;
}

export function getLocalizedName(
  name: { en: string; ta: string },
  locale: string
): string {
  return locale === "ta" ? name.ta : name.en;
}

export function formatStatus(
  status: Project["status"],
  locale: string
): string {
  const statusMap: Record<Project["status"], { en: string; ta: string }> = {
    Completed: { en: "Completed", ta: "முடிவடைந்தது" },
    Ongoing: { en: "Ongoing", ta: "நடப்பில்" },
    Planned: { en: "Planned", ta: "திட்டமிடப்பட்டது" },
  };

  return locale === "ta" ? statusMap[status].ta : statusMap[status].en;
}

export function formatBudgetCompact(crore: number): string {
  if (crore >= 10000) {
    return `₹${(crore / 10000).toFixed(2)}L Cr`;
  }
  return `₹${crore.toLocaleString("en-IN")} Cr`;
}

export function formatType(type: Project["type"], locale: string): string {
  const typeMap: Record<Project["type"], { en: string; ta: string }> = {
    "Public Transport": { en: "Public Transport", ta: "பொது போக்குவரத்து" },
    "Roads/Highways": { en: "Roads/Highways", ta: "சாலைகள்/நெடுஞ்சாலைகள்" },
    "Water/Sanitation": { en: "Water/Sanitation", ta: "நீர்/சுகாதாரம்" },
    "Education/Health": { en: "Education/Health", ta: "கல்வி/சுகாதாரம்" },
    "Power/Utilities": { en: "Power/Utilities", ta: "மின்சாரம்/பொது சேவைகள்" },
    "Cultural/Heritage": { en: "Cultural/Heritage", ta: "கலாச்சாரம்/பாரம்பரியம்" },
    "Sports/Recreation": { en: "Sports/Recreation", ta: "விளையாட்டு/பொழுதுபோக்கு" },
    "Industrial/IT": { en: "Industrial/IT", ta: "தொழில்/தகவல் தொழில்நுட்பம்" },
    Housing: { en: "Housing", ta: "வீட்டு வசதி" },
    "Parks/Environment": { en: "Parks/Environment", ta: "பூங்காக்கள்/சுற்றுச்சூழல்" },
    "Ports/Logistics": { en: "Ports/Logistics", ta: "துறைமுகம்/சரக்கு போக்குவரத்து" },
    "Public Safety": { en: "Public Safety", ta: "பொது பாதுகாப்பு" },
    "Urban Development": { en: "Urban Development", ta: "நகர்ப்புற மேம்பாடு" },
    Tourism: { en: "Tourism", ta: "சுற்றுலா" },
    Other: { en: "Other", ta: "பிற" },
  };

  return locale === "ta" ? typeMap[type].ta : typeMap[type].en;
}
