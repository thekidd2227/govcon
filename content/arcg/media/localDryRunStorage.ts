/**
 * Local "dry run" storage — returns a local file path.
 *
 * This adapter does NOT produce Buffer-ready URLs. It exists so the rest of
 * the pipeline can run end-to-end without configuring any cloud storage.
 * `mediaStatus` after a local upload is "generated", not "ready".
 */

import { resolve } from "node:path";
import { existsSync } from "node:fs";

import type { UploadedAsset } from "./mediaTypes";

export async function uploadLocal(localPath: string): Promise<UploadedAsset> {
  if (!existsSync(localPath)) {
    throw new Error(`localDryRun upload: file not found at ${localPath}`);
  }
  const absolute = resolve(localPath);
  return {
    assetUrl: `file://${absolute}`,
    storageProvider: "local_dry_run",
    storagePath: absolute,
  };
}
