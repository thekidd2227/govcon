/**
 * Runtime providers for --execute media generation.
 *
 * JS-port of:
 *   src/content/arcg/media/openaiImageProvider.ts
 *   src/content/arcg/media/assetHosting.ts
 *   src/content/arcg/media/{localDryRunStorage,cloudinaryStorage,vercelBlobStorage}.ts
 *
 * Loaded only when scripts/generate-media-assets.mjs runs with --execute, so
 * the rest of the pipeline never touches OPENAI_API_KEY or storage tokens.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

import { hashPrompt, outputPathFor } from "./media-utils.mjs";

/* ─────────────────────────────────────────────────────────────────────── *
 * OpenAI image provider
 * ─────────────────────────────────────────────────────────────────────── */

function decodeOpenAi(payload) {
  const obj = payload || {};
  const first = (obj.data || [])[0] || {};
  if (typeof first.b64_json === "string" && first.b64_json.length > 0) {
    return { data: Buffer.from(first.b64_json, "base64"), remoteUrl: null };
  }
  if (typeof first.url === "string" && first.url.length > 0) {
    return { data: null, remoteUrl: first.url };
  }
  return { data: null, remoteUrl: null };
}

async function downloadToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to fetch generated image (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

export async function generate(opts) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Required for live image generation.");
  }
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const quality = process.env.OPENAI_IMAGE_QUALITY || "high";
  const format = (process.env.OPENAI_IMAGE_FORMAT || "png").toLowerCase();
  const prompt = opts.promptOverride || opts.promptResult.mediaPrompt;
  const size = opts.promptResult.size;
  // GPT image models return b64_json by default — do NOT send response_format.
  // Sending it causes HTTP 400 "Unknown parameter: response_format".
  const body = { model, prompt, size, quality, n: 1 };
  if (format && format !== "png") body.output_format = format;
  if (process.env.OPENAI_IMAGE_DEBUG === "1") {
    console.log("[media-providers-runtime] request payload keys:", Object.keys(body).join(", "));
    if ("response_format" in body) {
      throw new Error("ASSERTION FAILED: response_format must not be in GPT image model request");
    }
  }

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  let payload;
  try { payload = await res.json(); } catch { payload = {}; }
  if (!res.ok) {
    const msg = payload?.error?.message;
    throw new Error(`OpenAI image API HTTP ${res.status}: ${msg || "unknown error"}`);
  }
  const { data, remoteUrl } = decodeOpenAi(payload);
  let bytes = data;
  if (!bytes && remoteUrl) bytes = await downloadToBuffer(remoteUrl);
  if (!bytes) throw new Error("OpenAI image response had neither b64_json nor a downloadable URL");

  const outPath = outputPathFor(opts);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, bytes);
  return {
    localPath: outPath,
    byteLength: bytes.length,
    promptHash: hashPrompt(prompt),
  };
}

/* ─────────────────────────────────────────────────────────────────────── *
 * Storage adapters
 * ─────────────────────────────────────────────────────────────────────── */

function getStorageProvider() {
  const raw = (process.env.ASSET_STORAGE_PROVIDER || "local_dry_run").toLowerCase();
  if (raw === "cloudinary" || raw === "vercel_blob" || raw === "s3" || raw === "supabase") return raw;
  return "local_dry_run";
}

async function uploadLocal(localPath) {
  if (!existsSync(localPath)) throw new Error(`localDryRun upload: file not found at ${localPath}`);
  const abs = resolve(localPath);
  return { assetUrl: `file://${abs}`, storageProvider: "local_dry_run", storagePath: abs };
}

async function uploadCloudinary(localPath, opts) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { folder: opts.folder, public_id: opts.publicId, timestamp };
  const signed = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = createHash("sha1").update(signed + apiSecret).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([readFileSync(localPath)]), basename(localPath));
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", opts.folder);
  form.append("public_id", opts.publicId);
  form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const assetUrl = data.secure_url || data.url;
  if (!assetUrl) throw new Error("Cloudinary upload returned no URL");
  return { assetUrl, storageProvider: "cloudinary", storagePath: data.public_id || `${opts.folder}/${opts.publicId}` };
}

async function uploadVercelBlob(localPath, opts) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not set.");

  // Use the official @vercel/blob SDK — it handles store-ID extraction,
  // correct headers, and API versioning automatically. Raw-fetch approaches
  // fail outside Vercel deployments because the API rejects requests that
  // cannot derive the store ID from the token alone.
  const { put } = await import("@vercel/blob");
  const contentType = opts.contentType || "image/png";
  const fileBuffer = readFileSync(localPath);

  const blob = await put(opts.pathname, fileBuffer, {
    access: "public",
    token,
    contentType,
    addRandomSuffix: false,
  });

  if (!blob.url) throw new Error("Vercel Blob put() returned no URL");
  return { assetUrl: blob.url, storageProvider: "vercel_blob", storagePath: blob.pathname || opts.pathname };
}

async function uploadAsset(localPath, opts) {
  const provider = getStorageProvider();
  if (provider === "cloudinary") return uploadCloudinary(localPath, opts);
  if (provider === "vercel_blob") return uploadVercelBlob(localPath, opts);
  if (provider !== "local_dry_run") {
    throw new Error(`Asset storage provider "${provider}" is not implemented yet.`);
  }
  return uploadLocal(localPath);
}

export const storage = { uploadAsset, uploadLocal, getStorageProvider };
