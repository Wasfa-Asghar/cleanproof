import { validateImageMagicBytes } from "@/lib/evidence/constants";
import { ForbiddenError } from "@/lib/errors";
import { updateOrgBranding } from "@/lib/org/settings";
import { buildOrgLogoKey, getStorageAdapter } from "@/lib/storage";

const MAX_LOGO_BYTES = 512 * 1024;

export async function uploadOrgLogo(input: {
  organizationId: string;
  body: Buffer;
  mimeType: string;
}) {
  if (input.mimeType !== "image/png" && input.mimeType !== "image/jpeg") {
    throw new ForbiddenError("Logo must be PNG or JPEG");
  }
  if (input.body.length > MAX_LOGO_BYTES) throw new ForbiddenError("Logo file too large");
  if (!validateImageMagicBytes(input.body, input.mimeType)) {
    throw new ForbiddenError("Invalid logo image data");
  }

  const ext = input.mimeType === "image/png" ? ".png" : ".jpg";
  const key = buildOrgLogoKey(input.organizationId, ext);
  const storage = getStorageAdapter();
  await storage.putObject(key, input.body, input.mimeType);
  await updateOrgBranding(input.organizationId, {
    logoObjectKey: key,
    logoMimeType: input.mimeType as "image/png" | "image/jpeg",
  });
  return { objectKey: key };
}
