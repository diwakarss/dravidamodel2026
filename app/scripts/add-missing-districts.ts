import * as fs from "fs";
import * as path from "path";

// Fetch district boundary from OSM Nominatim
async function fetchDistrictBoundary(districtName: string): Promise<any> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(districtName + " district Tamil Nadu")}&format=json&polygon_geojson=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "DravidaModel2026/1.0" }
  });
  const data = await res.json();
  if (data.length > 0 && data[0].geojson) {
    return data[0].geojson;
  }
  return null;
}

const TAMIL_NAMES: Record<string, string> = {
  "Tiruppur": "திருப்பூர்",
  "Krishnagiri": "கிருஷ்ணகிரி",
  "Chengalpattu": "செங்கல்பட்டு",
  "Kallakurichi": "கள்ளக்குறிச்சி",
  "Ranipet": "ராணிப்பேட்டை",
  "Tenkasi": "தென்காசி",
  "Tirupattur": "திருப்பத்தூர்",
  "Mayiladuthurai": "மயிலாடுதுறை",
};

const MISSING_DISTRICTS = [
  "Tiruppur",
  "Krishnagiri", 
  "Chengalpattu",
  "Kallakurichi",
  "Ranipet",
  "Tenkasi",
  "Tirupattur",
  "Mayiladuthurai",
];

async function main() {
  const tsPath = path.join(__dirname, "../src/data/tn-districts.ts");
  const content = fs.readFileSync(tsPath, "utf-8");
  
  // Extract JSON using regex
  const jsonMatch = content.match(/=\s*(\{[\s\S]*\});?\s*$/);
  if (!jsonMatch) {
    console.error("Could not find JSON in file");
    return;
  }
  
  let geojson: any;
  try {
    geojson = JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return;
  }
  
  const features = geojson.features;
  
  // Check which districts are already present
  const existingDistricts = new Set(features.map((f: any) => f.properties.district.toLowerCase()));
  console.log(`Existing districts: ${existingDistricts.size}`);
  
  // Add missing districts
  for (const district of MISSING_DISTRICTS) {
    if (existingDistricts.has(district.toLowerCase())) {
      console.log(`${district} already exists, skipping`);
      continue;
    }
    
    console.log(`Fetching boundary for ${district}...`);
    const geometry = await fetchDistrictBoundary(district);
    
    if (geometry) {
      features.push({
        type: "Feature",
        properties: {
          district: district,
          district_ta: TAMIL_NAMES[district] || district,
        },
        geometry: geometry,
      });
      console.log(`Added ${district}`);
    } else {
      console.log(`Could not fetch ${district}`);
    }
    
    // Rate limit for OSM
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // Write back
  const newContent = `import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

export interface DistrictProperties {
  district: string;
  district_ta: string;
}

export const tnDistrictsGeoJSON: FeatureCollection<Polygon | MultiPolygon, DistrictProperties> = ${JSON.stringify(geojson, null, 2)};
`;

  fs.writeFileSync(tsPath, newContent);
  console.log(`Done! Total districts: ${features.length}`);
}

main().catch(console.error);
