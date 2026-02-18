/**
 * Convert downloaded GeoJSON to our format with Tamil names
 */
const fs = require("fs");
const path = require("path");

const TAMIL_NAMES: Record<string, string> = {
  "Chennai": "சென்னை",
  "Coimbatore": "கோயம்புத்தூர்",
  "Madurai": "மதுரை",
  "Tiruchirappalli": "திருச்சிராப்பள்ளி",
  "Tiruchchirappalli": "திருச்சிராப்பள்ளி",
  "Salem": "சேலம்",
  "Tirunelveli": "திருநெல்வேலி",
  "Tirunelveli Kattabo": "திருநெல்வேலி",
  "Tiruppur": "திருப்பூர்",
  "Erode": "ஈரோடு",
  "Vellore": "வேலூர்",
  "Thoothukudi": "தூத்துக்குடி",
  "Thanjavur": "தஞ்சாவூர்",
  "Dindigul": "திண்டுக்கல்",
  "Kanchipuram": "காஞ்சிபுரம்",
  "Cuddalore": "கடலூர்",
  "Kanyakumari": "கன்னியாகுமரி",
  "Tiruvallur": "திருவள்ளூர்",
  "Villupuram": "விழுப்புரம்",
  "Namakkal": "நாமக்கல்",
  "Dharmapuri": "தர்மபுரி",
  "Krishnagiri": "கிருஷ்ணகிரி",
  "Ramanathapuram": "இராமநாதபுரம்",
  "Virudhunagar": "விருதுநகர்",
  "Sivaganga": "சிவகங்கை",
  "Sivagangai": "சிவகங்கை",
  "Pudukkottai": "புதுக்கோட்டை",
  "Perambalur": "பெரம்பலூர்",
  "Ariyalur": "அரியலூர்",
  "Nagapattinam": "நாகப்பட்டினம்",
  "Tiruvarur": "திருவாரூர்",
  "Karur": "கரூர்",
  "The Nilgiris": "நீலகிரி",
  "Nilgiris": "நீலகிரி",
  "Theni": "தேனி",
  "Tiruvannamalai": "திருவண்ணாமலை",
  "Ranipet": "ராணிப்பேட்டை",
  "Chengalpattu": "செங்கல்பட்டு",
  "Kallakurichi": "கள்ளக்குறிச்சி",
  "Tenkasi": "தென்காசி",
  "Tirupattur": "திருப்பத்தூர்",
  "Mayiladuthurai": "மயிலாடுதுறை",
};

// Name normalization
const NAME_MAP: Record<string, string> = {
  "Tiruchchirappalli": "Tiruchirappalli",
  "Tirunelveli Kattabo": "Tirunelveli",
  "Sivagangai": "Sivaganga",
  "Nilgiris": "The Nilgiris",
};

const inputPath = path.join(__dirname, "../src/data/tn-districts-real.json");
const jsonOutputPath = path.join(__dirname, "../src/data/tn-districts.json");
const tsOutputPath = path.join(__dirname, "../src/lib/data/tnDistricts.ts");

const rawData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const features = rawData.features.map((f: any) => {
  const originalName = f.properties.NAME_2;
  const normalizedName = NAME_MAP[originalName] || originalName;
  const tamilName = TAMIL_NAMES[normalizedName] || TAMIL_NAMES[originalName] || normalizedName;

  return {
    type: "Feature",
    properties: {
      district: normalizedName,
      district_ta: tamilName,
    },
    geometry: f.geometry,
  };
});

// Output JSON data file
const jsonOutput = { type: "FeatureCollection", features };
fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonOutput, null, 2));
console.log(`Converted ${features.length} districts to JSON`);

// Output TypeScript wrapper
const tsOutput = `// Tamil Nadu District GeoJSON Data
// Data loaded from tn-districts.json (generated from tn-districts-real.json)

import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import tnDistrictsData from "@/data/tn-districts.json";

export interface DistrictProperties {
  district: string;
  district_ta: string;
}

export const tnDistrictsGeoJSON = tnDistrictsData as FeatureCollection<Polygon | MultiPolygon, DistrictProperties>;
`;

fs.writeFileSync(tsOutputPath, tsOutput);
console.log(`Generated TypeScript wrapper`);
