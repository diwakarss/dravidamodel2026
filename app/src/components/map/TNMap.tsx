"use client";

import { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { DistrictLayer } from "./DistrictLayer";
import { projects } from "@/lib/data/projects";
import {
  TN_CENTER,
  TN_INITIAL_ZOOM,
  getProjectCountsByDistrict,
} from "@/lib/utils/mapHelpers";
import { tnDistrictsGeoJSON } from "@/data/tn-districts";

import "leaflet/dist/leaflet.css";

interface TNMapProps {
  onDistrictSelect?: (district: string) => void;
  className?: string;
  locale: string;
}

export function TNMap({ onDistrictSelect, className, locale }: TNMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Calculate project counts
  const projectCounts = getProjectCountsByDistrict(projects);
  const maxCount = Math.max(...Object.values(projectCounts), 1);

  const handleDistrictClick = useCallback(
    (district: string) => {
      setSelectedDistrict(district);
      onDistrictSelect?.(district);
    },
    [onDistrictSelect]
  );

  const handleReset = useCallback(() => {
    setSelectedDistrict(null);
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={TN_CENTER}
        zoom={TN_INITIAL_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        minZoom={6}
        maxZoom={14}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <DistrictLayer
          geojson={tnDistrictsGeoJSON}
          projectCounts={projectCounts}
          maxCount={maxCount}
          onDistrictClick={handleDistrictClick}
          locale={locale}
        />
      </MapContainer>

      {selectedDistrict && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md border border-slate-200 text-sm font-medium text-navy-700 hover:bg-slate-50 transition-colors"
        >
          ← {locale === "ta" ? "அனைத்து மாவட்டங்கள்" : "All districts"}
        </button>
      )}
    </div>
  );
}
