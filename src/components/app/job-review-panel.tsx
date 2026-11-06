"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addJobInternalNoteAction,
  approveJobReviewAction,
  clarificationReviewAction,
  rejectJobReviewAction,
} from "@/lib/jobs/review-actions";

type TeamMember = { id: string; name: string };

type Props = {
  jobId: string;
  canReview: boolean;
  status: string;
  team: TeamMember[];
  defaultAssigneeId?: string;
};

export function JobReviewPanel({ jobId, canReview, status, team, defaultAssigneeId }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  if (!canReview || status !== "needs_review") return null;

  return (
    <section className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Quality review</h2>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <form
        className="flex flex-wrap gap-2"
        action={async (fd) => {
          fd.set("jobId", jobId);
          fd.set("idempotencyKey", idempotencyKey);
          await approveJobReviewAction(fd);
          setMessage("Job approved.");
        }}
      >
        <label className="w-full text-sm">
          Internal notes (optional)
          <textarea name="internalNotes" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
        </label>
        <Button type="submit">Approve</Button>
      </form>

      <form
        className="space-y-2 border-t border-slate-100 pt-4"
        action={async (fd) => {
          fd.set("jobId", jobId);
          fd.set("idempotencyKey", idempotencyKey);
          await clarificationReviewAction(fd);
          setMessage("Clarification sent to cleaner.");
        }}
      >
        <p className="text-sm font-medium">Request clarification</p>
        <textarea
          name="reason"
          required
          rows={2}
          placeholder="What must the cleaner clarify or fix?"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />
        <Button type="submit" variant="secondary">
          Send back to cleaner
        </Button>
      </form>

      <form
        className="space-y-2 border-t border-slate-100 pt-4"
        action={async (fd) => {
          fd.set("jobId", jobId);
          fd.set("idempotencyKey", idempotencyKey);
          await rejectJobReviewAction(fd);
          setMessage("Job rejected — re-clean assigned.");
        }}
      >
        <p className="text-sm font-medium">Reject and assign re-clean</p>
        <textarea
          name="reason"
          required
          rows={2}
          placeholder="Reason for rejection"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />
        <label className="block text-sm">
          Assign cleaner
          <select
            name="assigneeId"
            required
            defaultValue={defaultAssigneeId ?? team[0]?.id}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary">
          Reject &amp; create re-clean
        </Button>
      </form>

      <form
        className="border-t border-slate-100 pt-4"
        action={async (fd) => {
          fd.set("jobId", jobId);
          await addJobInternalNoteAction(fd);
          setMessage("Internal note saved to audit log.");
        }}
      >
        <p className="text-sm font-medium">Add internal note</p>
        <textarea name="note" required rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" />
        <Button type="submit" variant="secondary" className="mt-2">
          Save note
        </Button>
      </form>
    </section>
  );
}
