import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const dataDir = path.join(__dirname, "../src/data");
const outputPath = path.join(__dirname, "../public/checksums.json");

function generateChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

console.log("Generating checksums...");

const checksums: Record<string, string> = {};

// Main data files
const infrastructurePath = path.join(dataDir, "infrastructure.json");
checksums["infrastructure.json"] = generateChecksum(infrastructurePath);

const industriesPath = path.join(dataDir, "industries.json");
if (fs.existsSync(industriesPath)) {
  checksums["industries.json"] = generateChecksum(industriesPath);
}

// Individual project files (if they exist)
const projectsDir = path.join(dataDir, "projects");
if (fs.existsSync(projectsDir)) {
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));
  files.forEach((file) => {
    checksums[`projects/${file}`] = generateChecksum(
      path.join(projectsDir, file)
    );
  });
}

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      checksums,
    },
    null,
    2
  )
);

console.log(`✅ Generated ${Object.keys(checksums).length} checksums`);
console.log(`   Output: ${outputPath}`);
