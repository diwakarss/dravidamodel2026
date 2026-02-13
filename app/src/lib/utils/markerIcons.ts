import L from "leaflet";

// Cluster type from leaflet.markercluster plugin
interface MarkerCluster {
  getChildCount(): number;
}

// Project type to icon color mapping
const TYPE_COLORS: Record<string, string> = {
  "Public Transport": "#2563eb",
  "Roads/Highways": "#7c3aed",
  "Water/Sanitation": "#0891b2",
  "Education/Health": "#16a34a",
  "Power/Utilities": "#ea580c",
  Other: "#6b7280",
};

// Status to ring color
const STATUS_COLORS: Record<string, string> = {
  Completed: "#16a34a",
  Ongoing: "#2563eb",
  Planned: "#6b7280",
};

// Create SVG marker icon
export function createProjectIcon(
  type: string,
  status: string,
  size: number = 28
): L.DivIcon {
  const fillColor = TYPE_COLORS[type] || TYPE_COLORS["Other"];
  const strokeColor = STATUS_COLORS[status] || STATUS_COLORS["Planned"];

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3"/>
      <circle cx="16" cy="16" r="5" fill="white" opacity="0.9"/>
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
