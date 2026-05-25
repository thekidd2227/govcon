#!/usr/bin/env node
/**
 * media-validate-assets.mjs
 *
 * Validates the media state on every post in src/content/arcg/calendar.json
 * after generation. Fails the run if:
 *   - any post with mediaStatus in {planned, prompt_ready, generating,
 *     generated, uploaded, ready} is missing mediaPrompt
 *   - any post with mediaStatus="ready" has no assetUrl/assetUrls
 *   - any post's assetUrl is a local file path (file://…)
 *   - any post with assetType="carousel" and mediaStatus="ready" has no
 *     assetUrls[] or carouselSlides[].assetUrl coverage
 *   - any ChartNav post fails clinical-claim safety on the stored prompt
 *   - any Rezy post is missing coming-soon/waitlist framing
 *   - any SourceDeck post is missing command-center / source-of-truth concept
 *   - any ARCG post is missing operational-leak/workflow/blueprint concept
 *   - relevance score below MEDIA_MIN_RELEVANCE_SCORE
 */

import { readCalendar } from "./content-utils.mjs";
import { validateMediaPrompt, buildMediaPrompt } from "./media-utils.mjs";

const posts = readCalendar();
if (!Array.isArray(posts)) {
  console.error("calendar.json must be a JSON array");
  process.exit(2);
}

const minScore = Number(process.env.MEDIA_MIN_RELEVANCE_SCORE || 85);
const requireHookSpecific = String(process.env.MEDIA_REQUIRE_HOOK_SPECIFIC || "true") !== "false";

const errors = [];
const warnings = [];

const REQUIRES_PROMPT = new Set([
  "planned", "prompt_ready", "generating", "generated", "uploaded", "ready",
]);

for (const post of posts) {
  const id = post.id || "<missing-id>";
  const status = post.mediaStatus || "not_started";

  if (REQUIRES_PROMPT.has(status) && !post.mediaPrompt) {
    errors.push({ id, field: "mediaPrompt", message: `mediaStatus=${status} but mediaPrompt is empty` });
  }

  if (status === "ready") {
    const hasUrl = Boolean(post.assetUrl) || (Array.isArray(post.assetUrls) && post.assetUrls.length > 0);
    if (!hasUrl) {
      errors.push({ id, field: "assetUrl", message: "mediaStatus=ready requires assetUrl or assetUrls" });
    } else {
      const urls = [post.assetUrl, ...(post.assetUrls || [])].filter(Boolean);
      const localUrls = urls.filter((u) => u.startsWith("file://"));
      if (localUrls.length) {
        errors.push({ id, field: "assetUrl", message: `mediaStatus=ready but assetUrl is local file path: ${localUrls.join(", ")}` });
      }
    }
    if (post.assetType === "carousel") {
      const slideUrls = (post.carouselSlides || []).map((s) => s.assetUrl).filter(Boolean);
      const arrayUrls = post.assetUrls || [];
      if (!(arrayUrls.length > 0 || slideUrls.length > 0)) {
        errors.push({ id, field: "assetUrls", message: "carousel mediaStatus=ready requires assetUrls[] or slide assetUrls" });
      }
    }
  }

  if (typeof post.mediaRelevanceScore === "number") {
    if (requireHookSpecific && post.mediaRelevanceScore < minScore) {
      errors.push({ id, field: "mediaRelevanceScore", message: `score ${post.mediaRelevanceScore} < ${minScore}` });
    } else if (post.mediaRelevanceScore < minScore) {
      warnings.push({ id, field: "mediaRelevanceScore", message: `score ${post.mediaRelevanceScore} below threshold ${minScore}` });
    }
  }

  // Product-specific safety re-check against the stored prompt
  if (post.mediaPrompt) {
    const promptResult = buildMediaPrompt(post);
    const v = validateMediaPrompt(post, { ...promptResult, mediaPrompt: post.mediaPrompt });
    for (const e of v.errors) errors.push({ id, field: e.field, message: `prompt safety: ${e.message}` });
  }
}

console.log("ARCG media asset validation");
console.log(`  posts:     ${posts.length}`);
console.log(`  errors:    ${errors.length}`);
console.log(`  warnings:  ${warnings.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  WARN ${w.id} [${w.field}] ${w.message}`);
}
if (errors.length) {
  console.log("\nErrors:");
  for (const e of errors) console.log(`  ERROR ${e.id} [${e.field}] ${e.message}`);
  process.exit(1);
}
console.log("\nmedia asset validation passed");
