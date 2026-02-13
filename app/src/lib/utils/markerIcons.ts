import L from "leaflet";
import { INFRASTRUCTURE_SUB_TYPES } from "@/lib/constants/subTypes";
import type { InfrastructureSubType } from "@/lib/schemas/project";

// Cluster type from leaflet.markercluster plugin
interface MarkerCluster {
  getChildCount(): number;
}

// Build subType color map from constants
const SUBTYPE_COLORS: Record<string, string> = {};
for (const st of INFRASTRUCTURE_SUB_TYPES) {
  SUBTYPE_COLORS[st.id] = st.markerColor;
}

// Fallback for legacy types
const LEGACY_TYPE_COLORS: Record<string, string> = {
  "Public Transport": "#9333ea",
  "Roads/Highways": "#ea580c",
  "Water/Sanitation": "#0891b2",
  "Education/Health": "#dc2626",
  "Power/Utilities": "#ca8a04",
  Other: "#475569",
};

// SVG path icons for each subType (simplified icons)
const SUBTYPE_ICONS: Record<string, string> = {
  "Metro & Rail": "M4 11V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v3M4 11h16M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M8 16h.01M16 16h.01", // train
  "Roads & Bridges": "M4 19h16M4 15l4-8h8l4 8M8 15v4M16 15v4", // bridge
  "Bus & Transport": "M4 17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v10zM8 17h.01M16 17h.01M4 11h16", // bus
  "Water & Sanitation": "M12 2v6m0 0c-3.5 0-6 2.5-6 6s2.5 6 6 6 6-2.5 6-6-2.5-6-6-6z", // droplet
  "Power & Energy": "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // lightning
  "Healthcare": "M12 6v12M6 12h12", // plus/cross
  "Education": "M12 3L2 9l10 6 10-6-10-6zM2 9v8l10 6 10-6V9", // graduation cap
  "IT & Tech Parks": "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6", // building
  "Sports & Recreation": "M6 9a6 6 0 1 0 12 0 6 6 0 0 0-12 0zM12 15v6M9 18h6", // trophy
  "Museums & Culture": "M3 21h18M5 21V9l7-6 7 6v12M9 21v-4h6v4", // landmark
  "Urban Development": "M3 21h18M9 21V11h6v10M5 21V7h4v14M15 21V7h4v14", // city buildings
  "Ports & Logistics": "M3 17l6-6 4 4 8-8M3 17h4v4", // ship/anchor
};

// Create SVG marker icon with actual project icon
export function createProjectIcon(
  typeOrSubType: string,
  status: string,
  subType?: InfrastructureSubType,
  size: number = 36
): L.DivIcon {
  const fillColor = subType
    ? SUBTYPE_COLORS[subType] || LEGACY_TYPE_COLORS[typeOrSubType] || "#475569"
    : LEGACY_TYPE_COLORS[typeOrSubType] || "#475569";

  const iconPath = subType ? SUBTYPE_ICONS[subType] : null;

  // Create marker with icon inside - larger and more visible
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="${fillColor}" stroke="white" stroke-width="2.5"/>
      ${iconPath ? `<g transform="translate(6, 6) scale(1)">
        <path d="${iconPath}" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>` : `<circle cx="18" cy="18" r="5" fill="white"/>`}
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "project-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Create cluster icon with count
export function createClusterIcon(cluster: MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  const bgColor = count < 10 ? "#4a7ca8" : count < 50 ? "#264d73" : "#0f2744";

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${bgColor}" stroke="white" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="13" font-weight="600" font-family="system-ui">${count}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "cluster-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
