import { addDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, memberships, organizations, subscriptions, users } from "@/db/schema";
import { TRIAL_DAYS, TRIAL_PLAN_ID } from "@/lib/billing/plans";
import type { SessionPayload } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";

export async function createOrganizationWithOwner(input: {
  company: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({
        legalName: input.company,
        displayName: input.company,
        region: "UK",
        currency: "GBP",
        timeZone: "Europe/London",
      })
      .returning();

    const [user] = await tx
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
      })
      .returning();

    await tx.insert(memberships).values({
      organizationId: org.id,
      userId: user.id,
      role: "owner",
      status: "active",
    });

    const trialStart = new Date();
    const trialEnd = addDays(trialStart, TRIAL_DAYS);
    await tx.insert(subscriptions).values({
      organizationId: org.id,
      plan: TRIAL_PLAN_ID,
      status: "trialing",
      trialStartsAt: trialStart,
      trialEndsAt: trialEnd,
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
    });

    return { org, user };
  });
}

export async function approveJob(jobId: string, session: SessionPayload) {
  const { randomUUID } = await import("crypto");
  const { approveJobReview } = await import("@/lib/quality/review-service");
  await approveJobReview(session, { jobId, idempotencyKey: randomUUID() });
}

export async function requestJobClarification(jobId: string, session: SessionPayload, reason?: string) {
  const { randomUUID } = await import("crypto");
  const { requestClarificationReview } = await import("@/lib/quality/review-service");
  await requestClarificationReview(session, {
    jobId,
    idempotencyKey: randomUUID(),
    reason: reason ?? "Clarification requested",
  });
}

export async function startJob(jobId: string, session: SessionPayload) {
  const db = getDb();
  const [updated] = await db
    .update(jobs)
    .set({ status: "in_progress" })
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.organizationId, session.organizationId),
        eq(jobs.assignedUserId, session.userId),
      ),
    )
    .returning();
  if (!updated) throw new NotFoundError();
}


export async function cancelSubscription(session: SessionPayload) {
  const { cancelAtPeriodEnd } = await import("@/lib/billing/subscription-service");
  await cancelAtPeriodEnd(session);
}
