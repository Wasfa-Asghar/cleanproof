import fs from "fs";
import path from "path";

const FIXTURE_DIR = path.join(process.cwd(), "e2e", "fixtures");

function fixturePath(name: string): string {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  const file = path.join(FIXTURE_DIR, name);
  const base = path.join(FIXTURE_DIR, "e2e-photo.jpg");
  if (!fs.existsSync(file) && fs.existsSync(base)) {
    fs.copyFileSync(base, file);
  }
  if (!fs.existsSync(file)) {
    throw new Error(`Missing fixture ${name} — generate e2e/fixtures/e2e-photo.jpg first`);
  }
  return file;
}

export function fieldPhotoBeforePath(): string {
  return fixturePath("e2e-before.jpg");
}

export function fieldPhotoAfterPath(): string {
  return fixturePath("e2e-after.jpg");
}

export function tinyJpegPath(): string {
  return fixturePath("e2e-photo.jpg");
}

export function invalidEvidencePath(): string {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  const file = path.join(FIXTURE_DIR, "invalid-evidence.txt");
  if (!fs.existsSync(file)) fs.writeFileSync(file, "not-an-image");
  return file;
}
