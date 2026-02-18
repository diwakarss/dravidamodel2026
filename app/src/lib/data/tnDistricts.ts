// Tamil Nadu District GeoJSON Data
// Data loaded from tn-districts.json (generated from tn-districts-real.json)

import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import tnDistrictsData from "@/data/tn-districts.json";

export interface DistrictProperties {
  district: string;
  district_ta: string;
}

export const tnDistrictsGeoJSON = tnDistrictsData as FeatureCollection<Polygon | MultiPolygon, DistrictProperties>;
