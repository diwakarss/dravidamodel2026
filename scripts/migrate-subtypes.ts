/**
 * Migration script to add subType field to existing projects
 * Maps legacy "type" field to new "subType" field
 *
 * Usage: npx tsx scripts/migrate-subtypes.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Type mappings from legacy type to new subType
const TYPE_TO_SUBTYPE: Record<string, string> = {
  "Public Transport": "Metro & Rail", // Could be Metro, Bus, or Rail - needs manual review
  "Roads/Highways": "Roads & Bridges",
  "Water/Sanitation": "Water & Sanitation",
  "Education/Health": "Healthcare", // Could be Education or Healthcare - needs manual review
  "Power/Utilities": "Power & Energy",
  Other: "Urban Development", // Catch-all for unspecified
};

// Keywords to help infer subType from project name
const KEYWORD_MAP: Record<string, string[]> = {
  "Metro & Rail": [
    "metro",
    "rail",
    "railway",
    "train",
    "mrts",
    "suburban",
    "chord",
  ],
  "Roads & Bridges": [
    "road",
    "highway",
    "bridge",
    "flyover",
    "bypass",
    "expressway",
    "elevated",
    "corridor",
  ],
  "Bus & Transport": ["bus", "depot", "terminal", "transport", "mofussil"],
  "Water & Sanitation": [
    "water",
    "sewage",
    "drainage",
    "storm",
    "desalination",
    "drinking",
    "sanitation",
    "supply",
  ],
  "Power & Energy": [
    "power",
    "electricity",
    "solar",
    "wind",
    "substation",
    "thermal",
    "energy",
  ],
  Healthcare: [
    "hospital",
    "health",
    "medical",
    "clinic",
    "aiims",
    "trauma",
    "care",
  ],
  Education: [
    "school",
    "college",
    "university",
    "iit",
    "institute",
    "educational",
    "library",
  ],
  "IT & Tech Parks": [
    "it park",
    "tech park",
    "tidco",
    "tidel",
    "software",
    "elcot",
    "sipcot",
  ],
  "Sports & Recreation": [
    "stadium",
    "sports",
    "cricket",
    "football",
    "athletic",
    "aquatic",
  ],
  "Museums & Culture": [
    "museum",
    "memorial",
    "heritage",
    "cultural",
    "gallery",
    "library",
  ],
  "Urban Development": [
    "smart city",
    "urban",
    "redevelopment",
    "township",
    "housing",
  ],
  "Ports & Logistics": [
    "port",
    "harbor",
    "harbour",
    "fishing",
    "maritime",
    "logistics",
    "airport",
  ],
};

interface Project {
  id: string;
  name: { en: string; ta: string };
  type: string;
  subType?: string;
  [key: string]: unknown;
}

interface ProjectsData {
  version: string;
  generated: string;
  totalProjects: number;
  checksum: string;
  projects: Project[];
}

function inferSubType(project: Project): string {
  const nameEn = project.name.en.toLowerCase();
  const notes = ((project.notes as string) || "").toLowerCase();
  const combined = `${nameEn} ${notes}`;

  // Check keywords in order of specificity
  for (const [subType, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return subType;
      }
    }
  }

  // Fall back to type mapping
  return TYPE_TO_SUBTYPE[project.type] || "Urban Development";
}

function computeChecksum(projects: Project[]): string {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(projects));
  return hash.digest("hex");
}

async function migrate() {
  const projectsPath = path.join(
    __dirname,
    "../app/src/data/projects.json"
  );

  console.log("Reading projects.json...");
  const rawData = fs.readFileSync(projectsPath, "utf-8");
  const data: ProjectsData = JSON.parse(rawData);

  console.log(`Found ${data.projects.length} projects`);

  // Stats
  const stats: Record<string, number> = {};
  let modified = 0;

  // Process each project
  for (const project of data.projects) {
    if (!project.subType) {
      const inferred = inferSubType(project);
      project.subType = inferred;
      modified++;

      stats[inferred] = (stats[inferred] || 0) + 1;
    }
  }

  console.log(`\nModified ${modified} projects`);
  console.log("\nSubType distribution:");
  for (const [subType, count] of Object.entries(stats).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${subType}: ${count}`);
  }

  // Update checksum
  data.checksum = computeChecksum(data.projects);
  data.generated = new Date().toISOString().split("T")[0];

  // Write back
  console.log("\nWriting updated projects.json...");
  fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2));

  console.log("Done!");
}

migrate().catch(console.error);
