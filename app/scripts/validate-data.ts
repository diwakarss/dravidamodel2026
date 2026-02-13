import { ProjectsDataSchema } from "../src/lib/schemas/project";
import * as fs from "fs";
import * as path from "path";

const dataPath = path.join(__dirname, "../src/data/projects.json");

console.log("Validating project data...");

try {
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const jsonData = JSON.parse(rawData);

  const result = ProjectsDataSchema.safeParse(jsonData);

  if (!result.success) {
    console.error("\n❌ Validation failed:\n");

    const errors = result.error.issues;
    errors.slice(0, 10).forEach((err, i) => {
      console.error(`  ${i + 1}. Path: ${err.path.join(".")}`);
      console.error(`     Error: ${err.message}`);
      console.error("");
    });

    if (errors.length > 10) {
      console.error(`  ... and ${errors.length - 10} more errors`);
    }

    process.exit(1);
  }

  const totalBudget = result.data.projects.reduce(
    (s, p) => s + (p.budget?.crore ?? 0),
    0
  );

  console.log(`✅ Validated ${result.data.projects.length} projects`);
  console.log(`   Total budget: ₹${Math.round(totalBudget).toLocaleString()} crore`);
  console.log(`   Checksum: ${result.data.checksum.slice(0, 16)}...`);
} catch (err) {
  console.error("❌ Failed to read or parse data file:", err);
  process.exit(1);
}
