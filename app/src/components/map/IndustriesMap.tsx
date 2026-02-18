"use client";

import { useMemo, useCallback, useRef } from "react";
import { MapContainer, Marker, Tooltip } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { DistrictLayer } from "./DistrictLayer";
import { tnDistrictsGeoJSON } from "@/lib/data/tnDistricts";
import type { IndustrialPark } from "@/lib/data/industries";
import { TN_CENTER, TN_INITIAL_ZOOM } from "@/lib/utils/mapHelpers";
import { cn } from "@/lib/utils/cn";
import "leaflet/dist/leaflet.css";

// Tamil Nadu bounds - same as TNMap
const TN_BOUNDS: L.LatLngBoundsExpression = [
  [8.0, 76.2],
  [13.6, 80.4],
];

// Sector icons (SVG paths)
const SECTOR_ICONS: Record<string, { path: string; color: string }> = {
  electronics: {
    path: "M9 3v1H4v2h1v11H4v2h16v-2h-1V6h1V4h-5V3H9zm10 4v10H5V7h14zM9 9v2h6V9H9zm0 4v2h6v-2H9z",
    color: "#3b82f6", // blue
  },
  automobile: {
    path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    color: "#ef4444", // red
  },
  ev: {
    path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5zm6 1h2v2h1v-3h-1V9h-2v2h-1v3h1v-2z",
    color: "#ef4444", // red
  },
  textiles: {
    path: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z",
    color: "#8b5cf6", // purple
  },
  footwear: {
    path: "M21.5 9.5c-.28 0-.55.04-.8.13l-6.52 1.49c-.63.17-1.38.38-2.18.38-.8 0-1.55-.21-2.18-.38L3.3 9.63c-.25-.09-.52-.13-.8-.13C1.12 9.5 0 10.62 0 12c0 .78.26 1.47.7 2H.5c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5h23c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5h-.2c.44-.53.7-1.22.7-2 0-1.38-1.12-2.5-2.5-2.5zM12 13c1.24 0 2.35-.36 3.5-.76l5.64-1.79c.22.24.36.56.36.93 0 .75-.62 1.38-1.38 1.38H3.88c-.75 0-1.38-.62-1.38-1.38 0-.37.14-.69.36-.93l5.64 1.79c1.15.4 2.26.76 3.5.76z",
    color: "#f97316", // orange
  },
  renewable: {
    path: "M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5zM12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4h2v2H8v-2zm6 0h2v2h-2v-2z",
    color: "#eab308", // yellow
  },
  solar: {
    path: "M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
    color: "#eab308", // yellow
  },
  pharma: {
    path: "M6 3h12v2H6V3zm11 4H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 9h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z",
    color: "#22c55e", // green
  },
  biotech: {
    path: "M6 3h12v2H6V3zm11 4H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 9h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z",
    color: "#22c55e", // green
  },
  it: {
    path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z",
    color: "#06b6d4", // cyan
  },
  datacenter: {
    path: "M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z",
    color: "#06b6d4", // cyan
  },
  semiconductor: {
    path: "M9 3v1H4v2h1v11H4v2h16v-2h-1V6h1V4h-5V3H9zm10 4v10H5V7h14zM9 9v2h6V9H9zm0 4v2h6v-2H9z",
    color: "#ec4899", // pink
  },
  steel: {
    path: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
    color: "#64748b", // slate
  },
  manufacturing: {
    path: "M22 10l-6-6H8L2 10v12h20V10zM12 5.5L15.5 9h-7L12 5.5zM4 20v-9h16v9H4zm14-5H6v-2h12v2z",
    color: "#64748b", // slate
  },
  logistics: {
    path: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    color: "#78716c", // stone
  },
  default: {
    path: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
    color: "#64748b", // slate
  },
};

// Status border colors
const STATUS_BORDER_COLORS = {
  operational: "#16a34a", // green-600
  announced: "#2563eb", // blue-600
  under_construction: "#d97706", // amber-600
};

// Get icon config based on sector
function getSectorIcon(sectorList: string[]): { path: string; color: string } {
  const sectorLower = sectorList.map(s => s.toLowerCase());

  // Check for specific sectors
  if (sectorLower.some(s => s.includes("semiconductor"))) return SECTOR_ICONS.semiconductor;
  if (sectorLower.some(s => s.includes("electronics") || s.includes("iphone") || s.includes("pcb"))) return SECTOR_ICONS.electronics;
  if (sectorLower.some(s => s.includes("ev") || s.includes("battery"))) return SECTOR_ICONS.ev;
  if (sectorLower.some(s => s.includes("automobile") || s.includes("automotive"))) return SECTOR_ICONS.automobile;
  if (sectorLower.some(s => s.includes("textile"))) return SECTOR_ICONS.textiles;
  if (sectorLower.some(s => s.includes("footwear") || s.includes("leather"))) return SECTOR_ICONS.footwear;
  if (sectorLower.some(s => s.includes("solar") || s.includes("renewable") || s.includes("wind") || s.includes("green hydrogen"))) return SECTOR_ICONS.solar;
  if (sectorLower.some(s => s.includes("pharma") || s.includes("drug"))) return SECTOR_ICONS.pharma;
  if (sectorLower.some(s => s.includes("biotech"))) return SECTOR_ICONS.biotech;
  if (sectorLower.some(s => s.includes("data center") || s.includes("datacenter"))) return SECTOR_ICONS.datacenter;
  if (sectorLower.some(s => s.includes("it") || s.includes("software"))) return SECTOR_ICONS.it;
  if (sectorLower.some(s => s.includes("steel"))) return SECTOR_ICONS.steel;
  if (sectorLower.some(s => s.includes("logistics"))) return SECTOR_ICONS.logistics;
  if (sectorLower.some(s => s.includes("manufacturing"))) return SECTOR_ICONS.manufacturing;

  return SECTOR_ICONS.default;
}

