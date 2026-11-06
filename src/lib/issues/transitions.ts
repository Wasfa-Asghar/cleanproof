import type { IssueStatus } from "@/lib/data/types";

const ALLOWED: Record<IssueStatus, IssueStatus[]> = {
  open: ["assigned", "closed"],
  acknowledged: ["assigned", "closed"],
  assigned: ["work_in_progress", "open", "closed"],
  work_in_progress: ["ready_for_review", "assigned"],
  ready_for_review: ["resolved", "work_in_progress"],
  resolved: ["closed", "client_notified"],
  client_notified: ["closed"],
  closed: [],
};

export function canTransitionIssue(from: IssueStatus, to: IssueStatus) {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}
