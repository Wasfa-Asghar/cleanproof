import { randomUUID } from "crypto";
import type { SessionPayload } from "@/lib/auth/session";
import { submitJobChecklistPayload } from "./submit-payload";

export async function submitJobChecklistFromForm(
  jobId: string,
  session: SessionPayload,
  formData: FormData,
) {
  const idempotencyKey = String(formData.get("idempotencyKey") ?? randomUUID());
  const itemIds = [...formData.keys()]
    .filter((k) => k.startsWith("item_"))
    .map((k) => k.replace("item_", ""));

  const items = itemIds.map((itemId) => {
    const raw = String(formData.get(`item_${itemId}`) ?? "pass");
    const result = raw === "fail" || raw === "na" || raw === "exception" ? raw : "pass";
    return {
      itemId,
      result: result as "pass" | "fail" | "na" | "exception",
      exceptionReason: String(formData.get(`exc_${itemId}`) ?? "") || undefined,
    };
  });

  await submitJobChecklistPayload(session, { jobId, idempotencyKey, items });
}
