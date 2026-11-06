import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { StorageAdapter } from "./types";

const ROOT = path.join(process.cwd(), ".data", "uploads");

function resolveSafeKey(objectKey: string) {
  const normalized = path.normalize(objectKey).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..")) throw new Error("Invalid object key");
  return path.join(ROOT, normalized);
}

export class LocalFilesystemStorage implements StorageAdapter {
  readonly driver = "local" as const;

  async putObject(objectKey: string, body: Buffer, contentType: string) {
    void contentType;
    const filePath = resolveSafeKey(objectKey);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  }

  async getObject(objectKey: string) {
    const filePath = resolveSafeKey(objectKey);
    try {
      const body = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      return { body, contentType };
    } catch {
      return null;
    }
  }

  async getReadableUrl(objectKey: string) {
    return `/api/evidence/file?key=${encodeURIComponent(objectKey)}`;
  }
}
