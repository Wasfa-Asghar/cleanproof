import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_EVENTS } from "@/lib/notifications/types";
import { saveNotificationPreferenceAction } from "@/lib/notifications/actions";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Notification preferences" };

const LABELS: Record<string, string> = {
  [NOTIFICATION_EVENTS.jobSubmitted]: "Job submitted for review",
  [NOTIFICATION_EVENTS.jobApproved]: "Job approved",
  [NOTIFICATION_EVENTS.clarificationRequested]: "Clarification requested",
  [NOTIFICATION_EVENTS.jobRejected]: "Job rejected",
  [NOTIFICATION_EVENTS.recleanAssigned]: "Re-clean assigned",
  [NOTIFICATION_EVENTS.recleanAwaitingReview]: "Re-clean awaiting review",
  [NOTIFICATION_EVENTS.complaintCreated]: "Customer complaint created",
  [NOTIFICATION_EVENTS.complaintAssigned]: "Complaint assigned",
  [NOTIFICATION_EVENTS.reportPublished]: "Client report published",
  [NOTIFICATION_EVENTS.jobAssigned]: "Job assigned",
  [NOTIFICATION_EVENTS.jobScheduleChanged]: "Job schedule changed",
  [NOTIFICATION_EVENTS.issueOverdue]: "Issue overdue",
};

export default async function NotificationSettingsPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <>
      <PageHeader title="Notification preferences" description="Control email and in-app alerts for workflow events." />
      <ul className="space-y-3">
        {Object.entries(LABELS).map(([eventType, label]) => (
          <li key={eventType} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-medium">{label}</p>
            <form action={saveNotificationPreferenceAction} className="mt-2 flex flex-wrap gap-4 text-sm">
              <input type="hidden" name="eventType" value={eventType} />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="emailEnabled" defaultChecked />
                Email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="inAppEnabled" defaultChecked />
                In-app
              </label>
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
