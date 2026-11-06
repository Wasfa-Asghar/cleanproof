import { getEnv } from "@/lib/env";
import { listMembershipsForOrg } from "@/lib/db/queries";
import { NOTIFICATION_EVENTS } from "@/lib/notifications/types";
import { emailPlain, wrapEmailHtml } from "@/lib/notifications/templates";
import { escapeHtml } from "@/lib/notifications/escape";
import { notifyEvent } from "@/lib/notifications/service";
import { formatPlanPrice, getPlan, type PlanId } from "@/lib/billing/plans";
import { getOrgBranding } from "@/lib/org/settings";

function appUrl(path: string) {
  const base = getEnv().APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

async function ownerRecipients(organizationId: string) {
  const memberships = await listMembershipsForOrg(organizationId);
  return memberships.filter((m) => m.role === "owner").map((m) => m.userId);
}

async function notifyOwners(input: {
  organizationId: string;
  eventType: (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];
  idempotencyKey: string;
  title: string;
  body: string;
  emailSubject: string;
  emailHtmlBody: string;
}) {
  const recipients = await ownerRecipients(input.organizationId);
  if (recipients.length === 0) return;
  const branding = await getOrgBranding(input.organizationId);
  const company = branding?.org.displayName ?? "CleanProof";
  const link = appUrl("/app/settings/billing");
  await notifyEvent({
    organizationId: input.organizationId,
    eventType: input.eventType,
    idempotencyKey: input.idempotencyKey,
    recipientUserIds: recipients,
    title: input.title,
    body: input.body,
    linkPath: "/app/settings/billing",
    emailSubject: input.emailSubject,
    emailHtml: wrapEmailHtml({
      companyName: company,
      title: input.title,
      bodyHtml: input.emailHtmlBody,
      actionUrl: link,
    }),
    emailText: emailPlain(input.title, input.body, link),
  });
}

export async function notifyBillingTrialEndingSoon(organizationId: string, daysLeft: number) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingTrialEndingSoon,
    idempotencyKey: `billing:trial-ending:${organizationId}:${daysLeft}`,
    title: "Trial ending soon",
    body: `Your CleanProof trial ends in ${daysLeft} day(s). Choose a plan to keep full access.`,
    emailSubject: "Trial ending soon",
    emailHtmlBody: `<p>Your trial ends in <strong>${daysLeft}</strong> day(s). Select a plan on the billing page.</p>`,
  });
}

export async function notifyBillingTrialExpired(organizationId: string) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingTrialExpired,
    idempotencyKey: `billing:trial-expired:${organizationId}`,
    title: "Trial ended",
    body: "Your trial has ended. You can still view and export data; upgrade to create new jobs and sites.",
    emailSubject: "Trial ended",
    emailHtmlBody: `<p>Your trial has ended. Upgrade to restore full access to billable features.</p>`,
  });
}

export async function notifyBillingPlanActivated(organizationId: string, planId: PlanId) {
  const plan = getPlan(planId);
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingPlanActivated,
    idempotencyKey: `billing:activated:${organizationId}:${planId}`,
    title: "Subscription active",
    body: `${plan.name} (${formatPlanPrice(plan)}/mo) is now active.`,
    emailSubject: "Subscription activated",
    emailHtmlBody: `<p>Your <strong>${escapeHtml(plan.name)}</strong> plan is active.</p>`,
  });
}

export async function notifyBillingPaymentFailed(organizationId: string) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingPaymentFailed,
    idempotencyKey: `billing:payment-failed:${organizationId}:${new Date().toISOString().slice(0, 10)}`,
    title: "Payment failed",
    body: "A simulated payment failed. Update billing or retry checkout.",
    emailSubject: "Payment failed",
    emailHtmlBody: `<p>We could not process your payment. Please retry from the billing page.</p>`,
  });
}

export async function notifyBillingDowngradeScheduled(organizationId: string, planId: PlanId, effectiveAt: Date) {
  const plan = getPlan(planId);
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingDowngradeScheduled,
    idempotencyKey: `billing:downgrade:${organizationId}:${planId}:${effectiveAt.toISOString()}`,
    title: "Downgrade scheduled",
    body: `Your plan will change to ${plan.name} on ${effectiveAt.toLocaleDateString("en-GB")}.`,
    emailSubject: "Downgrade scheduled",
    emailHtmlBody: `<p>Scheduled change to <strong>${escapeHtml(plan.name)}</strong>.</p>`,
  });
}

export async function notifyBillingCanceled(organizationId: string, atPeriodEnd: boolean) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingSubscriptionCanceled,
    idempotencyKey: `billing:cancel:${organizationId}:${atPeriodEnd}`,
    title: "Subscription cancellation",
    body: atPeriodEnd
      ? "Your subscription will cancel at the end of the current billing period."
      : "Your subscription has been canceled.",
    emailSubject: "Subscription canceled",
    emailHtmlBody: `<p>Cancellation ${atPeriodEnd ? "scheduled at period end" : "recorded"}.</p>`,
  });
}

export async function notifyBillingReactivated(organizationId: string) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingSubscriptionReactivated,
    idempotencyKey: `billing:reactivate:${organizationId}:${Date.now()}`,
    title: "Subscription reactivated",
    body: "Your subscription cancellation was removed.",
    emailSubject: "Subscription reactivated",
    emailHtmlBody: `<p>Your subscription will continue renewing.</p>`,
  });
}

export async function notifyBillingRenewalSuccess(organizationId: string) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingRenewalSuccess,
    idempotencyKey: `billing:renewal:${organizationId}:${new Date().toISOString().slice(0, 7)}`,
    title: "Subscription renewed",
    body: "Your subscription renewed successfully (simulated).",
    emailSubject: "Subscription renewed",
    emailHtmlBody: `<p>Renewal processed successfully.</p>`,
  });
}

export async function notifyBillingUsageApproaching(
  organizationId: string,
  resource: "jobs" | "sites" | "cleaners",
  percent: number,
) {
  await notifyOwners({
    organizationId,
    eventType: NOTIFICATION_EVENTS.billingUsageLimitApproaching,
    idempotencyKey: `billing:usage:${organizationId}:${resource}:${percent}`,
    title: "Usage limit approaching",
    body: `You have used ${percent}% of your ${resource} allowance this period.`,
    emailSubject: "Usage limit approaching",
    emailHtmlBody: `<p>Approaching limit for <strong>${escapeHtml(resource)}</strong>.</p>`,
  });
}
