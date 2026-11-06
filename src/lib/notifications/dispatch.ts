import { getEnv } from "@/lib/env";
import { getOrgBranding, formatOrgDate } from "@/lib/org/settings";
import { NOTIFICATION_EVENTS } from "@/lib/notifications/types";
import { emailPlain, wrapEmailHtml } from "@/lib/notifications/templates";
import { escapeHtml } from "@/lib/notifications/escape";
import { notifyEvent } from "@/lib/notifications/service";
import { listMembershipsForOrg } from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries";

function appUrl(path: string) {
  const base = getEnv().APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

async function supervisorsForOrg(organizationId: string) {
  const memberships = await listMembershipsForOrg(organizationId);
  return memberships.filter((m) => m.role === "owner" || m.role === "manager").map((m) => m.userId);
}

export async function notifyJobSubmitted(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const recipients = await supervisorsForOrg(input.organizationId);
  const link = appUrl(`/app/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.jobSubmitted,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    jobId: input.jobId,
    title: "Job submitted for review",
    body: `${input.jobTitle} is ready for quality review.`,
    linkPath: `/app/jobs/${input.jobId}`,
    emailSubject: `[${company}] Job submitted: ${input.jobTitle}`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Job submitted for review",
      bodyHtml: `<p>${escapeHtml(input.jobTitle)} has been submitted and awaits supervisor review.</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Job submitted for review", `${input.jobTitle} awaits review.`, link),
  });
}

export async function notifyJobApproved(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  assigneeUserId?: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const recipients = input.assigneeUserId ? [input.assigneeUserId] : [];
  if (recipients.length === 0) return;
  const link = appUrl(`/field/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.jobApproved,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    jobId: input.jobId,
    title: "Job approved",
    body: `${input.jobTitle} was approved.`,
    linkPath: `/field/jobs/${input.jobId}`,
    emailSubject: `[${company}] Approved: ${input.jobTitle}`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Job approved",
      bodyHtml: `<p>Your work on <strong>${escapeHtml(input.jobTitle)}</strong> has been approved.</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Job approved", input.jobTitle, link),
  });
}

export async function notifyClarification(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  assigneeUserId: string;
  reason: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/field/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.clarificationRequested,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    jobId: input.jobId,
    title: "Clarification requested",
    body: input.reason,
    linkPath: `/field/jobs/${input.jobId}`,
    emailSubject: `[${company}] Clarification needed: ${input.jobTitle}`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Clarification requested",
      bodyHtml: `<p>${escapeHtml(input.reason)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Clarification requested", input.reason, link),
  });
}

export async function notifyJobRejected(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  assigneeUserId: string;
  reason: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/field/today`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.jobRejected,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    jobId: input.jobId,
    title: "Job rejected — re-clean required",
    body: input.reason,
    linkPath: `/field/today`,
    emailSubject: `[${company}] Re-clean required`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Re-clean required",
      bodyHtml: `<p>${escapeHtml(input.reason)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Re-clean required", input.reason, link),
  });
}

export async function notifyRecleanAssigned(input: {
  organizationId: string;
  recleanJobId: string;
  jobTitle: string;
  assigneeUserId: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/field/jobs/${input.recleanJobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.recleanAssigned,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    jobId: input.recleanJobId,
    title: "Re-clean assigned",
    body: jobTitleBody(input.jobTitle),
    linkPath: `/field/jobs/${input.recleanJobId}`,
    emailSubject: `[${company}] Re-clean assigned`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Re-clean assigned to you",
      bodyHtml: `<p>${escapeHtml(input.jobTitle)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Re-clean assigned", input.jobTitle, link),
  });
}

function jobTitleBody(title: string) {
  return title;
}

export async function notifyRecleanAwaitingReview(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  idempotencyKey: string;
}) {
  const recipients = await supervisorsForOrg(input.organizationId);
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/app/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.recleanAwaitingReview,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    jobId: input.jobId,
    title: "Re-clean awaiting review",
    body: input.jobTitle,
    linkPath: `/app/jobs/${input.jobId}`,
    emailSubject: `[${company}] Re-clean ready for review`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Re-clean submitted",
      bodyHtml: `<p>${escapeHtml(input.jobTitle)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Re-clean awaiting review", input.jobTitle, link),
  });
}

export async function notifyComplaintCreated(input: {
  organizationId: string;
  issueId: string;
  title: string;
  idempotencyKey: string;
}) {
  const recipients = await supervisorsForOrg(input.organizationId);
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/app/issues/${input.issueId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.complaintCreated,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    issueId: input.issueId,
    title: "Customer complaint logged",
    body: input.title,
    linkPath: `/app/issues/${input.issueId}`,
    emailSubject: `[${company}] New complaint`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Customer complaint",
      bodyHtml: `<p>${escapeHtml(input.title)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Customer complaint", input.title, link),
  });
}

