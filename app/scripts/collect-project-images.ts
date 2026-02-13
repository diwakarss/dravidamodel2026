/**
 * Project Image Collection Script
 *
 * This script processes all projects and collects images:
 * 1. First preference: Download actual project photos from media.photoUrl
 * 2. Second preference: Use generated images from planning stage
 * 3. Fallback: Use a placeholder image
 *
 * Usage: npx tsx scripts/collect-project-images.ts [--dry-run] [--project-id=<id>]
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import projectsJson from "../src/data/projects.json";

const IMAGES_DIR = path.join(__dirname, "../public/images/projects");
const PLACEHOLDER_URL = "https://placehold.co/800x600/e2e8f0/64748b?text=Project+Image";

interface Project {
  id: string;
  name: { en: string; ta: string };
  media?: {
    photoUrl?: string | null;
    photoCaption?: string | null;
  };
  subType?: string;
}

interface ImageResult {
  projectId: string;
  projectName: string;
  status: "downloaded" | "exists" | "failed" | "placeholder" | "skipped";
  source?: string;
  error?: string;
  localPath?: string;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const specificProject = args.find(a => a.startsWith("--project-id="))?.split("=")[1];

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function sanitizeFilename(id: string): string {
  return id.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();
}

function getImageExtension(url: string, contentType?: string): string {
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";

  // Try from URL
  const urlLower = url.toLowerCase();
  if (urlLower.includes(".jpg") || urlLower.includes(".jpeg")) return ".jpg";
  if (urlLower.includes(".png")) return ".png";
  if (urlLower.includes(".webp")) return ".webp";
  if (urlLower.includes(".gif")) return ".gif";

  return ".jpg"; // default
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "image/*",
      },
      timeout: 30000,
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, destPath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.log(`  HTTP ${response.statusCode} for ${url}`);
        resolve(false);
        return;
      }

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("image")) {
        console.log(`  Not an image: ${contentType}`);
        resolve(false);
        return;
      }

      const ext = getImageExtension(url, contentType);
      const finalPath = destPath.replace(/\.[^.]+$/, ext);

      const file = fs.createWriteStream(finalPath);
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        // Check if file has content
        const stats = fs.statSync(finalPath);
        if (stats.size < 1000) {
          fs.unlinkSync(finalPath);
          resolve(false);
        } else {
          resolve(true);
        }
      });

      file.on("error", (err) => {
        fs.unlink(finalPath, () => {});
        console.log(`  Write error: ${err.message}`);
        resolve(false);
      });
    });

    request.on("error", (err) => {
      console.log(`  Request error: ${err.message}`);
      resolve(false);
    });

    request.on("timeout", () => {
      request.destroy();
      console.log(`  Timeout`);
      resolve(false);
    });
  });
}

function isDirectImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
}

async function processProject(project: Project): Promise<ImageResult> {
  const filename = sanitizeFilename(project.id);
  const basePath = path.join(IMAGES_DIR, filename);

  // Check if image already exists
  const existingFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.startsWith(filename));
  if (existingFiles.length > 0) {
    return {
      projectId: project.id,
      projectName: project.name.en,
      status: "exists",
      localPath: path.join(IMAGES_DIR, existingFiles[0]),
    };
  }

  if (dryRun) {
    return {
      projectId: project.id,
      projectName: project.name.en,
      status: "skipped",
      source: project.media?.photoUrl || "no URL",
    };
  }

  // Try to download from photoUrl if it's a direct image URL
  if (project.media?.photoUrl && isDirectImageUrl(project.media.photoUrl)) {
    console.log(`Downloading: ${project.id} - ${project.name.en.substring(0, 50)}...`);
    console.log(`  URL: ${project.media.photoUrl}`);

    const success = await downloadImage(project.media.photoUrl, basePath + ".jpg");
    if (success) {
      return {
        projectId: project.id,
        projectName: project.name.en,
        status: "downloaded",
        source: project.media.photoUrl,
        localPath: basePath + ".jpg",
      };
    }
  }

  // Log URLs that are gallery pages (not direct images) for manual review
  if (project.media?.photoUrl && !isDirectImageUrl(project.media.photoUrl)) {
    console.log(`Gallery URL (needs manual extraction): ${project.id}`);
    console.log(`  ${project.media.photoUrl}`);
  }

  // For now, mark as needing placeholder
  return {
    projectId: project.id,
    projectName: project.name.en,
    status: "placeholder",
    source: project.media?.photoUrl || undefined,
  };
}

async function main() {
  console.log("=== Project Image Collection ===\n");
  console.log(`Images directory: ${IMAGES_DIR}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Total projects: ${projectsJson.projects.length}\n`);

  const projects = specificProject
    ? projectsJson.projects.filter(p => p.id === specificProject)
    : projectsJson.projects;

  if (specificProject && projects.length === 0) {
    console.error(`Project not found: ${specificProject}`);
    process.exit(1);
  }

  const results: ImageResult[] = [];

  for (const project of projects as Project[]) {
    const result = await processProject(project);
    results.push(result);

    // Rate limit
    if (result.status === "downloaded") {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  const counts = {
    downloaded: results.filter(r => r.status === "downloaded").length,
    exists: results.filter(r => r.status === "exists").length,
    placeholder: results.filter(r => r.status === "placeholder").length,
    failed: results.filter(r => r.status === "failed").length,
    skipped: results.filter(r => r.status === "skipped").length,
  };

  console.log(`Downloaded: ${counts.downloaded}`);
  console.log(`Already exists: ${counts.exists}`);
  console.log(`Need placeholder: ${counts.placeholder}`);
  console.log(`Failed: ${counts.failed}`);
  console.log(`Skipped: ${counts.skipped}`);

  // Write report
  const reportPath = path.join(__dirname, "../image-collection-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: counts,
    results,
  }, null, 2));
  console.log(`\nReport written to: ${reportPath}`);

  // List projects needing manual image collection
  const needsManual = results.filter(r => r.status === "placeholder");
  if (needsManual.length > 0) {
    console.log(`\n=== Projects Needing Manual Image Collection (${needsManual.length}) ===`);
    needsManual.slice(0, 10).forEach(r => {
      console.log(`- ${r.projectId}: ${r.projectName.substring(0, 60)}`);
      if (r.source) console.log(`  Source: ${r.source}`);
    });
    if (needsManual.length > 10) {
      console.log(`... and ${needsManual.length - 10} more (see report)`);
    }
  }
}

main().catch(console.error);