// Create marker icon with sector-specific icon
function createIndustryIcon(park: IndustrialPark) {
  const { path, color } = getSectorIcon(park.sector);
  const borderColor = STATUS_BORDER_COLORS[park.status];

  return L.divIcon({
    className: "custom-industry-marker",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 8px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="${path}"/>
        </svg>
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: ${borderColor};
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Cluster interface
interface MarkerCluster {
  getChildCount(): number;
}

// Create cluster icon
function createClusterIcon(cluster: MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count > 20 ? 52 : count > 10 ? 46 : 40;
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      color: white;
      width: ${size}px;
      height: ${size}px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${size > 46 ? 16 : 14}px;
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
    ">${count}</div>`,
    className: "industry-cluster-icon",
    iconSize: L.point(size, size),
  });
}

// Normalize district names to match GeoJSON
function normalizeDistrictName(district: string): string {
  const mapping: Record<string, string> = {
    "Kanchipuram": "Kancheepuram",
    "Tiruvallur": "Thiruvallur",
    "Multiple": "", // Will not count
  };
  return mapping[district] || district;
}

interface IndustriesMapProps {
  parks: IndustrialPark[];
  locale: string;
  onParkSelect?: (park: IndustrialPark, clickPosition: { x: number; y: number }) => void;
  className?: string;
}

export function IndustriesMap({
  parks,
  locale,
  onParkSelect,
  className,
}: IndustriesMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Filter parks with coordinates
  const parksWithCoords = useMemo(() => {
    return parks.filter((p) => p.coordinates);
  }, [parks]);

  // Calculate park counts by district for choropleth - normalize names
  const parkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    parks.forEach((park) => {
      const normalizedDistrict = normalizeDistrictName(park.district);
      if (normalizedDistrict) {
        counts[normalizedDistrict] = (counts[normalizedDistrict] || 0) + 1;
      }
    });
    return counts;
  }, [parks]);

  const maxCount = Math.max(...Object.values(parkCounts), 1);

  const handleMarkerClick = useCallback(
    (park: IndustrialPark, event: L.LeafletMouseEvent) => {
      const containerPoint = event.containerPoint;
      onParkSelect?.(park, { x: containerPoint.x, y: containerPoint.y });
    },
    [onParkSelect]
  );

  return (
    <div className={`relative ${className || ''}`}>
      <MapContainer
        center={TN_CENTER}
        zoom={TN_INITIAL_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        maxBounds={TN_BOUNDS}
        minZoom={6}
        maxZoom={12}
        ref={mapRef}
        preferCanvas={true}
        zoomControl={true}
        touchZoom={true}
        dragging={true}
        doubleClickZoom={true}
      >

      {/* District layer */}
      <DistrictLayer
        geojson={tnDistrictsGeoJSON}
        projectCounts={parkCounts}
        maxCount={maxCount}
        locale={locale}
      />

      {/* Industrial park markers */}
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        disableClusteringAtZoom={10}
      >
        {parksWithCoords.map((park) => (
          <Marker
            key={park.id}
            position={[park.coordinates!.lat, park.coordinates!.lng]}
            icon={createIndustryIcon(park)}
            eventHandlers={{
              click: (e) => handleMarkerClick(park, e),
            }}
          >
            <Tooltip direction="top" offset={[0, -20]}>
              <div className="max-w-[280px]">
                {park.company && (
                  <p className="text-xs text-teal-700 font-semibold">{park.company}</p>
                )}
                <p className="font-semibold text-slate-900 text-sm">{park.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {park.location}, {park.district}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-white font-medium",
                      park.status === "operational" && "bg-green-600",
                      park.status === "announced" && "bg-blue-600",
                      park.status === "under_construction" && "bg-amber-600"
                    )}
                  >
                    {park.status === "operational"
                      ? "Operational"
                      : park.status === "announced"
                        ? "Announced"
                        : "Under Construction"}
                  </span>
                  {park.investmentCrore && (
                    <span className="text-amber-700 font-semibold">
                      ₹{park.investmentCrore.toLocaleString()} Cr
                    </span>
                  )}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
    </div>
  );
}
