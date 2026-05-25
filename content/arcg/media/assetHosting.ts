/**
 * Asset hosting facade — picks the right storage adapter based on
 * ASSET_STORAGE_PROVIDER.
 *
 * Rules:
 *   - "local_dry_run" — returns a file:// URL (NOT Buffer-ready)
 *   - "cloudinary"    — uploads via cloudinaryStorage
 *   - "vercel_blob"   — uploads via vercelBlobStorage
 *
 * Stable URL is required before a post can be marked mediaStatus="ready"
 * for Buffer scheduling. Local URLs never get promoted to "ready".
 */

import type { AssetStorageProvider, UploadedAsset } from "./mediaTypes";
import { uploadLocal } from "./localDryRunStorage";
import { uploadToCloudinary } from "./cloudinaryStorage";
import { uploadToVercelBlob } from "./vercelBlobStorage";

export function getStorageProvider(): AssetStorageProvider {
  const raw = (process.env.ASSET_STORAGE_PROVIDER || "local_dry_run").toLowerCase();
  if (raw === "cloudinary" || raw === "vercel_blob" || raw === "s3" || raw === "supabase") {
    return raw as AssetStorageProvider;
  }
  return "local_dry_run";
}

/** Returns true when the configured provider produces stable public URLs. */
export function providerIsBufferReady(provider: AssetStorageProvider): boolean {
  return provider === "cloudinary" || provider === "vercel_blob" || provider === "s3";
}

export interface UploadOptions {
  /** Base folder under which assets land. Example: arcg-media/2026-07. */
  folder: string;
  /** Unique identifier used inside the folder. Example: arcg-2026-07-04-linkedin */
  publicId: string;
  /** Optional explicit pathname for blob-style providers. */
  pathname?: string;
  /** Optional content-type override. */
  contentType?: string;
}

export async function uploadAsset(
  localPath: string,
  opts: UploadOptions
): Promise<UploadedAsset> {
  const provider = getStorageProvider();
  if (provider === "cloudinary") {
    return uploadToCloudinary(localPath, {
      folder: opts.folder,
      publicId: opts.publicId,
    });
  }
  if (provider === "vercel_blob") {
    const pathname = opts.pathname || `${opts.folder}/${opts.publicId}.png`;
    return uploadToVercelBlob(localPath, {
      pathname,
      contentType: opts.contentType,
    });
  }
  // s3 / supabase — not yet implemented in V1; surface clearly rather than fail silently
  if (provider !== "local_dry_run") {
    throw new Error(
      `Asset storage provider "${provider}" is not implemented yet. Use local_dry_run, cloudinary, or vercel_blob.`
    );
  }
  return uploadLocal(localPath);
}
