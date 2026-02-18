"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, useMap } from "react-leaflet";
import type { Map as LeafletMap, LatLngBounds } from "leaflet";
import L from "leaflet";
import { DistrictLayer } from "./DistrictLayer";
import { ProjectMarkers } from "./ProjectMarkers";
import { projects } from "@/lib/data/projects";
import type { Project } from "@/lib/schemas/project";
import {
  TN_CENTER,
  TN_INITIAL_ZOOM,
  getProjectCountsByDistrict,
} from "@/lib/utils/mapHelpers";
import { tnDistrictsGeoJSON } from "@/lib/data/tnDistricts";

import "leaflet/dist/leaflet.css";

// Tamil Nadu bounds - tighter fit for district-only view
const TN_BOUNDS: L.LatLngBoundsExpression = [
  [8.0, 76.2],
  [13.6, 80.4],
];

const DISTRICT_ZOOM = 10;

interface TNMapProps {
  onDistrictSelect?: (district: string) => void;
  onProjectSelect?: (project: Project) => void;
  className?: string;
  locale: string;
  filteredProjects?: Project[];
}

function ZoomController({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: DISTRICT_ZOOM });
    }
  }, [map, bounds]);

  return null;
}

export function TNMap({
  onDistrictSelect,
  onProjectSelect,
  className,
  locale,
  filteredProjects,
}: TNMapProps) {
  // Use filtered projects if provided, otherwise use all projects
  const displayProjects = filteredProjects ?? projects;
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [zoomBounds, setZoomBounds] = useState<LatLngBounds | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate project counts from displayed (filtered) projects
  const projectCounts = getProjectCountsByDistrict(displayProjects);
  const maxCount = Math.max(...Object.values(projectCounts), 1);

  // Get projects for selected district from displayed (filtered) projects
  const districtProjects = selectedDistrict
    ? displayProjects.filter((p) => p.location.district === selectedDistrict)
    : [];

  const handleDistrictClick = useCallback(
    (district: string, bounds?: LatLngBounds) => {
      setSelectedDistrict(district);
      if (bounds) {
        setZoomBounds(bounds);
      }
      onDistrictSelect?.(district);
    },
    [onDistrictSelect]
  );

  const handleProjectClick = useCallback(
    (project: Project) => {
      onProjectSelect?.(project);
    },
    [onProjectSelect]
  );

  const handleReset = useCallback(() => {
    setSelectedDistrict(null);
    setZoomBounds(null);
    if (mapRef.current) {
      mapRef.current.fitBounds(TN_BOUNDS);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  return (
    <div className={`relative ${className}`}>
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
        zoomControl={!isMobile}
        touchZoom={true}
        dragging={true}
        doubleClickZoom={true}
      >
        {/* No TileLayer - district-only map */}
        <DistrictLayer
          geojson={tnDistrictsGeoJSON}
          projectCounts={projectCounts}
          maxCount={maxCount}
          onDistrictClick={handleDistrictClick}
          locale={locale}
        />

        {/* Always show ALL project markers */}
        <ProjectMarkers
          projects={displayProjects}
          locale={locale}
          onProjectClick={handleProjectClick}
        />

        <ZoomController bounds={zoomBounds} />
      </MapContainer>

      {/* Desktop: Reset button */}
      {selectedDistrict && !isMobile && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md border border-slate-200 text-sm font-medium text-navy-700 hover:bg-slate-50 transition-colors"
        >
          ← {locale === "ta" ? "அனைத்து மாவட்டங்கள்" : "All districts"}
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-slate-200">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          {locale === "ta" ? "திட்ட அடர்த்தி" : "Project Density"}
        </p>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "#f0fdf4" }}></div>
          <div className="w-3 h-3 rounded" style={{ background: "#dcfce7" }}></div>
          <div className="w-3 h-3 rounded" style={{ background: "#86efac" }}></div>
          <div className="w-3 h-3 rounded" style={{ background: "#22c55e" }}></div>
          <span className="text-xs text-slate-600 ml-2">
            {locale === "ta" ? "குறைவு → அதிகம்" : "Low → High"}
          </span>
        </div>
      </div>

      {/* Mobile controls */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 safe-area-bottom">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {selectedDistrict ? (
                <div>
                  <p className="text-sm font-semibold text-navy-900 truncate">
                    {selectedDistrict}
                  </p>
                  <p className="text-xs text-slate-600">
                    {districtProjects.length}{" "}
                    {locale === "ta" ? "திட்டங்கள்" : "projects"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  {locale === "ta" ? "அனைத்து மாவட்டங்கள்" : "All Districts"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedDistrict && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="touch-target px-3 py-2 text-sm font-medium text-navy-700 bg-slate-100 rounded-full"
                  aria-label="Back to all districts"
                >
                  ← {locale === "ta" ? "திரும்பு" : "Back"}
                </button>
              )}
              <button
                type="button"
                onClick={handleZoomOut}
                className="touch-target flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 text-navy-700"
                aria-label="Zoom out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="touch-target flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 text-navy-700"
                aria-label="Zoom in"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
