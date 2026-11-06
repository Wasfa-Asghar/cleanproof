import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { checklistTemplateVersions, checklistTemplates, jobs } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getSiteForOrganization } from "@/lib/db/queries";
import { notifyJobAssigned } from "@/lib/notifications/dispatch";

export async function createJobForOrg(
  session: SessionPayload,
  input: {
    siteId: string;
    title: string;
    startAt: Date;
    assignedUserId: string;
    templateVersionId?: string;
    idempotencyKey?: string;
  },
) {
  if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
  const { assertBillableAction } = await import("@/lib/billing/entitlements");
  await assertBillableAction(session.organizationId, "create_job");
  const site = await getSiteForOrganization(input.siteId, session.organizationId);
  if (!site) throw new NotFoundError();

  const db = getDb();
  let templateVersionId = input.templateVersionId;
  if (!templateVersionId) {
    const [template] = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.organizationId, session.organizationId))
      .limit(1);
    if (!template) throw new NotFoundError("No checklist template");
    const [version] = await db
      .select()
      .from(checklistTemplateVersions)
      .where(eq(checklistTemplateVersions.templateId, template.id))
      .limit(1);
    if (!version) throw new NotFoundError("No template version");
    templateVersionId = version.id;
  }

  const [job] = await db
    .insert(jobs)
    .values({
      organizationId: session.organizationId,
      siteId: input.siteId,
      templateVersionId,
      title: input.title,
      startAt: input.startAt,
      status: "assigned",
      assignedUserId: input.assignedUserId,
    })
    .returning();

  void notifyJobAssigned({
    organizationId: session.organizationId,
    jobId: job.id,
    jobTitle: job.title,
    assigneeUserId: input.assignedUserId,
    idempotencyKey: input.idempotencyKey ?? `assign:${job.id}`,
  });

  return job;
}

export async function updateJobSchedule(
  session: SessionPayload,
  input: { jobId: string; startAt: Date; idempotencyKey?: string },
) {
  if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
  const db = getDb();
  const [updated] = await db
    .update(jobs)
    .set({ startAt: input.startAt })
    .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
    .returning();
  if (!updated || updated.organizationId !== session.organizationId) throw new NotFoundError();

  if (updated.assignedUserId) {
    const { notifyJobScheduleChanged } = await import("@/lib/notifications/dispatch");
    void notifyJobScheduleChanged({
      organizationId: session.organizationId,
      jobId: updated.id,
      jobTitle: updated.title,
      assigneeUserId: updated.assignedUserId,
      newStartAt: input.startAt.toISOString(),
      idempotencyKey: input.idempotencyKey ?? `schedule:${updated.id}:${input.startAt.toISOString()}`,
    });
  }

  return updated;
}
