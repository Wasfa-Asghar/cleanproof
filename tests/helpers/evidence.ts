import { completeEvidenceUpload, initEvidenceUpload } from "@/lib/evidence/service";
import type { SessionPayload } from "@/lib/auth/session";

/** Minimal buffer that passes magic-byte validation (requires length >= 12). */
export const MIN_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x00, 0x00, 0x00, 0x00,
]);

export async function seedBeforeAfterEvidence(input: {
  session: SessionPayload;
  jobId: string;
}) {
  for (const kind of ["before", "after"] as const) {
    const init = await initEvidenceUpload({
      session: input.session,
      jobId: input.jobId,
      kind,
      mimeType: "image/jpeg",
      sizeBytes: MIN_JPEG.length,
      contentHash: `${input.jobId}-${kind}`,
    });
    await completeEvidenceUpload({
      session: input.session,
      evidenceId: init.evidenceId,
      body: MIN_JPEG,
    });
  }
}
