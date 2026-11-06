import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { emailOutbox, notificationPreferences, notifications, users } from "@/db/schema";
import type { NotifyInput } from "@/lib/notifications/types";
import { getEmailProvider } from "@/lib/notifications/email-provider";

async function isEmailEnabled(organizationId: string, userId: string, eventType: string) {
  const db = getDb();
  const [pref] = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.organizationId, organizationId),
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.eventType, eventType),
      ),
    )
    .limit(1);
  if (!pref) return true;
  return pref.emailEnabled;
}

async function isInAppEnabled(organizationId: string, userId: string, eventType: string) {
  const db = getDb();
  const [pref] = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.organizationId, organizationId),
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.eventType, eventType),
      ),
    )
    .limit(1);
  if (!pref) return true;
  return pref.inAppEnabled;
}

/** Fire-and-forget safe: never throws to callers. */
export async function notifyEvent(input: NotifyInput) {
  try {
    const db = getDb();
    const provider = getEmailProvider();

    for (const userId of input.recipientUserIds) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) continue;

      const deliveryKey = `${input.idempotencyKey}:${userId}`;
      const [existingDelivery] = await db
        .select()
        .from(emailOutbox)
        .where(
          and(
            eq(emailOutbox.organizationId, input.organizationId),
            eq(emailOutbox.idempotencyKey, deliveryKey),
          ),
        )
        .limit(1);
      if (existingDelivery) continue;

      if (await isInAppEnabled(input.organizationId, userId, input.eventType)) {
        await db.insert(notifications).values({
          organizationId: input.organizationId,
          userId,
          type: input.eventType,
          title: input.title,
          body: input.body,
          linkPath: input.linkPath,
          jobId: input.jobId ?? null,
          issueId: input.issueId ?? null,
        });
      }

      const emailEnabled = await isEmailEnabled(input.organizationId, userId, input.eventType);
      if (!emailEnabled) {
        await db.insert(emailOutbox).values({
          organizationId: input.organizationId,
          notificationType: input.eventType,
          recipientEmail: user.email,
          recipientUserId: userId,
          subject: input.emailSubject,
          htmlBody: input.emailHtml,
          textBody: input.emailText,
          status: "skipped",
          idempotencyKey: deliveryKey,
          relatedJobId: input.jobId ?? null,
          relatedIssueId: input.issueId ?? null,
        });
        continue;
      }

      const [row] = await db
        .insert(emailOutbox)
        .values({
          organizationId: input.organizationId,
          notificationType: input.eventType,
          recipientEmail: user.email,
          recipientUserId: userId,
          subject: input.emailSubject,
          htmlBody: input.emailHtml,
          textBody: input.emailText,
          status: "pending",
          idempotencyKey: deliveryKey,
          relatedJobId: input.jobId ?? null,
          relatedIssueId: input.issueId ?? null,
        })
        .returning();

      const result = await provider.send({
        to: user.email,
        subject: input.emailSubject,
        html: input.emailHtml,
        text: input.emailText,
      });

      if (result.ok) {
        await db
          .update(emailOutbox)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(emailOutbox.id, row.id));
      } else {
        await db
          .update(emailOutbox)
          .set({
            status: "failed",
            failureReason: result.reason,
            retryCount: sql`${emailOutbox.retryCount} + 1`,
          })
          .where(eq(emailOutbox.id, row.id));
      }
    }
  } catch (err) {
    console.error("[notifyEvent]", err);
  }
}

export async function retryFailedEmails(organizationId?: string) {
  const db = getDb();
  const provider = getEmailProvider();
  const rows = await db
    .select()
    .from(emailOutbox)
    .where(
      organizationId
        ? and(eq(emailOutbox.organizationId, organizationId), eq(emailOutbox.status, "failed"))
        : eq(emailOutbox.status, "failed"),
    )
    .limit(50);

  for (const row of rows) {
    const result = await provider.send({
      to: row.recipientEmail,
      subject: row.subject,
      html: row.htmlBody,
      text: row.textBody,
    });
    if (result.ok) {
      await db
        .update(emailOutbox)
        .set({ status: "sent", sentAt: new Date(), failureReason: null })
        .where(eq(emailOutbox.id, row.id));
    } else {
      await db
        .update(emailOutbox)
        .set({
          failureReason: result.reason,
          retryCount: row.retryCount + 1,
        })
        .where(eq(emailOutbox.id, row.id));
    }
  }
}

export async function listNotificationsForUser(userId: string, organizationId: string, limit = 30) {
  const db = getDb();
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.organizationId, organizationId)))
    .orderBy(sql`${notifications.createdAt} desc`)
    .limit(limit);
}

export async function countUnreadNotifications(userId: string, organizationId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.organizationId, organizationId),
        isNull(notifications.readAt),
      ),
    );
  return rows.length;
}

export async function markNotificationRead(notificationId: string, userId: string, organizationId: string) {
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        eq(notifications.organizationId, organizationId),
      ),
    );
}

export async function listEmailOutbox(organizationId: string, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(emailOutbox)
    .where(eq(emailOutbox.organizationId, organizationId))
    .orderBy(sql`${emailOutbox.createdAt} desc`)
    .limit(limit);
}

export async function upsertNotificationPreference(input: {
  organizationId: string;
  userId: string;
  eventType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.organizationId, input.organizationId),
        eq(notificationPreferences.userId, input.userId),
        eq(notificationPreferences.eventType, input.eventType),
      ),
    )
    .limit(1);
  if (existing) {
    await db
      .update(notificationPreferences)
      .set({
        emailEnabled: input.emailEnabled,
        inAppEnabled: input.inAppEnabled,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.id, existing.id));
    return;
  }
  await db.insert(notificationPreferences).values({
    organizationId: input.organizationId,
    userId: input.userId,
    eventType: input.eventType,
    emailEnabled: input.emailEnabled,
    inAppEnabled: input.inAppEnabled,
  });
}
