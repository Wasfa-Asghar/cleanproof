import { getDb } from "@/db";
import { auditEvents } from "@/db/schema";

export async function recordAudit(input: {
  organizationId: string;
  actorId?: string;
  action: string;
  objectType: string;
  objectId: string;
  payload?: Record<string, unknown>;
}) {
  const db = getDb();
  await db.insert(auditEvents).values({
    organizationId: input.organizationId,
    actorId: input.actorId ?? null,
    action: input.action,
    objectType: input.objectType,
    objectId: input.objectId,
    payload: input.payload ?? null,
  });
}
