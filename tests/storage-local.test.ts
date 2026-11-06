import { rm } from "fs/promises";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalFilesystemStorage } from "@/lib/storage/local-fs";

describe("local filesystem storage", () => {
  const testPrefix = `_vitest_${Date.now()}`;

  afterEach(async () => {
    await rm(path.join(process.cwd(), ".data", "uploads", testPrefix), { recursive: true, force: true });
  });

  it("writes and reads objects under org-scoped keys", async () => {
    const storage = new LocalFilesystemStorage();
    const key = `${testPrefix}/org/job/evidence.jpg`;
    const body = Buffer.from("fake-image");
    await storage.putObject(key, body, "image/jpeg");
    const obj = await storage.getObject(key);
    expect(obj?.body.equals(body)).toBe(true);
    expect(obj?.contentType).toBe("image/jpeg");
  });
});
