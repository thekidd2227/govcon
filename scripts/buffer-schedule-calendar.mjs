#!/usr/bin/env node
import {
  classifyPostForBuffer,
  createPostInput,
  getBufferConfig,
  schedulePost,
} from "./buffer-runtime.mjs";
import { readCalendar, writeCalendar, parseArgs, readScheduledIds } from "./content-utils.mjs";

const args = parseArgs();
const execute = Boolean(args.execute);
const dryRun = !execute || Boolean(args["dry-run"]);
const includeDraft = Boolean(args["include-draft"]);
const force = Boolean(args.force);
// `--require-media` is now an escape hatch on top of the split-scheduling
// policy: when set, any post that would otherwise route to text-only is
// reclassified as skipped (reason: missing_media_url). The default policy is
// platform-aware (see classifyPostForBuffer): LinkedIn/Facebook fall back to
// text-only when no public asset URL is present; Instagram is always skipped
// in that case.
const requireMedia = Boolean(args["require-media"]);
const skipMissingMedia = Boolean(args["skip-missing-media"]);
const mediaOptional = Boolean(args["media-optional"]) || (!requireMedia && !skipMissingMedia);
const allowCarouselSingleImage = Boolean(args["allow-carousel-single-image"]);
const assetTypeFilter = typeof args["asset-type"] === "string" ? args["asset-type"] : "all";
const config = getBufferConfig({ requireApiKey: execute });
const scheduledIds = force ? new Set() : readScheduledIds();
const baseRunOpts = { requireMedia, skipMissingMedia, allowCarouselSingleImage };

// Keep a reference to the full calendar — we mutate posts in-memory and
// flush to disk after a successful execute run so subsequent runs short-
// circuit posts that already carry a bufferPostId. (GitHub Actions runs
// are ephemeral; the on-disk schedule log doesn't persist across runs.)
const allPosts = readCalendar();
let posts = allPosts;

if (args.month && args.month !== true) posts = posts.filter((post) => post.date.startsWith(args.month));
if (args.platform && args.platform !== true && args.platform !== "all") posts = posts.filter((post) => post.platform === args.platform);
if (args.product && args.product !== true && args.product !== "all") posts = posts.filter((post) => post.product === args.product);
if (assetTypeFilter && assetTypeFilter !== "all") posts = posts.filter((post) => (post.assetType || "none") === assetTypeFilter);

if (args.status && args.status !== true) {
  posts = posts.filter((post) => post.status === args.status);
} else {
  posts = posts.filter((post) => post.status === "approved");
}

if (!includeDraft) posts = posts.filter((post) => post.status !== "draft");
// Skip posts already known to Buffer — either logged this run, or carried
// in the committed calendar as bufferPostId.
posts = posts.filter((post) => !scheduledIds.has(post.id) && !post.bufferPostId);
if (args.limit && args.limit !== true) posts = posts.slice(0, Number(args.limit));

// Channel-id presence is only required for posts we actually intend to send
// to Buffer (media + text-only routes). Pre-classify here so we don't fail
// the run because, say, the Instagram channel is unset when we're only
// scheduling LinkedIn text-only posts.
const classifications = posts.map((post) => classifyPostForBuffer(post));
const channelsNeeded = new Set();
for (let i = 0; i < posts.length; i++) {
  const c = classifications[i];
  if (c.route === "media" || c.route === "text-only") {
    channelsNeeded.add(posts[i].platform);
  }
}
const missingChannels = [...channelsNeeded].filter((platform) => !config.channels[platform]);
if (execute && missingChannels.length) {
  console.error(`Missing Buffer channel IDs for: ${missingChannels.join(", ")}`);
  console.error("Set BUFFER_CHANNEL_LINKEDIN, BUFFER_CHANNEL_INSTAGRAM, and BUFFER_CHANNEL_FACEBOOK as needed.");
  process.exit(1);
}

console.log(`${dryRun ? "Dry-run" : "Execute"} Buffer scheduling`);
console.log(`  posts:                ${posts.length}`);
console.log(`  timezone:             ${config.timezone}`);
console.log(`  schedule mode:        ${config.scheduleMode} (live schedules posts)`);
console.log(`  media policy:         split-scheduling (media + text-only fallback)`);
console.log(`  require-media override: ${requireMedia ? "on (no-media routes become skip)" : "off"}`);
console.log(`  carousel fallback:    ${allowCarouselSingleImage ? "first-image-only" : "skip"}`);

// Split-scheduling buckets (per the explicit policy).
let mediaReady = 0;
let plannedTextOnlyLinkedIn = 0;
let plannedTextOnlyFacebook = 0;
let skippedInstagramNoMedia = 0;
let skippedLinkedInMissingMedia = 0;
let skippedFacebookMissingMedia = 0;
let skippedNoMedia = 0;

// Legacy / supplementary counts retained for backward compat with existing
// log parsers and ops runbooks.
let scheduled = 0;
let textOnly = 0;
let skippedCarousel = 0;
let skippedDuplicate = 0;
let calendarMutated = false;

const DUPLICATE_PATTERNS = /posted that one recently|already scheduled|duplicate post|same thing again so soon/i;

