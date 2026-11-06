export const NOTIFICATION_EVENTS = {
  jobAssigned: "job.assigned",
  jobScheduleChanged: "job.schedule_changed",
  jobSubmitted: "job.submitted",
  clarificationRequested: "job.clarification_requested",
  jobRejected: "job.rejected",
  recleanAssigned: "job.reclean_assigned",
  recleanAwaitingReview: "job.reclean_awaiting_review",
  jobApproved: "job.approved",
  complaintCreated: "complaint.created",
  complaintAssigned: "complaint.assigned",
  issueOverdue: "issue.overdue",
  reportPublished: "report.published",
  billingTrialEndingSoon: "billing.trial_ending_soon",
  billingTrialExpired: "billing.trial_expired",
  billingPlanActivated: "billing.plan_activated",
  billingUpgradeSuccess: "billing.upgrade_success",
  billingDowngradeScheduled: "billing.downgrade_scheduled",
  billingSubscriptionCanceled: "billing.subscription_canceled",
  billingSubscriptionReactivated: "billing.subscription_reactivated",
  billingPaymentFailed: "billing.payment_failed",
  billingRenewalSuccess: "billing.renewal_success",
  billingUsageLimitApproaching: "billing.usage_limit_approaching",
} as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

export type NotifyInput = {
  organizationId: string;
  eventType: NotificationEventType;
  idempotencyKey: string;
  recipientUserIds: string[];
  title: string;
  body: string;
  linkPath?: string;
  jobId?: string;
  issueId?: string;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
};
