import type { JobStatus } from "@/lib/data/types";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  assigned: "Assigned",
  in_progress: "In progress",
  submitted: "Submitted",
  needs_review: "Needs review",
  approved: "Approved",
  rejected: "Rejected — re-clean",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function jobStatusTone(status: JobStatus): "neutral" | "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "needs_review":
    case "submitted":
      return "warning";
    case "in_progress":
      return "info";
    case "approved":
    case "closed":
      return "success";
    case "rejected":
      return "danger";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}
