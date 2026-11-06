"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import {
  addJobInternalNote,
  approveJobReview,
  rejectJobReview,
  requestClarificationReview,
} from "@/lib/quality/review-service";

export async function approveJobReviewAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId"));
  const internalNotes = String(formData.get("internalNotes") ?? "");
  await approveJobReview(session, {
    jobId,
    idempotencyKey: String(formData.get("idempotencyKey") ?? randomUUID()),
    internalNotes: internalNotes || undefined,
  });
  revalidatePath(`/app/jobs/${jobId}`);
  revalidatePath("/app/quality");
  revalidatePath("/app/overview");
}

export async function clarificationReviewAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId"));
  const reason = String(formData.get("reason") ?? "");
  await requestClarificationReview(session, {
    jobId,
    idempotencyKey: String(formData.get("idempotencyKey") ?? randomUUID()),
    reason,
    internalNotes: String(formData.get("internalNotes") ?? "") || undefined,
  });
  revalidatePath(`/app/jobs/${jobId}`);
  revalidatePath(`/field/jobs/${jobId}`);
}

export async function rejectJobReviewAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId"));
  await rejectJobReview(session, {
    jobId,
    idempotencyKey: String(formData.get("idempotencyKey") ?? randomUUID()),
    reason: String(formData.get("reason") ?? ""),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    internalNotes: String(formData.get("internalNotes") ?? "") || undefined,
  });
  revalidatePath(`/app/jobs/${jobId}`);
  revalidatePath("/app/quality");
  revalidatePath("/field/today");
}

export async function addJobInternalNoteAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId"));
  await addJobInternalNote(session, { jobId, note: String(formData.get("note") ?? "") });
  revalidatePath(`/app/jobs/${jobId}`);
}
