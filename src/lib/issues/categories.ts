export const ISSUE_CATEGORIES = {
  missedTask: "missed_cleaning_task",
  poorQuality: "poor_cleaning_quality",
  damagedItem: "damaged_item",
  missingEvidence: "missing_photo_evidence",
  incompleteChecklist: "incomplete_checklist",
  customerComplaint: "customer_complaint",
  other: "other",
} as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[keyof typeof ISSUE_CATEGORIES];

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  missed_cleaning_task: "Missed cleaning task",
  poor_cleaning_quality: "Poor cleaning quality",
  damaged_item: "Damaged item",
  missing_photo_evidence: "Missing photo evidence",
  incomplete_checklist: "Incomplete checklist",
  customer_complaint: "Customer complaint",
  other: "Other",
};

export const ISSUE_KANBAN_COLUMNS = [
  "open",
  "assigned",
  "work_in_progress",
  "ready_for_review",
  "resolved",
  "closed",
] as const;

export type IssueKanbanStatus = (typeof ISSUE_KANBAN_COLUMNS)[number];

export const ISSUE_STATUS_LABELS: Record<IssueKanbanStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  work_in_progress: "In progress",
  ready_for_review: "Awaiting verification",
  resolved: "Resolved",
  closed: "Closed",
};
