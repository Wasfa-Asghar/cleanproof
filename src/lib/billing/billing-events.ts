import { getDb } from "@/db";
import { billingEvents } from "@/db/schema";

export async function recordBillingEvent(input: {
  organizationId: string;
  eventType: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}) {
  const db = getDb();
  try {
    await db.insert(billingEvents).values({
      organizationId: input.organizationId,
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload ?? {},
    });
    return { created: true as const };
  } catch {
    return { created: false as const };
  }
}
