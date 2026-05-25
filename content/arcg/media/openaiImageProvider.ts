/**
 * OpenAI image-generation provider — server-side only.
 *
 * Never imported by the React app. Only called from Node scripts
 * (`scripts/generate-media-assets.mjs`). All credentials come from
 * process.env and are never logged.
 *
 * Endpoint shape: OpenAI's image-generation HTTP API. The exact response
 * field set has changed across model generations (gpt-image-1 → gpt-image-2),
 * so the parser is defensive — it accepts either `b64_json` or `url` and
 * surfaces a clear error when both are missing.
 *
 * Output: a local file path under MEDIA_OUTPUT_DIR. Local paths are NOT
 * Buffer-ready — they need to be uploaded to stable storage by
 * `assetHosting.ts` before being attached to a Buffer post.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { GeneratedImage, MediaPromptResult } from "./mediaTypes";

interface GenerateOptions {
  /** Post id used to build the output file path. */
  postId: string;
  /** YYYY-MM. Bucket for the output directory. */
  month: string;
  /** Product slug — arcg | sourcedeck | chartnav | rezy. */
  product: string;
  /** Platform — linkedin | instagram | facebook. */
  platform: string;
  /** Optional slide suffix for carousel generations (1..N). */
  slideNumber?: number;
  /** Full structured prompt result. */
  promptResult: MediaPromptResult;
  /** Which slide's prompt to send. Defaults to the single-image prompt. */
  promptOverride?: string;
}

const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_QUALITY = "high";
const DEFAULT_FORMAT = "png";

/** Hash a prompt for change detection. */
export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

/** Resolve the local output path for a generated asset. */
export function outputPathFor(opts: Pick<GenerateOptions, "postId" | "month" | "product" | "platform" | "slideNumber">): string {
  const baseDir = process.env.MEDIA_OUTPUT_DIR || ".generated-media";
  const filename = opts.slideNumber
    ? `${opts.postId}-slide-${String(opts.slideNumber).padStart(2, "0")}.png`
    : `${opts.postId}.png`;
  return join(baseDir, opts.month, opts.product, opts.platform, filename);
}

/** Parse the OpenAI image response defensively. */
function decodeOpenAiImage(payload: unknown): { data: Buffer | null; remoteUrl: string | null } {
  const obj = (payload || {}) as { data?: Array<Record<string, unknown>> };
  const first = (obj.data || [])[0] || {};
  if (typeof first.b64_json === "string" && first.b64_json.length > 0) {
    return { data: Buffer.from(first.b64_json, "base64"), remoteUrl: null };
  }
  if (typeof first.url === "string" && first.url.length > 0) {
    return { data: null, remoteUrl: first.url };
  }
  return { data: null, remoteUrl: null };
}

async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`failed to fetch generated image (HTTP ${res.status})`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

/** Live OpenAI image generation. Throws if OPENAI_API_KEY is missing. */
export async function generateImage(opts: GenerateOptions): Promise<GeneratedImage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it as a GitHub Actions secret before live generation."
    );
  }
  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const quality = process.env.OPENAI_IMAGE_QUALITY || DEFAULT_QUALITY;
  const format = (process.env.OPENAI_IMAGE_FORMAT || DEFAULT_FORMAT).toLowerCase();
  const prompt = opts.promptOverride || opts.promptResult.mediaPrompt;
  const size = opts.promptResult.size;

  // GPT image models (gpt-image-1, gpt-image-2) return b64_json by default.
  // Do NOT send response_format — it is not a supported parameter for these
  // models and causes HTTP 400 "Unknown parameter: response_format".
  // Use output_format only when a non-PNG format is explicitly requested.
  const body: Record<string, unknown> = {
    model,
    prompt,
    size,
    quality,
    n: 1,
  };
  if (format && format !== "png") {
    body.output_format = format;
  }

  // Debug mode: log request keys only — never values, never the API key.
  // Also asserts that response_format is absent (invariant for GPT image models).
  if (process.env.OPENAI_IMAGE_DEBUG === "1") {
    console.log("[openaiImageProvider] request payload keys:", Object.keys(body).join(", "));
    if ("response_format" in body) {
      throw new Error(
        "[openaiImageProvider] ASSERTION FAILED: response_format must not be present in GPT image model requests"
      );
    }
  }

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  let payload: unknown;
  try {
    payload = await res.json();
  } catch (e) {
    payload = { rawError: String((e as Error).message || e) };
  }

  if (!res.ok) {
    // surface non-2xx but never log the API key
    const msg = (payload as { error?: { message?: string } })?.error?.message;
    throw new Error(`OpenAI image API HTTP ${res.status}: ${msg || "unknown error"}`);
  }

  const { data, remoteUrl } = decodeOpenAiImage(payload);
  let bytes: Buffer | null = data;
  if (!bytes && remoteUrl) {
    bytes = await downloadToBuffer(remoteUrl);
  }
  if (!bytes) {
    throw new Error(
      "OpenAI image response had neither b64_json nor a downloadable URL"
    );
  }

  const outPath = outputPathFor(opts);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, bytes);

  return {
    localPath: outPath,
    byteLength: bytes.length,
    promptHash: hashPrompt(prompt),
  };
}

/** Mock image: writes a tiny PNG so the rest of the pipeline can exercise
 *  storage/upload paths during dry-run smokes. Never makes a network call. */
export async function generateMockImage(opts: GenerateOptions): Promise<GeneratedImage> {
  // 1x1 transparent PNG — small enough to commit nothing real.
  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );
  const outPath = outputPathFor(opts);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, tinyPng);
  return {
    localPath: outPath,
    byteLength: tinyPng.length,
    promptHash: hashPrompt(opts.promptOverride || opts.promptResult.mediaPrompt),
  };
}
