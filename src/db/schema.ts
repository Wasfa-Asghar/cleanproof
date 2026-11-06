import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const membershipRoleEnum = pgEnum("membership_role", [
  "owner",
  "manager",
  "cleaner",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "assigned",
  "in_progress",
  "submitted",
  "needs_review",
  "approved",
  "rejected",
  "closed",
  "cancelled",
]);

export const issueStatusEnum = pgEnum("issue_status", [
  "open",
  "acknowledged",
  "assigned",
  "work_in_progress",
  "ready_for_review",
  "resolved",
  "client_notified",
  "closed",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  legalName: text("legal_name").notNull(),
  displayName: text("display_name").notNull(),
  region: text("region").notNull().default("UK"),
  currency: text("currency").notNull().default("GBP"),
  timeZone: text("time_zone").notNull().default("Europe/London"),
  settingsJson: jsonb("settings_json").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("memberships_org_user").on(t.organizationId, t.userId)],
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  contactsJson: jsonb("contacts_json").$type<Array<{ name: string; email?: string; phone?: string }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  addressLine1: text("address_line1").notNull(),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  country: text("country").notNull().default("GB"),
  timeZone: text("time_zone").notNull(),
  instructions: text("instructions"),
  accessSensitivity: text("access_sensitivity").notNull().default("standard"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
(t) => [index("sites_org_idx").on(t.organizationId)]);

export const checklistTemplates = pgTable("checklist_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
(t) => [index("checklist_templates_org_idx").on(t.organizationId)]);

export const checklistTemplateVersions = pgTable("checklist_template_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => checklistTemplates.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templateItems = pgTable("template_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateVersionId: uuid("template_version_id")
    .notNull()
    .references(() => checklistTemplateVersions.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  label: text("label").notNull(),
  taskType: text("task_type").notNull().default("checkbox"),
  required: boolean("required").default(true).notNull(),
  evidencePolicy: text("evidence_policy").notNull().default("optional"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  templateVersionId: uuid("template_version_id")
    .notNull()
    .references(() => checklistTemplateVersions.id),
  title: text("title").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  status: jobStatusEnum("status").notNull().default("draft"),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  seriesId: uuid("series_id"),
  jobKind: text("job_kind").notNull().default("standard"),
  recleanSourceJobId: uuid("reclean_source_job_id"),
  reviewPriority: text("review_priority").notNull().default("normal"),
  failedItemIds: jsonb("failed_item_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
(t) => [
  index("jobs_org_status_idx").on(t.organizationId, t.status),
  index("jobs_reclean_source_idx").on(t.recleanSourceJobId),
]);

export const jobItemResults = pgTable("job_item_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull(),
  result: text("result").notNull(),
  exceptionReason: text("exception_reason"),
  note: text("note"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const evidence = pgTable(
  "evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    itemId: uuid("item_id"),
    kind: text("kind").notNull().default("during"),
    objectKey: text("object_key").notNull(),
    visibility: text("visibility").notNull().default("internal"),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    contentHash: text("content_hash"),
    scanState: text("scan_state").notNull().default("pending"),
    uploadedBy: uuid("uploaded_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("evidence_org_job_idx").on(t.organizationId, t.jobId),
    uniqueIndex("evidence_job_content_hash").on(t.jobId, t.contentHash),
  ],
);

export const jobSubmissions = pgTable(
  "job_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    submittedBy: uuid("submitted_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("job_submissions_idempotency").on(t.jobId, t.idempotencyKey)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id),
    verdict: text("verdict").notNull(),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    idempotencyKey: text("idempotency_key").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("reviews_job_idempotency").on(t.jobId, t.idempotencyKey), index("reviews_job_idx").on(t.jobId)],
);

export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: issueStatusEnum("status").notNull().default("open"),
  source: text("source").notNull().default("internal"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  createdById: uuid("created_by_id").references(() => users.id),
  linkedRecleanJobId: uuid("linked_reclean_job_id").references(() => jobs.id),
  resolutionNotes: text("resolution_notes"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
(t) => [index("issues_org_status_idx").on(t.organizationId, t.status), index("issues_job_idx").on(t.jobId)]);

export const issueActivities = pgTable(
  "issue_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    body: text("body"),
    isInternal: boolean("is_internal").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("issue_activities_issue_idx").on(t.issueId)],
);

export const issueEvidence = pgTable(
  "issue_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => evidence.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("issue_evidence_pair").on(t.issueId, t.evidenceId)],
);

export const reportShares = pgTable("report_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
(t) => [index("report_shares_org_job_idx").on(t.organizationId, t.jobId)]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("starter"),
    status: text("status").notNull().default("trialing"),
    trialStartsAt: timestamp("trial_starts_at", { withTimezone: true }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    scheduledPlan: text("scheduled_plan"),
    scheduledPlanEffectiveAt: timestamp("scheduled_plan_effective_at", { withTimezone: true }),
    mollieCustomerId: text("mollie_customer_id"),
    mollieSubscriptionId: text("mollie_subscription_id"),
    providerCustomerRef: text("provider_customer_ref"),
    providerSubscriptionRef: text("provider_subscription_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("subscriptions_org_unique").on(t.organizationId)],
);

export const billingCustomers = pgTable("billing_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("mock"),
  externalRef: text("external_ref").notNull(),
  simulated: boolean("simulated").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull().default("GBP"),
    status: text("status").notNull().default("pending"),
    provider: text("provider").notNull().default("mock"),
    checkoutSessionRef: text("checkout_session_ref"),
    idempotencyKey: text("idempotency_key").notNull(),
    simulated: boolean("simulated").notNull().default(true),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("payment_attempts_idempotency").on(t.organizationId, t.idempotencyKey)],
);

export const billingTransactions = pgTable("billing_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  paymentAttemptId: uuid("payment_attempt_id").references(() => paymentAttempts.id),
  type: text("type").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull().default("GBP"),
  description: text("description").notNull(),
  simulated: boolean("simulated").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptionChangeRequests = pgTable("subscription_change_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  fromPlan: text("from_plan"),
  toPlan: text("to_plan"),
  status: text("status").notNull().default("pending"),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("billing_events_idempotency").on(t.organizationId, t.idempotencyKey)],
);

export const providerEventLog = pgTable(
  "provider_event_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("provider_event_log_unique").on(t.provider, t.externalEventId)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    linkPath: text("link_path"),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    issueId: uuid("issue_id").references(() => issues.id, { onDelete: "set null" }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("notifications_org_user_idx").on(t.organizationId, t.userId),
    index("notifications_user_unread_idx").on(t.userId, t.readAt),
  ],
);

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    notificationType: text("notification_type").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    recipientUserId: uuid("recipient_user_id").references(() => users.id),
    subject: text("subject").notNull(),
    htmlBody: text("html_body").notNull(),
    textBody: text("text_body").notNull(),
    status: text("status").notNull().default("pending"),
    retryCount: integer("retry_count").notNull().default(0),
    failureReason: text("failure_reason"),
    idempotencyKey: text("idempotency_key").notNull(),
    relatedJobId: uuid("related_job_id").references(() => jobs.id),
    relatedIssueId: uuid("related_issue_id").references(() => issues.id),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("email_outbox_idempotency").on(t.organizationId, t.idempotencyKey)],
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    inAppEnabled: boolean("in_app_enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("notification_prefs_user_event").on(t.organizationId, t.userId, t.eventType)],
);

export const teamInvitations = pgTable(
  "team_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: membershipRoleEnum("role").notNull().default("cleaner"),
    status: text("status").notNull().default("pending"),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("team_invitations_org_email").on(t.organizationId, t.email)],
);

export const csvImportRuns = pgTable("csv_import_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  importedBy: uuid("imported_by")
    .notNull()
    .references(() => users.id),
  recordType: text("record_type").notNull(),
  totalRows: integer("total_rows").notNull().default(0),
  successRows: integer("success_rows").notNull().default(0),
  failedRows: integer("failed_rows").notNull().default(0),
  failureSummary: jsonb("failure_summary").$type<Array<{ row: number; reason: string }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Website contact form — not tenant-scoped; visibility restricted to app owners via dev inbox. */
export const contactInquiries = pgTable(
  "contact_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company").notNull().default(""),
    country: text("country").notNull().default(""),
    enquiryType: text("enquiry_type").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    sourceIpHash: text("source_ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("contact_inquiries_created_at_idx").on(t.createdAt), index("contact_inquiries_status_idx").on(t.status)],
);