export async function notifyReportPublished(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  idempotencyKey: string;
}) {
  const recipients = await supervisorsForOrg(input.organizationId);
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const tz = branding?.org.timeZone ?? "Europe/London";
  const when = formatOrgDate(new Date().toISOString(), tz, branding?.branding.dateFormat);
  const link = appUrl(`/app/reports`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.reportPublished,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    jobId: input.jobId,
    title: "Client report published",
    body: `${input.jobTitle} — ${when}`,
    linkPath: `/app/reports`,
    emailSubject: `[${company}] Report published`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Completion report published",
      bodyHtml: `<p>Share link created for ${escapeHtml(input.jobTitle)}.</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Report published", input.jobTitle, link),
  });
}

export async function notifyJobAssigned(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  assigneeUserId: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/field/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.jobAssigned,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    jobId: input.jobId,
    title: "New job assigned",
    body: input.jobTitle,
    linkPath: `/field/jobs/${input.jobId}`,
    emailSubject: `[${company}] Job assigned: ${input.jobTitle}`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "You have a new job",
      bodyHtml: `<p>${escapeHtml(input.jobTitle)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Job assigned", input.jobTitle, link),
  });
}

export async function notifyJobScheduleChanged(input: {
  organizationId: string;
  jobId: string;
  jobTitle: string;
  assigneeUserId: string;
  newStartAt: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const when = formatOrgDate(input.newStartAt, branding?.org.timeZone ?? "Europe/London", branding?.branding.dateFormat);
  const link = appUrl(`/field/jobs/${input.jobId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.jobScheduleChanged,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    jobId: input.jobId,
    title: "Job schedule updated",
    body: `${input.jobTitle} — new time ${when}`,
    linkPath: `/field/jobs/${input.jobId}`,
    emailSubject: `[${company}] Schedule change: ${input.jobTitle}`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Schedule updated",
      bodyHtml: `<p>${escapeHtml(input.jobTitle)} is now scheduled for ${escapeHtml(when)}.</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Schedule updated", `${input.jobTitle} — ${when}`, link),
  });
}

export async function notifyIssueOverdue(input: {
  organizationId: string;
  issueId: string;
  issueTitle: string;
  assigneeUserId?: string;
  idempotencyKey: string;
}) {
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const supervisors = await supervisorsForOrg(input.organizationId);
  const recipients = [...new Set([...(input.assigneeUserId ? [input.assigneeUserId] : []), ...supervisors])];
  const link = appUrl(`/app/issues/${input.issueId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.issueOverdue,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    issueId: input.issueId,
    title: "Issue overdue",
    body: input.issueTitle,
    linkPath: `/app/issues/${input.issueId}`,
    emailSubject: `[${company}] Overdue issue`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Issue overdue",
      bodyHtml: `<p>${escapeHtml(input.issueTitle)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Issue overdue", input.issueTitle, link),
  });
}

export async function notifyComplaintAssigned(input: {
  organizationId: string;
  issueId: string;
  assigneeUserId: string;
  title: string;
  idempotencyKey: string;
}) {
  const user = await getUserById(input.assigneeUserId);
  if (!user) return;
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl(`/app/issues/${input.issueId}`);
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: NOTIFICATION_EVENTS.complaintAssigned,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: [input.assigneeUserId],
    issueId: input.issueId,
    title: "Complaint assigned to you",
    body: input.title,
    linkPath: `/app/issues/${input.issueId}`,
    emailSubject: `[${company}] Complaint assigned`,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: "Complaint assigned",
      bodyHtml: `<p>${escapeHtml(input.title)}</p>`,
      actionUrl: link,
    }),
    emailText: emailPlain("Complaint assigned", input.title, link),
  });
}
