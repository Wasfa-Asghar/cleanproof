import { LocalFilesystemStorage } from "./local-fs";
import { R2Storage } from "./r2";
import type { StorageAdapter } from "./types";

let adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (adapter) return adapter;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") {
    adapter = new R2Storage();
  } else {
    adapter = new LocalFilesystemStorage();
  }
  return adapter;
}

export function buildOrgLogoKey(organizationId: string, extension: ".png" | ".jpg") {
  return `${organizationId}/branding/logo${extension}`;
}

export function buildObjectKey(input: {
  organizationId: string;
  jobId: string;
  evidenceId: string;
  extension: string;
}) {
  return `${input.organizationId}/${input.jobId}/${input.evidenceId}${input.extension}`;
}
