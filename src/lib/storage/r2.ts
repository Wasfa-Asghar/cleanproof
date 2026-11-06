import type { StorageAdapter } from "./types";

/**
 * R2 / S3-compatible adapter (production). Requires env:
 * S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PUBLIC_URL (optional)
 *
 * Not used in local development unless STORAGE_DRIVER=r2 is explicitly set.
 */
export class R2Storage implements StorageAdapter {
  readonly driver = "r2" as const;

  private get config() {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    if (!endpoint || !bucket || !accessKey || !secretKey) {
      throw new Error("R2 storage is not configured (S3_* env vars missing)");
    }
    return { endpoint, bucket, accessKey, secretKey };
  }

  async putObject(objectKey: string, body: Buffer, contentType: string) {
    const { endpoint, bucket, accessKey, secretKey } = this.config;
    const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${objectKey}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${accessKey}:${secretKey}`,
      },
      body: new Uint8Array(body),
    });
    if (!res.ok) {
      throw new Error(`R2 putObject failed: ${res.status}`);
    }
  }

  async getObject(objectKey: string) {
    const { endpoint, bucket, accessKey, secretKey } = this.config;
    const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${objectKey}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessKey}:${secretKey}` },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return { body: buf, contentType: res.headers.get("content-type") ?? "application/octet-stream" };
  }

  async getReadableUrl(objectKey: string) {
    const publicBase = process.env.S3_PUBLIC_URL;
    if (publicBase) return `${publicBase.replace(/\/$/, "")}/${objectKey}`;
    return `/api/evidence/file?key=${encodeURIComponent(objectKey)}`;
  }
}
