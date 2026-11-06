"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { approveJob, requestJobClarification, startJob } from "@/lib/db/mutations";
import { createJobForOrg, updateJobSchedule } from "@/lib/jobs/create-job";

export async function approveJobAction(jobId: string) {
  const session = await requireValidSession(await getSession());
  await approveJob(jobId, session);
  revalidatePath(`/app/jobs/${jobId}`);
  revalidatePath("/app/quality");
}

export async function requestClarificationAction(jobId: string) {
  const session = await requireValidSession(await getSession());
  await requestJobClarification(jobId, session);
  revalidatePath(`/app/jobs/${jobId}`);
}

export async function startJobAction(jobId: string) {
  const session = await requireValidSession(await getSession());
  await startJob(jobId, session);
  revalidatePath(`/field/jobs/${jobId}`);
  revalidatePath("/field/today");
}

export async function submitChecklistAction(jobId: string, formData: FormData) {
  const session = await requireValidSession(await getSession());
  const { submitJobChecklistFromForm } = await import("@/lib/jobs/submit-form");
  await submitJobChecklistFromForm(jobId, session, formData);
  revalidatePath(`/field/jobs/${jobId}`);
  revalidatePath("/app/quality");
}

export async function createJobAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const siteId = String(formData.get("siteId") ?? "");
  const title = String(formData.get("title") ?? "Cleaning visit");
  const assignedUserId = String(formData.get("assignedUserId") ?? "");
  const startRaw = String(formData.get("startAt") ?? "");
  const startAt = new Date(startRaw);
  await createJobForOrg(session, {
    siteId,
    title,
    startAt,
    assignedUserId,
    idempotencyKey: String(formData.get("idempotencyKey") ?? `create:${Date.now()}`),
  });
  revalidatePath("/app/jobs");
}

export async function updateJobScheduleAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId") ?? "");
  const startAt = new Date(String(formData.get("startAt") ?? ""));
  await updateJobSchedule(session, {
    jobId,
    startAt,
    idempotencyKey: String(formData.get("idempotencyKey") ?? `sched:${jobId}:${startAt.toISOString()}`),
  });
  revalidatePath(`/app/jobs/${jobId}`);
}
