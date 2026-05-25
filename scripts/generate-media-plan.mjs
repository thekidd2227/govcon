#!/usr/bin/env node
/**
 * generate-media-plan.mjs
 *
 * For every post in src/content/arcg/calendar.json, build the media prompt,
 * validate it, and write:
 *   exports/media-plan.json
 *   exports/media-plan.csv
 *
 * Fails (exit 1) if any post has hard prompt errors AND
 * MEDIA_REQUIRE_HOOK_SPECIFIC=true (default true unless explicitly opted out).
 *
 * This script never calls OpenAI. Pure planning + validation.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { readCalendar } from "./content-utils.mjs";
import { buildMediaPrompt, validateMediaPrompt } from "./media-utils.mjs";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, "exports");
const JSON_PATH = resolve(OUT_DIR, "media-plan.json");
const CSV_PATH = resolve(OUT_DIR, "media-plan.csv");

const requireHookSpecific = String(process.env.MEDIA_REQUIRE_HOOK_SPECIFIC || "true") !== "false";
const minScore = Number(process.env.MEDIA_MIN_RELEVANCE_SCORE || 85);

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const s = Array.isArray(value) ? value.join(" | ") : String(value);
  if (s === "") return "";
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const posts = readCalendar();
if (!Array.isArray(posts)) {
  console.error("calendar.json must be a JSON array");
  process.exit(2);
}

const plan = [];
const summary = { byProduct: {}, byPlatform: {}, byAssetType: {} };
let totalErrors = 0;
let totalWarnings = 0;
let totalBelowThreshold = 0;

for (const post of posts) {
  const result = buildMediaPrompt(post);
  const validation = validateMediaPrompt(post, result);
  totalErrors += validation.errors.length;
  totalWarnings += validation.warnings.length;
  if (validation.score < minScore) totalBelowThreshold += 1;

  summary.byProduct[post.product] = (summary.byProduct[post.product] || 0) + 1;
  summary.byPlatform[post.platform] = (summary.byPlatform[post.platform] || 0) + 1;
  summary.byAssetType[result.assetType] = (summary.byAssetType[result.assetType] || 0) + 1;

  plan.push({
    postId: post.id,
    product: post.product,
    platform: post.platform,
    date: post.date,
    time: post.recommendedTime,
    hook: post.hook,
    audience: post.audience,
    cta: post.cta,
    assetType: result.assetType,
    size: result.size,
    aspectRatio: result.aspectRatio,
    overlayText: result.overlayText,
    visualMetaphor: result.visualMetaphor,
    mediaPrompt: result.mediaPrompt,
    promptBrief: result.promptBrief,
    requiredElements: result.requiredElements,
    forbiddenElements: result.forbiddenElements,
    carouselSlides: result.carouselSlides || null,
    relevanceScore: validation.score,
    errors: validation.errors,
    warnings: validation.warnings,
  });
}

mkdirSync(dirname(JSON_PATH), { recursive: true });
writeFileSync(JSON_PATH, JSON.stringify(plan, null, 2));

const header = [
  "Post ID", "Product", "Platform", "Date", "Time", "Hook", "Audience", "CTA",
  "Asset Type", "Size", "Overlay Text", "Visual Metaphor", "Media Prompt",
  "Relevance Score", "Errors", "Warnings",
];
const rows = [header.map(csvCell).join(",")];
for (const p of plan) {
  rows.push([
    p.postId, p.product, p.platform, p.date, p.time, p.hook, p.audience, p.cta,
    p.assetType, p.size, p.overlayText, p.visualMetaphor, p.mediaPrompt,
    p.relevanceScore,
    p.errors.map((e) => `[${e.field}] ${e.message}`).join(" | "),
    p.warnings.map((w) => `[${w.field}] ${w.message}`).join(" | "),
  ].map(csvCell).join(","));
}
writeFileSync(CSV_PATH, rows.join("\n") + "\n");

console.log("ARCG media plan");
console.log(`  total posts:            ${plan.length}`);
console.log(`  by product:             ${JSON.stringify(summary.byProduct)}`);
console.log(`  by platform:            ${JSON.stringify(summary.byPlatform)}`);
console.log(`  by asset type:          ${JSON.stringify(summary.byAssetType)}`);
console.log(`  total errors:           ${totalErrors}`);
console.log(`  total warnings:         ${totalWarnings}`);
console.log(`  below min score (${minScore}):  ${totalBelowThreshold}`);
console.log(`  exports/media-plan.json`);
console.log(`  exports/media-plan.csv`);

if (totalErrors > 0 && requireHookSpecific) {
  console.error("\nHard prompt errors present. Fix posts before generating assets.");
  process.exit(1);
}
console.log("\nmedia plan ready");
