"use client";

import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Layer, PathOptions, LatLngBounds } from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import { getChoroplethColor } from "@/lib/utils/mapHelpers";

interface DistrictLayerProps {
  geojson: FeatureCollection;
  projectCounts: Record<string, number>;
  maxCount: number;
  onDistrictClick?: (district: string, bounds?: LatLngBounds) => void;
  locale: string;
}

export function DistrictLayer({
  geojson,
  projectCounts,
  maxCount,
  onDistrictClick,
  locale,
}: DistrictLayerProps) {
  const style = (feature: Feature | undefined): PathOptions => {
    if (!feature?.properties) return {};

    const district = feature.properties.district as string;
    const count = projectCounts[district] || 0;

    return {
      fillColor: getChoroplethColor(count, maxCount),
      fillOpacity: 0.6,
      color: "#94a3b8", // soft slate border
      weight: 1,
      opacity: 0.8,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const district = feature.properties?.district as string;
    const districtTa = feature.properties?.district_ta as string;
    const count = projectCounts[district] || 0;

    const displayName = locale === "ta" ? districtTa : district;
    const projectLabel = locale === "ta" ? "திட்டங்கள்" : "projects";

    // Bind tooltip
    layer.bindTooltip(
      `<strong>${displayName}</strong><br/>${count} ${projectLabel}`,
      { sticky: true, className: "district-tooltip" }
    );

    // Click handler
    layer.on({
      click: () => {
        if (onDistrictClick) {
          // Get bounds from feature geometry
          const geojsonLayer = layer as L.GeoJSON;
          const bounds = geojsonLayer.getBounds?.();
          onDistrictClick(district, bounds);
        }
      },
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          fillOpacity: 0.8,
          color: "#475569", // darker border on hover
        });
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 1,
          fillOpacity: 0.6,
          color: "#94a3b8",
        });
      },
    });
  };

  return (
    <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
  );
}
