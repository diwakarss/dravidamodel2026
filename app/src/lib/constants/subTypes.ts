import type { InfrastructureSubType } from "@/lib/schemas/project";

/**
 * Infrastructure sub-type configuration with icons and colors
 */
export interface SubTypeConfig {
  id: InfrastructureSubType;
  label: {
    en: string;
    ta: string;
  };
  icon: string; // Lucide icon name
  color: string; // Tailwind color class for marker/badge
  markerColor: string; // Hex color for map markers
}

export const INFRASTRUCTURE_SUB_TYPES: SubTypeConfig[] = [
  {
    id: "Metro & Rail",
    label: { en: "Metro & Rail", ta: "மெட்ரோ & ரயில்" },
    icon: "Train",
    color: "text-purple-600 bg-purple-50",
    markerColor: "#9333ea",
  },
  {
    id: "Roads & Bridges",
    label: { en: "Roads & Bridges", ta: "சாலைகள் & பாலங்கள்" },
    icon: "Route",
    color: "text-orange-600 bg-orange-50",
    markerColor: "#ea580c",
  },
  {
    id: "Bus & Transport",
    label: { en: "Bus & Transport", ta: "பேருந்து & போக்குவரத்து" },
    icon: "Bus",
    color: "text-amber-600 bg-amber-50",
    markerColor: "#d97706",
  },
  {
    id: "Water & Sanitation",
    label: { en: "Water & Sanitation", ta: "நீர் & சுகாதாரம்" },
    icon: "Droplets",
    color: "text-cyan-600 bg-cyan-50",
    markerColor: "#0891b2",
  },
  {
    id: "Power & Energy",
    label: { en: "Power & Energy", ta: "மின்சாரம் & எரிசக்தி" },
    icon: "Zap",
    color: "text-yellow-600 bg-yellow-50",
    markerColor: "#ca8a04",
  },
  {
    id: "Healthcare",
    label: { en: "Healthcare", ta: "மருத்துவம்" },
    icon: "Cross",
    color: "text-red-600 bg-red-50",
    markerColor: "#dc2626",
  },
  {
    id: "Education",
    label: { en: "Education", ta: "கல்வி" },
    icon: "GraduationCap",
    color: "text-blue-600 bg-blue-50",
    markerColor: "#2563eb",
  },
  {
    id: "IT & Tech Parks",
    label: { en: "IT & Tech Parks", ta: "தகவல் தொழில்நுட்பம்" },
    icon: "Building2",
    color: "text-indigo-600 bg-indigo-50",
    markerColor: "#4f46e5",
  },
  {
    id: "Sports & Recreation",
    label: { en: "Sports & Recreation", ta: "விளையாட்டு & பொழுதுபோக்கு" },
    icon: "Trophy",
    color: "text-green-600 bg-green-50",
    markerColor: "#16a34a",
  },
  {
    id: "Museums & Culture",
    label: { en: "Museums & Culture", ta: "அருங்காட்சியகம் & கலாச்சாரம்" },
    icon: "Landmark",
    color: "text-rose-600 bg-rose-50",
    markerColor: "#e11d48",
  },
  {
    id: "Urban Development",
    label: { en: "Urban Development", ta: "நகர மேம்பாடு" },
    icon: "Building",
    color: "text-slate-600 bg-slate-50",
    markerColor: "#475569",
  },
  {
    id: "Ports & Logistics",
    label: { en: "Ports & Logistics", ta: "துறைமுகங்கள் & தளவாடம்" },
    icon: "Ship",
    color: "text-teal-600 bg-teal-50",
    markerColor: "#0d9488",
  },
];

export function getSubTypeConfig(
  subType: InfrastructureSubType
): SubTypeConfig | undefined {
  return INFRASTRUCTURE_SUB_TYPES.find((st) => st.id === subType);
}

export function getSubTypeLabel(
  subType: InfrastructureSubType,
  locale: string
): string {
  const config = getSubTypeConfig(subType);
  if (!config) return subType;
  return locale === "ta" ? config.label.ta : config.label.en;
}
