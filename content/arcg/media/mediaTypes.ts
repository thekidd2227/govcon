/**
 * Media pipeline types.
 *
 * These extend the existing ContentPost shape with the fields needed to
 * generate hook-specific images via OpenAI, store them on a stable host,
 * and track readiness for Buffer scheduling.
 *
 * All values are written to src/content/arcg/calendar.json by
 * scripts/generate-media-assets.mjs. The browser never sees provider
 * credentials; this file is import-safe for both Node scripts and the
 * React admin view (no API calls happen at import time).
 */

import type { Platform, Product, Audience } from "../types";

/** Lifecycle for a single post's media asset. */
export type MediaStatus =
  | "not_started"
  | "planned"
  | "prompt_ready"
  | "generating"
  | "generated"
  | "uploaded"
  | "ready"
  | "failed"
  | "skipped";

/** Generation mode chosen for this post. */
export type MediaMode =
  | "openai_image"
  | "openai_carousel"
  | "video_prompt_only"
  | "none";

export type AssetStorageProvider =
  | "cloudinary"
  | "vercel_blob"
  | "s3"
  | "supabase"
  | "local_dry_run";

/** Structured output of `buildMediaPrompt(post)`. */
export interface MediaPromptResult {
  /** The full OpenAI prompt — primary input to the image model. */
  mediaPrompt: string;
  /** Plain-English brief used by validators and human reviewers. */
  promptBrief: string;
  forbiddenElements: string[];
  requiredElements: string[];
  visualMetaphor: string;
  /** Max 6 words. Burned into the image, not asked of the model as a caption. */
  overlayText: string;
  aspectRatio: "1:1" | "4:5" | "16:9" | "9:16";
  /** Closest supported provider size — exact pixels. */
  size: string;
  assetType: "image" | "carousel" | "video" | "none";
  /** Populated only when assetType === "carousel". */
  carouselSlides?: MediaCarouselSlide[];
}

export interface MediaCarouselSlide {
  slideNumber: number;
  headline: string;
  subheadline?: string;
  visualPrompt: string;
  /** Set when the slide has been uploaded to stable storage. */
  assetUrl?: string;
  generatedAssetLocalPath?: string;
}

/** Output of `validateMediaPrompt(post, promptResult)`. */
export interface MediaPromptValidation {
  score: number;
  errors: MediaIssue[];
  warnings: MediaIssue[];
}

export interface MediaIssue {
  field: string;
  message: string;
}

/** Provider-agnostic shape returned by the OpenAI provider. */
export interface GeneratedImage {
  /** Local file path. May be the only output if no storage is configured. */
  localPath: string;
  /** Base64 data length in bytes, for log line stats only. */
  byteLength: number;
  /** mediaPrompt hash — used to short-circuit re-generation. */
  promptHash: string;
}

/** Result of uploading a local asset to stable storage. */
export interface UploadedAsset {
  assetUrl: string;
  storageProvider: AssetStorageProvider;
  storagePath: string;
}

/** Context passed into the prompt builder. */
export interface PromptContext {
  postId: string;
  platform: Platform;
  product: Product;
  audience: Audience;
  hook: string;
  caption: string;
  cta: string;
  theme: string;
  sourceAngle: string;
}
