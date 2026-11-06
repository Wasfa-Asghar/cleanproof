#!/usr/bin/env node
/**
 * Validates marketing screenshots under public/marketing/ and cross-checks src/lib/marketing/image-manifest.ts.
 * Run: node scripts/verify-marketing-assets.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const errors = [];

function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

function checkImageFile(absPath, label) {
  assert(fs.existsSync(absPath), `Missing: ${label} (${absPath})`);
  const st = fs.statSync(absPath);
  assert(st.size >= 8000, `Too small (${st.size} bytes): ${label}`);
  const buf = fs.readFileSync(absPath);
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  assert(isJpeg || isPng, `Not JPEG/PNG magic: ${label}`);
}

const manifestPath = path.join(ROOT, "public/marketing/IMAGE_MANIFEST.json");
assert(fs.existsSync(manifestPath), "IMAGE_MANIFEST.json missing");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const photos = manifest.photos ?? [];
for (const p of photos) {
  if (p.status && String(p.status).toUpperCase().includes("PLACEHOLDER")) {
    errors.push(`Manifest status still PLACEHOLDER: ${p.file || JSON.stringify(p)}`);
  }
  const rel = p.localPath ?? `/marketing/photos/${p.file}`;
  const abs = path.join(ROOT, "public", rel.replace(/^\//, ""));
  checkImageFile(abs, `photo ${p.file}`);
  assert(p.sourceUrl && String(p.sourceUrl).startsWith("http"), `photo ${p.file}: sourceUrl`);
  assert(p.license && /pexels/i.test(p.license), `photo ${p.file}: license should mention Pexels`);
  assert(p.photographer && p.photographer.length > 1, `photo ${p.file}: photographer`);
}

for (const s of manifest.screenshots) {
  const abs = path.join(ROOT, "public/marketing/screenshots", s.file);
  checkImageFile(abs, `screenshot ${s.file}`);
}

const imPath = path.join(ROOT, "src/lib/marketing/image-manifest.ts");
const imSrc = fs.readFileSync(imPath, "utf8");
const fileMatches = [...imSrc.matchAll(/file:\s*"(\/marketing\/(?:photos|screenshots)\/[^"]+)"/g)].map((m) => m[1]);
assert(fileMatches.length > 0, "Could not parse file paths from image-manifest.ts");
for (const f of fileMatches) {
  const abs = path.join(ROOT, "public", f.replace(/^\//, ""));
  checkImageFile(abs, `image-manifest ref ${f}`);
}
const altMatches = [...imSrc.matchAll(/alt:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const alt of altMatches) {
  assert(alt.length >= 16, `Alt text too short: "${alt}"`);
}

if (errors.length) {
  console.error("Marketing asset verification FAILED:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Marketing asset verification OK");
