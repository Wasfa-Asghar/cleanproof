export type EvidenceKind = "before" | "after" | "during";

export interface StoragePutResult {
  objectKey: string;
}

export interface StorageAdapter {
  /** Human-readable driver id */
  readonly driver: "local" | "r2";

  putObject(objectKey: string, body: Buffer, contentType: string): Promise<void>;

  getObject(objectKey: string): Promise<{ body: Buffer; contentType: string } | null>;

  /** Local dev: same-origin path. R2: presigned GET URL. */
  getReadableUrl(objectKey: string): Promise<string>;
}
