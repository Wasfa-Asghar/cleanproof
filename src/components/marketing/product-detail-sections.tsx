import { ProductDetailScroller, type ProductDetailStep } from "@/components/marketing/product-detail-scroller";
import type { ProductScreenshotKey } from "@/lib/marketing/image-manifest";

type SectionPair = readonly [ProductDetailStep, ProductDetailStep];

export const FEATURE_DETAILS: Record<string, SectionPair> = {
  "cleaning-checklists": [
    {
      title: "Start with one site",
      body: "Pick a recurring visit and write one checklist item per area. Publish the template before scheduling the next visit so the cleaner receives the current instructions.",
      points: [
        "Keep each item tied to a real area on site, not a vague reminder.",
        "Publish once so every assigned visit uses the same current template.",
        "Supervisors can see which tasks were completed or excepted on the job record.",
      ],
    },
    {
      title: "Review exceptions at handover",
      body: "Ask the cleaner to record a reason when a task cannot be completed. The supervisor can review that reason alongside the submitted checklist and evidence.",
      points: [
        "Exceptions stay attached to the same visit, not lost in chat threads.",
        "Reviewers open answers, notes, and photos together before approving.",
        "Clarifications and follow-up work remain visible on the job timeline.",
      ],
    },
  ],
  "photo-evidence": [
    {
      title: "Decide what needs a photo",
      body: "Use before and after photos for work that is hard to judge from a tick alone. Give cleaners a clear instruction about the area and angle to capture.",
      points: [
        "Capture evidence on the visit itself, not in a separate gallery.",
        "Tell cleaners which areas need before and after shots.",
        "Photos feed the same job record supervisors and clients rely on.",
      ],
    },
    {
      title: "Review the evidence with the job",
      body: "Open the submitted visit and check that the photos match the task and site. Request clarification if the reviewer needs more detail.",
      points: [
        "Compare checklist answers and photos in one review pass.",
        "Send work back with a clear note when evidence is incomplete.",
        "Approved visits carry the evidence into client-facing reports.",
      ],
    },
  ],
  "quality-inspections": [
    {
      title: "Set a review routine",
      body: "Give supervisors a regular time to check the quality queue. Open each submission to compare its checklist answers, notes and photos.",
      points: [
        "Submitted jobs land in one queue instead of scattered messages.",
        "Compare checklist answers, notes, and photos on the same visit.",
        "Approve only when the record is complete enough to stand behind.",
      ],
    },
    {
      title: "Explain the next action",
      body: "When a submission needs work, describe the specific task or evidence the cleaner should revisit. Keep the instruction on the job record for the next review.",
      points: [
        "Clarification and rejection reasons stay on the job timeline.",
        "Cleaners see the next action in the field workspace, not only by message.",
        "The next review starts from the same structured visit record.",
      ],
    },
  ],
  "reclean-management": [
    {
      title: "Give the re-clean a clear scope",
      body: "Identify the affected area and the expected result. Use that scope to assign corrective work the cleaner can complete and document.",
      points: [
        "Link the corrective visit to the original rejection or issue.",
        "Give cleaners a defined area and outcome, not a vague redo.",
        "Keep ownership visible so the follow-up does not disappear.",
      ],
    },
    {
      title: "Verify the corrective visit",
      body: "Review the linked re-clean record alongside the original issue to confirm the follow-up addressed the reported problem.",
      points: [
        "Open the linked job to compare original and corrective evidence.",
        "Approve only when the re-clean closes the reported gap.",
        "Leave a trail supervisors and clients can follow later.",
      ],
    },
  ],
  "complaint-management": [
    {
      title: "Record the client’s concern",
      body: "Capture the site, the affected area and what the client observed. Link the relevant visit when you can identify it.",
      points: [
        "Keep the complaint tied to a site and visit context.",
        "Capture what was observed so follow-up is specific.",
        "Link related work so the team is not reconstructing from memory.",
      ],
    },
    {
      title: "Keep the resolution traceable",
      body: "Use the issue record to track the response. If a re-clean is needed, link the corrective job so the team can find its result later.",
      points: [
        "Move statuses from open through resolved on one record.",
        "Link re-cleans when corrective work is required.",
        "Show what changed when a client asks what happened next.",
      ],
    },
  ],
  "client-reports": [
    {
      title: "Check the report before sharing",
      body: "Open the approved report and confirm the site, visit date and evidence are appropriate for the recipient.",
      points: [
        "Only approved jobs feed the shared completion view.",
        "Confirm site, date, and evidence before the client sees them.",
        "Keep internal notes out of the client-facing record.",
      ],
    },
    {
      title: "Share a record for that visit",
      body: "Send the report link to the intended client contact so they can open the completion view for the approved job.",
      points: [
        "Clients open a read-only view from a secure token link.",
        "No staff dashboard login is required for the recipient.",
        "PDF download remains available when a handover pack is needed.",
      ],
    },
  ],
  "offline-field-workflow": [
    {
      title: "Prepare before entering a low-signal site",
      body: "Open the assigned job while connected so the field workspace can load the visit and its checklist.",
      points: [
        "Load the visit and checklist before signal drops.",
        "Queue checklist edits and photo uploads locally when offline.",
        "Keep work attached to the same job record for later sync.",
      ],
    },
    {
      title: "Confirm pending work has synced",
      body: "After reconnecting, check the status of pending changes and uploads before assuming the supervisor can review the visit.",
      points: [
        "Sync pending checklist answers and photos when back online.",
        "Confirm uploads finished before expecting supervisor review.",
        "Avoid handing over a visit that still has pending field changes.",
      ],
    },
  ],
  "team-management": [
    {
      title: "Match access to responsibilities",
      body: "Choose the role that matches the person’s work. Assign field visits to cleaners and route submitted jobs to supervisors for review.",
      points: [
        "Owners, managers, and cleaners get purpose-built workspaces.",
        "Organisation-scoped data keeps teams separated.",
        "Route submitted work to the people who should review it.",
      ],
    },
    {
      title: "Check the first assignment",
      body: "After inviting a cleaner, assign a visit and confirm they can see the job and its checklist in the field workspace.",
      points: [
        "Confirm the cleaner can open the assigned visit.",
        "Verify the checklist and photo steps appear as expected.",
        "Catch access issues before the first live contract night.",
      ],
    },
  ],
  "quality-analytics": [
    {
      title: "Review a consistent time window",
      body: "Use comparable periods when looking for changes in completion and quality. Check the underlying jobs for context before acting on a trend.",
      points: [
        "Compare like-for-like periods before calling a trend.",
        "Open the underlying visits when a metric looks off.",
        "Ground decisions in the same job records your team creates daily.",
      ],
    },
    {
      title: "Turn patterns into a follow-up",
      body: "If the same area repeatedly needs attention, review the visit records and decide whether the checklist or site instructions need updating.",
      points: [
        "Spot repeat issues by site or area across visits.",
        "Update templates or instructions when the pattern is clear.",
        "Close the loop with a concrete operational change.",
      ],
    },
  ],
};

export function ProductDetailSections({
  sections,
  screenshots,
}: {
  sections?: SectionPair;
  screenshots?: readonly [ProductScreenshotKey, ProductScreenshotKey];
}) {
  if (!sections) return null;

  if (screenshots) {
    return <ProductDetailScroller steps={sections} screenshots={screenshots} />;
  }

  return sections.map(({ title, body, points }) => (
    <section key={title} className="border-t border-[var(--cp-border)] py-10 sm:py-12">
      <div className="mx-auto grid max-w-[1216px] gap-3 px-4 md:grid-cols-2 md:gap-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--cp-navy)]">{title}</h2>
        <div>
          <p className="max-w-xl leading-relaxed text-[var(--cp-muted)]">{body}</p>
          {points?.length ? (
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--cp-navy)]">
              {points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-[var(--cp-teal)]" aria-hidden>
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  ));
}