for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  let classification = classifications[i];

  // `--require-media` escape hatch: collapse planned-text-only routes into skip.
  if (requireMedia && classification.route === "planned-text-only") {
    classification = { route: "skip", publicUrl: null, reason: "missing_media" };
  }

  const baseLine = {
    postId: post.id,
    product: post.product,
    platform: post.platform,
    status: post.status,
    dueAt: undefined, // filled below where it is known
    assetType: post.assetType || "none",
    route: classification.route,
    reason: classification.reason,
    hasPublicAssetUrl: Boolean(classification.publicUrl),
  };

  if (classification.route === "skip") {
    if (classification.reason === "instagram_requires_media") {
      skippedInstagramNoMedia += 1;
    } else if (classification.reason === "missing_media" && post.platform === "linkedin") {
      skippedLinkedInMissingMedia += 1;
    } else if (classification.reason === "missing_media" && post.platform === "facebook") {
      skippedFacebookMissingMedia += 1;
    } else {
      skippedNoMedia += 1;
    }
    console.log(JSON.stringify({ ...baseLine, action: dryRun ? "would-skip" : "skipped" }));
    continue;
  }

  const isTextOnlyRoute = classification.route === "planned-text-only";
  if (isTextOnlyRoute) {
    if (post.platform === "linkedin") plannedTextOnlyLinkedIn += 1;
    else if (post.platform === "facebook") plannedTextOnlyFacebook += 1;
  } else {
    mediaReady += 1;
  }

  const runOpts = { ...baseRunOpts, textOnly: isTextOnlyRoute };
  const input = createPostInput(post, config, runOpts);
  const hasBufferAsset = Boolean(input.assets && input.assets.length > 0);
  const carouselUnverified = input.__carouselUnverified === true;
  const preview = {
    ...baseLine,
    channelId: input.channelId || "(missing channel env)",
    dueAt: input.dueAt,
    hasBufferAsset,
    bufferReadyMedia: hasBufferAsset && !carouselUnverified,
    carouselFallback: input.__carouselFallback === true,
    carouselUnverified,
    mediaStatus: post.mediaStatus || "not_started",
    textPreview: String(input.text).slice(0, 160),
  };

  if (dryRun) {
    console.log(JSON.stringify(preview));
    if (carouselUnverified) {
      skippedCarousel += 1;
      // Carousel is a media-route post we couldn't realize. Don't decrement
      // mediaReady — the post DID have a public assetUrl; we're just flagging
      // that the multi-image attachment isn't supported. Treat as "would-skip
      // until carousel is resolved" without re-bucketing into the policy
      // counters.
      continue;
    }
    if (isTextOnlyRoute) textOnly += 1;
    continue;
  }

  // execute path
  try {
    const record = await schedulePost(post, config, runOpts);
    console.log(JSON.stringify({
      postId: record.postId,
      product: record.product,
      platform: record.platform,
      dueAt: record.dueAt,
      bufferPostId: record.bufferPostId,
      status: record.status,
      route: classification.route,
    }));
    post.bufferPostId = record.bufferPostId;
    post.bufferDueAt = record.dueAt;
    calendarMutated = true;
    scheduled += 1;
    if (isTextOnlyRoute) textOnly += 1;
  } catch (err) {
    const msg = err.message || "";
    if (DUPLICATE_PATTERNS.test(msg)) {
      console.log(JSON.stringify({
        postId: post.id,
        action: "skipped-duplicate",
        reason: msg,
        route: classification.route,
      }));
      if (!post.bufferPostId) {
        post.bufferPostId = "buffer-side-duplicate";
        post.bufferDueAt = post.bufferDueAt || new Date().toISOString();
        calendarMutated = true;
      }
      skippedDuplicate += 1;
      continue;
    }
    if (skipMissingMedia && /no Buffer-ready assetUrl|carousel multi-image/.test(msg)) {
      console.log(JSON.stringify({ postId: post.id, action: "skipped", reason: msg }));
      if (/carousel/.test(msg)) skippedCarousel += 1; else skippedNoMedia += 1;
      continue;
    }
    throw err;
  }
}

if (execute && calendarMutated) {
  writeCalendar(allPosts);
  console.log("calendar updated on disk with bufferPostId(s) — commit src/content/arcg/calendar.json to persist");
}

console.log("");
console.log(
  `split-scheduling: mediaReady=${mediaReady} ` +
    `plannedTextOnlyLinkedIn=${plannedTextOnlyLinkedIn} plannedTextOnlyFacebook=${plannedTextOnlyFacebook} ` +
    `skippedInstagramNoMedia=${skippedInstagramNoMedia} ` +
    `skippedLinkedInMissingMedia=${skippedLinkedInMissingMedia} skippedFacebookMissingMedia=${skippedFacebookMissingMedia} ` +
    `skippedNoMedia=${skippedNoMedia}`
);
console.log(
  `summary: scheduled=${scheduled} textOnly=${textOnly} ` +
    `skippedNoMedia=${skippedNoMedia} skippedCarousel=${skippedCarousel} skippedDuplicate=${skippedDuplicate}`
);
if (dryRun) console.log("No Buffer API calls were made. Add --execute (with execute_confirm=SCHEDULE_TO_BUFFER on Actions) after review.");
