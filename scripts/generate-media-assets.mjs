#!/usr/bin/env node
/**
 * generate-media-assets.mjs
 *
 * Generates hook-specific images for each post via OpenAI, validates the
 * prompt first, writes local files, optionally uploads to stable storage,
 * and updates src/content/arcg/calendar.json with media metadata.
 *
 * Default: --dry-run. Live generation requires --execute AND a valid
 * OPENAI_API_KEY env var (set by the workflow when execute_confirm=
 * GENERATE_MEDIA).
 *
 * Flags:
 *   --dry-run                 (default) build prompt, validate, print plan
 *   --execute                 actually call OpenAI + storage
 *   --month YYYY-MM           filter to a month
 *   --platform linkedin|...   filter
 *   --product arcg|...        filter
 *   --asset-type image|carousel|video|all
 *   --limit N
 *   --force                   regenerate even when cached prompt hash matches
 *   --strict                  fail the script if any prompt fails validation
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join, basename } from "node:path";
import { createHash } from "node:crypto";

import {
  readCalendar,
  parseArgs,
  CALENDAR_PATH,
} from "./content-utils.mjs";
import {
  buildMediaPrompt,
  validateMediaPrompt,
  hashPrompt,
  outputPathFor,
} from "./media-utils.mjs";

const args = parseArgs();
const dryRun = !args.execute || Boolean(args["dry-run"]);
const force = Boolean(args.force);
const strict = Boolean(args.strict);
const platformFilter = typeof args.platform === "string" ? args.platform : null;
const productFilter = typeof args.product === "string" ? args.product : null;
const monthFilter = typeof args.month === "string" ? args.month : null;
const assetTypeFilter = typeof args["asset-type"] === "string" ? args["asset-type"] : "all";
const limit = args.limit && args.limit !== true ? Number(args.limit) : null;

const minScore = Number(process.env.MEDIA_MIN_RELEVANCE_SCORE || 85);
const requireHookSpecific = String(process.env.MEDIA_REQUIRE_HOOK_SPECIFIC || "true") !== "false";

const calendarPath = CALENDAR_PATH;
const calendar = readCalendar();
if (!Array.isArray(calendar)) {
  console.error("calendar.json must be a JSON array");
  process.exit(2);
}

function filter(post) {
  if (platformFilter && platformFilter !== "all" && post.platform !== platformFilter) return false;
  if (productFilter && productFilter !== "all" && post.product !== productFilter) return false;
  if (monthFilter && !post.date.startsWith(monthFilter)) return false;
  return true;
}

const targets = calendar.filter(filter);
const planned = limit ? targets.slice(0, limit) : targets;

console.log(`${dryRun ? "Dry-run" : "Execute"} media generation`);
console.log(`  posts in scope: ${planned.length}`);
console.log(`  product:        ${productFilter || "all"}`);
console.log(`  platform:       ${platformFilter || "all"}`);
console.log(`  month:          ${monthFilter || "all"}`);
console.log(`  asset-type:     ${assetTypeFilter}`);
console.log(`  min score:      ${minScore}`);
if (dryRun) console.log("  no OpenAI calls will be made");

let generated = 0;
let skipped = 0;
let failed = 0;
const generationLog = [];

for (const post of planned) {
  const promptResult = buildMediaPrompt(post);
  const validation = validateMediaPrompt(post, promptResult);
  const wantedAssetType =
    assetTypeFilter === "all" ? promptResult.assetType : assetTypeFilter;

  if (promptResult.assetType !== wantedAssetType && assetTypeFilter !== "all") {
    skipped += 1;
    continue;
  }

  // Block generation on validation failure when require-hook-specific is on
  if (requireHookSpecific && validation.score < minScore) {
    failed += 1;
    const summary = {
      postId: post.id,
      product: post.product,
      platform: post.platform,
      assetType: promptResult.assetType,
      score: validation.score,
      errors: validation.errors,
      action: "blocked-below-score",
    };
    generationLog.push(summary);
    console.log(`  ✗ ${post.id} blocked (score ${validation.score} < ${minScore})`);
    for (const err of validation.errors) console.log(`      [${err.field}] ${err.message}`);
    if (strict) process.exit(1);
    continue;
  }

  if (dryRun) {
    console.log(
      `  • ${post.id}  ${post.product}/${post.platform}  ${promptResult.assetType}  score=${validation.score}`
    );
    continue;
  }

  // ── live generation ──
  // dynamic import so dry-run does not require the OpenAI provider
  let providerModule, storageModule;
  try {
    providerModule = await import("./media-providers-runtime.mjs");
    storageModule = providerModule.storage;
  } catch (e) {
    console.error("media-providers-runtime.mjs is required for --execute mode:", e.message);
    process.exit(2);
  }

  const month = post.date.slice(0, 7);
  const opts = {
    postId: post.id, month, product: post.product, platform: post.platform,
    promptResult,
  };

  try {
    if (promptResult.assetType === "carousel" && Array.isArray(promptResult.carouselSlides)) {
      const localPaths = [];
      const slideUrls = [];
      for (const slide of promptResult.carouselSlides) {
        const slideOpts = { ...opts, slideNumber: slide.slideNumber, promptOverride: slide.visualPrompt };
        const img = await providerModule.generate(slideOpts);
        localPaths.push(img.localPath);
        let uploaded;
        try {
          uploaded = await storageModule.uploadAsset(img.localPath, {
            folder: `arcg-media/${month}/${post.product}/${post.platform}`,
            publicId: basename(img.localPath, ".png"),
            pathname: `arcg-media/${month}/${post.product}/${post.platform}/${basename(img.localPath)}`,
          });
        } catch (uploadErr) {
          // fall back to local storage so the asset still has a record
          console.log(`      upload failed for slide ${slide.slideNumber}: ${uploadErr.message}`);
          uploaded = await storageModule.uploadLocal(img.localPath);
        }
        slideUrls.push(uploaded.assetUrl);
        slide.generatedAssetLocalPath = img.localPath;
        slide.assetUrl = uploaded.assetUrl;
      }
      const bufferReady = slideUrls.every((u) => !u.startsWith("file://"));
      const provider = storageModule.getStorageProvider();
      patchPost(post, {
        mediaStatus: bufferReady ? "ready" : "generated",
        mediaMode: "openai_carousel",
        mediaProvider: "openai",
        mediaPrompt: promptResult.mediaPrompt,
        mediaPromptHash: hashPrompt(promptResult.mediaPrompt),
        mediaRelevanceScore: validation.score,
        assetType: "carousel",
        assetStorageProvider: provider,
        assetStoragePath: `arcg-media/${month}/${post.product}/${post.platform}`,
        generatedAssetLocalPaths: localPaths,
        assetUrls: slideUrls,
        carouselSlides: promptResult.carouselSlides,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const img = await providerModule.generate(opts);
      let uploaded;
      try {
        uploaded = await storageModule.uploadAsset(img.localPath, {
          folder: `arcg-media/${month}/${post.product}/${post.platform}`,
          publicId: basename(img.localPath, ".png"),
          pathname: `arcg-media/${month}/${post.product}/${post.platform}/${basename(img.localPath)}`,
        });
      } catch (uploadErr) {
        console.log(`      upload failed: ${uploadErr.message}`);
        uploaded = await storageModule.uploadLocal(img.localPath);
      }
      const bufferReady = !uploaded.assetUrl.startsWith("file://");
      const provider = storageModule.getStorageProvider();
      patchPost(post, {
        mediaStatus: bufferReady ? "ready" : "generated",
        mediaMode: "openai_image",
        mediaProvider: "openai",
        mediaPrompt: promptResult.mediaPrompt,
        mediaPromptHash: img.promptHash,
        mediaRelevanceScore: validation.score,
        assetType: "image",
        assetStorageProvider: provider,
        assetStoragePath: uploaded.storagePath,
        generatedAssetLocalPath: img.localPath,
        assetUrl: uploaded.assetUrl,
        updatedAt: new Date().toISOString(),
      });
    }
    generated += 1;
    console.log(`  ✓ ${post.id} generated (score ${validation.score})`);
  } catch (err) {
    failed += 1;
    patchPost(post, {
      mediaStatus: "failed",
      mediaError: err.message,
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✗ ${post.id} failed: ${err.message}`);
  }
}

function patchPost(post, patch) {
  for (const [k, v] of Object.entries(patch)) post[k] = v;
}

if (!dryRun) {
  writeFileSync(calendarPath, JSON.stringify(calendar, null, 2));
  console.log(`\ncalendar updated: ${calendarPath}`);
}

console.log(`\nsummary: generated=${generated}  skipped=${skipped}  failed=${failed}`);
if (dryRun) console.log("Dry-run only. Re-run with --execute and OPENAI_API_KEY set to generate.");
