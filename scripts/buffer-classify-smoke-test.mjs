#!/usr/bin/env node
/**
 * Split-scheduling classifier smoke test.
 *
 * Loads the live calendar and asserts the policy rules hold for every post:
 *
 *   • public https assetUrl                    → route: "media"
 *   • no assetUrl + Instagram                  → route: "skip" (instagram_requires_media)
 *   • no assetUrl + assetType "none" + LI/FB   → route: "planned-text-only"
 *   • no assetUrl + assetType != "none" + LI/FB→ route: "skip" (missing_media)
 *   • file:// URLs are never treated as public
 *
 * Also reports the 80/20 media-to-text ratio per platform and warns if
 * text-only exceeds 30% or media drops below 70%.
 *
 * No Buffer API calls. No env vars required. No secrets touched.
 */
import { classifyPostForBuffer, pickPublicAssetUrl } from "./buffer-runtime.mjs";
import { readCalendar } from "./content-utils.mjs";

const posts = readCalendar();
const failures = [];

const buckets = {
  mediaReady: 0,
  plannedTextOnlyLinkedIn: 0,
  plannedTextOnlyFacebook: 0,
  skippedInstagramNoMedia: 0,
  skippedLinkedInMissingMedia: 0,
  skippedFacebookMissingMedia: 0,
  skippedNoMedia: 0,
};

const byPlatform = {};

for (const post of posts) {
  const publicUrl = pickPublicAssetUrl(post);
  const classification = classifyPostForBuffer(post);
  const platform = post.platform;
  const plannedTextOnly = !post.assetType || post.assetType === "none";

  byPlatform[platform] = byPlatform[platform] || { media: 0, "planned-text-only": 0, skip: 0, total: 0 };
  byPlatform[platform][classification.route] = (byPlatform[platform][classification.route] || 0) + 1;
  byPlatform[platform].total += 1;

  if (classification.route === "media") {
    buckets.mediaReady += 1;
  } else if (classification.route === "planned-text-only" && platform === "linkedin") {
    buckets.plannedTextOnlyLinkedIn += 1;
  } else if (classification.route === "planned-text-only" && platform === "facebook") {
    buckets.plannedTextOnlyFacebook += 1;
  } else if (classification.route === "skip" && classification.reason === "instagram_requires_media") {
    buckets.skippedInstagramNoMedia += 1;
  } else if (classification.route === "skip" && classification.reason === "missing_media" && platform === "linkedin") {
    buckets.skippedLinkedInMissingMedia += 1;
  } else if (classification.route === "skip" && classification.reason === "missing_media" && platform === "facebook") {
    buckets.skippedFacebookMissingMedia += 1;
  } else if (classification.route === "skip") {
    buckets.skippedNoMedia += 1;
  }

  // ─── Policy assertions ────────────────────────────────────────────────
  // Rule 1: Instagram + no public assetUrl MUST skip with instagram_requires_media.
  if (platform === "instagram" && !publicUrl) {
    if (classification.route !== "skip" || classification.reason !== "instagram_requires_media") {
      failures.push(
        `[${post.id}] Instagram with no public assetUrl must skip (instagram_requires_media); got ${classification.route}/${classification.reason}`
      );
    }
  }

  // Rule 2: LinkedIn/Facebook + no publicUrl + assetType "none" → planned-text-only.
  if ((platform === "linkedin" || platform === "facebook") && !publicUrl && plannedTextOnly) {
    if (classification.route !== "planned-text-only") {
      failures.push(
        `[${post.id}] ${platform} with no public assetUrl + assetType "none" must be planned-text-only; got ${classification.route}`
      );
    }
  }

  // Rule 3: LinkedIn/Facebook + no publicUrl + assetType != "none" → skip (missing_media).
  if ((platform === "linkedin" || platform === "facebook") && !publicUrl && !plannedTextOnly) {
    if (classification.route !== "skip" || classification.reason !== "missing_media") {
      failures.push(
        `[${post.id}] ${platform} with assetType="${post.assetType}" but no public assetUrl must skip (missing_media); got ${classification.route}/${classification.reason}`
      );
    }
  }

  // Rule 4: Anything with a public https assetUrl MUST route to media.
  if (publicUrl && classification.route !== "media") {
    failures.push(
      `[${post.id}] post has public assetUrl (${publicUrl.slice(0, 60)}…) but routed to ${classification.route}`
    );
  }

  // Rule 5: classifier must NEVER return a media route without exposing the publicUrl.
  if (classification.route === "media" && !classification.publicUrl) {
    failures.push(`[${post.id}] media route returned but classification.publicUrl is empty`);
  }

  // Rule 6: file:// URLs must never be treated as public.
  if (post.assetUrl && post.assetUrl.startsWith("file://") && classification.route === "media") {
    failures.push(`[${post.id}] file:// URL leaked to media route`);
  }
}

console.log("buffer:classify:smoke");
console.log(`  total posts: ${posts.length}`);
console.log("  buckets:");
for (const [k, v] of Object.entries(buckets)) console.log(`    ${k}: ${v}`);
console.log("  by platform / route:");
for (const [p, counts] of Object.entries(byPlatform)) {
  console.log(`    ${p}: media=${counts.media || 0} planned-text-only=${counts["planned-text-only"] || 0} skip=${counts.skip || 0}`);
}

// 80/20 planning ratio — based on assetType in the calendar (the intent),
// not on what's currently schedulable (which depends on media generation).
const RATIO_WARN_TEXT_ONLY_MAX = 0.30;
const RATIO_WARN_MEDIA_MIN = 0.70;
const ratioWarnings = [];
for (const platform of ["linkedin", "facebook"]) {
  const platPosts = posts.filter((p) => p.platform === platform);
  if (platPosts.length === 0) continue;
  const mediaPlanned = platPosts.filter((p) => p.assetType && p.assetType !== "none").length;
  const textPlanned = platPosts.filter((p) => !p.assetType || p.assetType === "none").length;
  const total = platPosts.length;
  const mediaRatio = mediaPlanned / total;
  const textRatio = textPlanned / total;
  console.log(`  ${platform} planned ratio: media=${(mediaRatio * 100).toFixed(0)}% (${mediaPlanned}/${total}) text-only=${(textRatio * 100).toFixed(0)}% (${textPlanned}/${total})`);
  if (textRatio > RATIO_WARN_TEXT_ONLY_MAX) {
    ratioWarnings.push(`${platform} planned text-only ratio ${(textRatio * 100).toFixed(0)}% exceeds ${(RATIO_WARN_TEXT_ONLY_MAX * 100).toFixed(0)}% target max`);
  }
  if (mediaRatio < RATIO_WARN_MEDIA_MIN) {
    ratioWarnings.push(`${platform} planned media ratio ${(mediaRatio * 100).toFixed(0)}% below ${(RATIO_WARN_MEDIA_MIN * 100).toFixed(0)}% target min`);
  }
}

if (ratioWarnings.length) {
  console.log("");
  console.log("  ratio warnings:");
  for (const w of ratioWarnings) console.log(`    ⚠ ${w}`);
}

if (failures.length) {
  console.error("");
  console.error(`FAIL: ${failures.length} policy violation(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log("");
console.log("OK: split-scheduling policy holds for every calendar entry.");
