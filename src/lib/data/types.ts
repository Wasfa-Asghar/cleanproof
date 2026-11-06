import type { MembershipRole } from "@/lib/constants/roles";

export type JobStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "needs_review"
  | "approved"
  | "rejected"
  | "closed"
  | "cancelled";

export type IssueStatus =
  | "open"
  | "acknowledged"
  | "assigned"
  | "work_in_progress"
  | "ready_for_review"
  | "resolved"
  | "client_notified"
  | "closed";

export type TaskType = "checkbox" | "yes_no" | "numeric" | "image" | "exception";

export interface Organization {
  id: string;
  legalName: string;
  displayName: string;
  region: string;
  currency: string;
  timeZone: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  status: "active" | "revoked";
}

export interface Client {
  id: string;
  organizationId: string;
  displayName: string;
  contacts: Array<{ name: string; email?: string; phone?: string }>;
}

export interface Site {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  timeZone: string;
  instructions?: string;
  accessSensitivity: "standard" | "restricted";
}

export interface TemplateItem {
  id: string;
  section: string;
  label: string;
  taskType: TaskType;
  required: boolean;
  evidencePolicy: "none" | "optional" | "required";
  sortOrder: number;
}

export interface ChecklistTemplate {
  id: string;
  organizationId: string;
  name: string;
  version: number;
  versionId: string;
  items: TemplateItem[];
}

export interface Job {
  id: string;
  organizationId: string;
  siteId: string;
  templateVersionId: string;
  title: string;
  startAt: string;
  endAt?: string;
  status: JobStatus;
  assignedUserId?: string;
}

export interface JobItemResult {
  id: string;
  jobId: string;
  itemId: string;
  result: "pass" | "fail" | "na" | "exception";
  exceptionReason?: string;
  note?: string;
  submittedAt?: string;
}

export interface Issue {
  id: string;
  organizationId: string;
  siteId: string;
  jobId?: string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high";
  status: IssueStatus;
  assigneeId?: string;
  dueAt?: string;
  createdAt: string;
}

export interface ReportShare {
  id: string;
  organizationId: string;
  jobId: string;
  token: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface Subscription {
  organizationId: string;
  plan: "starter" | "growth" | "pro";
  status: "trialing" | "active" | "past_due" | "cancelled";
  currentPeriodEnd?: string;
}

export interface AuditEvent {
  id: string;
  organizationId: string;
  actorId?: string;
  action: string;
  objectType: string;
  objectId: string;
  createdAt: string;
}

export interface DataStore {
  organizations: Organization[];
  users: User[];
  memberships: Membership[];
  clients: Client[];
  sites: Site[];
  templates: ChecklistTemplate[];
  jobs: Job[];
  jobResults: JobItemResult[];
  issues: Issue[];
  reportShares: ReportShare[];
  subscriptions: Subscription[];
  auditEvents: AuditEvent[];
}
