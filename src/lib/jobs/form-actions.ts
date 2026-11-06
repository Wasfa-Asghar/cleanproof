"use server";

import { approveJobAction, startJobAction, submitChecklistAction } from "./actions";

export async function startJobFormAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (jobId) await startJobAction(jobId);
}

export async function submitChecklistFormAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (jobId) await submitChecklistAction(jobId, formData);
}

export async function approveJobFormAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (jobId) await approveJobAction(jobId);
}
