/**
 * Cloudinary upload adapter.
 *
 * Configured by:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * Uses the unsigned/signed upload endpoint with an API key + timestamp +
 * SHA1 signature. No SDK dependency.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

import type { UploadedAsset } from "./mediaTypes";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(sorted + apiSecret).digest("hex");
}

export async function uploadToCloudinary(
  localPath: string,
  opts: { folder: string; publicId: string }
): Promise<UploadedAsset> {
  const cfg = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = {
    folder: opts.folder,
    public_id: opts.publicId,
    timestamp,
  };
  const signature = signParams(params, cfg.apiSecret);

  // Build multipart body manually — Node has built-in FormData on 18+.
  const form = new FormData();
  const fileData = readFileSync(localPath);
  form.append("file", new Blob([fileData]), basename(localPath));
  form.append("api_key", cfg.apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", opts.folder);
  form.append("public_id", opts.publicId);
  form.append("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { secure_url?: string; url?: string; public_id?: string };
  const assetUrl = data.secure_url || data.url;
  if (!assetUrl) throw new Error("Cloudinary upload returned no URL");

  return {
    assetUrl,
    storageProvider: "cloudinary",
    storagePath: data.public_id || `${opts.folder}/${opts.publicId}`,
  };
}
