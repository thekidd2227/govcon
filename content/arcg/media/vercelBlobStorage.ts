/**
 * Vercel Blob upload adapter.
 *
 * Uses the BLOB_READ_WRITE_TOKEN env var. No SDK — direct PUT to
 * https://blob.vercel-storage.com using the documented REST surface
 * (token in Authorization header, x-content-type set, body is the raw
 * file bytes).
 *
 * Returns the stable public URL Vercel hands back, suitable for Buffer.
 */

import { readFileSync } from "node:fs";

import type { UploadedAsset } from "./mediaTypes";

export async function uploadToVercelBlob(
  localPath: string,
  opts: { pathname: string; contentType?: string }
): Promise<UploadedAsset> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN not set. Add it as a GitHub Actions secret."
    );
  }
  const fileData = readFileSync(localPath);
  const contentType = opts.contentType || "image/png";
  const apiUrl = `https://blob.vercel-storage.com/${encodeURIComponent(opts.pathname)}`;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-content-type": contentType,
      "x-access": "public",
    },
    body: new Blob([fileData], { type: contentType }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Vercel Blob upload HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { url?: string; pathname?: string };
  if (!data.url) throw new Error("Vercel Blob upload returned no URL");

  return {
    assetUrl: data.url,
    storageProvider: "vercel_blob",
    storagePath: data.pathname || opts.pathname,
  };
}
