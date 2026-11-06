"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import {
  assignIssue,
  createCustomerComplaint,
  createIssue,
  updateIssueStatus,
} from "@/lib/issues/service";
import type { IssueCategory } from "@/lib/issues/categories";
import type { IssueStatus } from "@/lib/data/types";

export async function createIssueAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  await createIssue(session, {
    siteId: String(formData.get("siteId")),
    jobId: String(formData.get("jobId") ?? "") || undefined,
    title: String(formData.get("title")),
    description: String(formData.get("description") ?? "") || undefined,
    category: String(formData.get("category")) as IssueCategory,
    severity: String(formData.get("severity") ?? "medium") as "low" | "medium" | "high",
    assigneeId: String(formData.get("assigneeId") ?? "") || undefined,
  });
  revalidatePath("/app/issues");
}

export async function updateIssueStatusAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const issueId = String(formData.get("issueId"));
  await updateIssueStatus(session, {
    issueId,
    status: String(formData.get("status")) as IssueStatus,
    resolutionNotes: String(formData.get("resolutionNotes") ?? "") || undefined,
  });
  revalidatePath("/app/issues");
  revalidatePath(`/app/issues/${issueId}`);
}

export async function assignIssueAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const issueId = String(formData.get("issueId"));
  await assignIssue(session, {
    issueId,
    assigneeId: String(formData.get("assigneeId")),
  });
  revalidatePath(`/app/issues/${issueId}`);
}

export async function createComplaintAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  await createCustomerComplaint(session, {
    jobId: String(formData.get("jobId")),
    description: String(formData.get("description")),
    severity: String(formData.get("severity") ?? "medium") as "low" | "medium" | "high",
    assigneeId: String(formData.get("assigneeId") ?? "") || undefined,
    internalNotes: String(formData.get("internalNotes") ?? "") || undefined,
  });
  revalidatePath("/app/issues");
  revalidatePath("/app/overview");
}
