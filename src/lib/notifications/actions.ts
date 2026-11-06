"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { markNotificationRead, upsertNotificationPreference } from "@/lib/notifications/service";

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const notificationId = String(formData.get("notificationId"));
  await markNotificationRead(notificationId, session.userId, session.organizationId);
  revalidatePath("/app");
}

export async function saveNotificationPreferenceAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  if (session.role !== "owner" && session.role !== "manager") return;
  await upsertNotificationPreference({
    organizationId: session.organizationId,
    userId: session.userId,
    eventType: String(formData.get("eventType")),
    emailEnabled: formData.get("emailEnabled") === "on",
    inAppEnabled: formData.get("inAppEnabled") === "on",
  });
  revalidatePath("/app/settings/notifications");
}
