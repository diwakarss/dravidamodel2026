#!/usr/bin/env npx tsx
/**
 * Source Link Validator
 *
 * Validates source URLs in data files by:
 * 1. Checking if the URL is reachable (HTTP status)
 * 2. Checking if the page content matches expected keywords from the entry
 * 3. Detecting generic homepages vs specific article pages
 *
 * Usage:
 *   npx tsx scripts/validate-sources.ts
 *   npx tsx scripts/validate-sources.ts --file healthcare.json
 *   npx tsx scripts/validate-sources.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../app/src/data');

interface Source {
  title: string;
  url: string;
  type: string;
}

interface DataEntry {
  id: string;
  name: { en: string; ta?: string };
  sources?: Source[];
  [key: string]: unknown;
}

interface ValidationResult {
  file: string;
  entryId: string;
  entryName: string;
  sourceUrl: string;
  sourceTitle: string;
  status: 'valid' | 'broken' | 'homepage' | 'no-match' | 'timeout' | 'error';
  httpStatus?: number;
  reason?: string;
  matchScore?: number;
}

// Files that contain source links
const DATA_FILES = [
  'healthcare.json',
  'education.json',
  'infrastructure.json',
  'socialWelfare.json',
  'environment.json',
  'agriculture.json',
  'sportsCulture.json',
  'employment.json',
  'tamilHistory.json',
];

// Keywords that indicate a generic homepage
const HOMEPAGE_INDICATORS = [
  'welcome to',
  'official website',
  'home page',
  'main page',
  'portal',
  'department of',
  'government of tamil nadu',
  'login',
  'sign in',
];

// Common 404/error page indicators
const ERROR_INDICATORS = [
  'page not found',
  '404',
  'not found',
  'error',
  'sorry',
  'no longer available',
  'moved permanently',
  'this page doesn\'t exist',
];

async function fetchWithTimeout(url: string, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function extractKeywords(entry: DataEntry): string[] {
  const keywords: string[] = [];

  // Extract from name
  if (entry.name?.en) {
    keywords.push(...entry.name.en.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  }

  // Extract from description if available
  const description = entry.description as { en?: string } | undefined;
  if (description?.en) {
    const words = description.en.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    keywords.push(...words.slice(0, 10)); // Limit to first 10 significant words
  }

  // Extract from highlights if available
  const highlights = entry.highlights as Array<{ en?: string }> | undefined;
  if (highlights && Array.isArray(highlights)) {
    for (const h of highlights.slice(0, 3)) {
      if (h.en) {
        keywords.push(...h.en.toLowerCase().split(/\s+/).filter(w => w.length > 4));
      }
    }
  }

  // Deduplicate and filter common words
  const commonWords = new Set(['with', 'from', 'that', 'this', 'have', 'been', 'were', 'will', 'their', 'which', 'more', 'than', 'other']);
  return [...new Set(keywords)].filter(w => !commonWords.has(w));
}

function calculateMatchScore(content: string, keywords: string[]): number {
  if (!content || keywords.length === 0) return 0;

  const lowerContent = content.toLowerCase();
  let matches = 0;

  for (const keyword of keywords) {
    if (lowerContent.includes(keyword)) {
      matches++;
    }
  }

  return Math.round((matches / keywords.length) * 100);
}

function isHomepage(url: string, content: string): boolean {
  // Check URL pattern
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);

  // Root or single-level paths are likely homepages
  if (pathParts.length === 0 || (pathParts.length === 1 && ['en', 'ta', 'index.html', 'home'].includes(pathParts[0]))) {
    return true;
  }

  // Check content for homepage indicators
  const lowerContent = content.toLowerCase();
  for (const indicator of HOMEPAGE_INDICATORS) {
    if (lowerContent.includes(indicator) && !lowerContent.includes('article')) {
      // Check if it's predominantly a homepage vs article mentioning these terms
      const articleIndicators = ['published', 'author', 'posted on', 'read more', 'share this'];
      const hasArticleIndicators = articleIndicators.some(ai => lowerContent.includes(ai));
      if (!hasArticleIndicators) {
        return true;
      }
    }
  }

  return false;
}

function isErrorPage(content: string): boolean {
  const lowerContent = content.toLowerCase();

  // Check for error indicators in title or prominent positions
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].toLowerCase();
    for (const indicator of ERROR_INDICATORS) {
      if (title.includes(indicator)) {
        return true;
      }
    }
  }

  // Check for very short pages that are likely error pages
  if (content.length < 1000) {
    for (const indicator of ERROR_INDICATORS) {
      if (lowerContent.includes(indicator)) {
        return true;
      }
    }
  }

  return false;
}

async function validateSource(
  entry: DataEntry,
  source: Source,
  file: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    file,
    entryId: entry.id,
    entryName: entry.name.en,
    sourceUrl: source.url,
    sourceTitle: source.title,
    status: 'valid',
  };

  try {
    // Skip certain URLs that are known to block bots
    if (source.url.includes('twitter.com') || source.url.includes('x.com') || source.url.includes('fxtwitter.com')) {
      result.status = 'valid'; // Assume Twitter links are valid
      result.reason = 'Twitter link - skipped validation';
      return result;
    }

    const response = await fetchWithTimeout(source.url);
    result.httpStatus = response.status;

    // Check HTTP status
    if (response.status >= 400) {
      result.status = 'broken';
      result.reason = `HTTP ${response.status}`;
      return result;
    }

    // Get content
    const content = await response.text();

    // Check for error pages
    if (isErrorPage(content)) {
      result.status = 'broken';
      result.reason = 'Error page detected';
      return result;
    }

    // Check for homepage
    if (isHomepage(source.url, content)) {
      result.status = 'homepage';
      result.reason = 'Generic homepage - not article-specific';
      return result;
    }

    // Calculate content match score
    const keywords = extractKeywords(entry);
    const matchScore = calculateMatchScore(content, keywords);
    result.matchScore = matchScore;

    if (matchScore < 15) {
      result.status = 'no-match';
      result.reason = `Low content match (${matchScore}% of keywords found)`;
      return result;
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        result.status = 'timeout';
        result.reason = 'Request timed out';
      } else {
        result.status = 'error';
        result.reason = error.message;
      }
    } else {
      result.status = 'error';
      result.reason = 'Unknown error';
    }
    return result;
  }
}

function loadDataFile(filename: string): DataEntry[] {
  const filepath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  const data = JSON.parse(content);

  // Handle different data structures
  if (Array.isArray(data)) {
    return data;
  }

  // Look for arrays in the data object
  const entries: DataEntry[] = [];
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && data[key].length > 0 && data[key][0].id) {
      entries.push(...data[key]);
    }
  }

  return entries;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileArg = args.find(a => a.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  const filesToCheck = specificFile ? [specificFile] : DATA_FILES;
  const allResults: ValidationResult[] = [];

  console.log('Source Link Validator');
  console.log('=====================\n');

  if (dryRun) {
    console.log('DRY RUN - Only listing sources to validate\n');
  }

  for (const file of filesToCheck) {
    console.log(`\nProcessing ${file}...`);

    try {
      const entries = loadDataFile(file);
      let sourceCount = 0;

      for (const entry of entries) {
        if (!entry.sources || !Array.isArray(entry.sources)) continue;

        for (const source of entry.sources) {
          sourceCount++;

          if (dryRun) {
            console.log(`  [${entry.id}] ${source.url}`);
            continue;
          }

          process.stdout.write(`  Checking: ${entry.id} - ${source.title.substring(0, 30)}...`);

          const result = await validateSource(entry, source, file);
          allResults.push(result);

          const statusEmoji = {
            'valid': '\x1b[32m\u2713\x1b[0m',
            'broken': '\x1b[31m\u2717\x1b[0m',
            'homepage': '\x1b[33m\u26A0\x1b[0m',
            'no-match': '\x1b[33m?\x1b[0m',
            'timeout': '\x1b[31mT\x1b[0m',
            'error': '\x1b[31mE\x1b[0m',
          };

          console.log(` ${statusEmoji[result.status]} ${result.status}${result.reason ? ` (${result.reason})` : ''}`);

          // Small delay to be respectful to servers
          await new Promise(r => setTimeout(r, 500));
        }
      }

      console.log(`  Total sources in ${file}: ${sourceCount}`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
    }
  }

  if (dryRun) {
    return;
  }

  // Generate report
  console.log('\n\n========== VALIDATION REPORT ==========\n');

  const broken = allResults.filter(r => r.status === 'broken');
  const homepage = allResults.filter(r => r.status === 'homepage');
  const noMatch = allResults.filter(r => r.status === 'no-match');
  const valid = allResults.filter(r => r.status === 'valid');
  const errors = allResults.filter(r => r.status === 'timeout' || r.status === 'error');

  console.log(`Total sources checked: ${allResults.length}`);
  console.log(`  Valid: ${valid.length}`);
  console.log(`  Broken (404/error): ${broken.length}`);
  console.log(`  Homepage (not article-specific): ${homepage.length}`);
  console.log(`  No content match: ${noMatch.length}`);
  console.log(`  Timeout/Error: ${errors.length}`);

  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allResults.length,
      valid: valid.length,
      broken: broken.length,
      homepage: homepage.length,
      noMatch: noMatch.length,
      errors: errors.length,
    },
    flagged: [...broken, ...homepage, ...noMatch, ...errors].map(r => ({
      file: r.file,
      entryId: r.entryId,
      entryName: r.entryName,
      sourceUrl: r.sourceUrl,
      sourceTitle: r.sourceTitle,
      status: r.status,
      reason: r.reason,
      httpStatus: r.httpStatus,
      matchScore: r.matchScore,
    })),
  };

  const reportPath = path.join(__dirname, '../source-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report written to: ${reportPath}`);

  // Print flagged items
  if (report.flagged.length > 0) {
    console.log('\n\n========== FLAGGED SOURCES ==========\n');

    for (const item of report.flagged) {
      console.log(`[${item.status.toUpperCase()}] ${item.file} > ${item.entryId}`);
      console.log(`  Entry: ${item.entryName}`);
      console.log(`  Source: ${item.sourceTitle}`);
      console.log(`  URL: ${item.sourceUrl}`);
      console.log(`  Reason: ${item.reason}`);
      console.log('');
    }
  }
}

main().catch(console.error);
