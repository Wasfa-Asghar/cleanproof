import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  checklistTemplateVersions,
  checklistTemplates,
  clients,
  issues,
  jobItemResults,
  jobs,
  memberships,
  organizations,
  reportShares,
  reviews,
  sites,
  subscriptions,
  templateItems,
  users,
} from "../src/db/schema";
import { hashToken } from "../src/lib/crypto/tokens";

const DEMO_REPORT_TOKEN = "demo-client-report-token";

async function ensureDemoReportJobApproved(db: ReturnType<typeof getDb>) {
  const tokenHash = hashToken(DEMO_REPORT_TOKEN);
  let [share] = await db
    .select()
    .from(reportShares)
    .where(eq(reportShares.tokenHash, tokenHash))
    .limit(1);

  const [owner] = await db.select().from(users).where(eq(users.email, "owner@demo.cleanproof.app")).limit(1);
  if (!owner) return;
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, owner.id))
    .limit(1);
  if (!membership) return;

  if (!share) {
    const [jobRow] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.organizationId, membership.organizationId))
      .limit(1);
    if (!jobRow) return;
    [share] = await db
      .insert(reportShares)
      .values({
        organizationId: membership.organizationId,
        jobId: jobRow.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      })
      .returning();
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, share.jobId)).limit(1);
  if (!job) return;
  if (job.status === "approved") return;
  const [manager] = await db
    .select()
    .from(users)
    .where(eq(users.email, "manager@demo.cleanproof.app"))
    .limit(1);
  if (!manager) return;
  await db.update(jobs).set({ status: "approved" }).where(eq(jobs.id, job.id));
  const existingReview = await db.select().from(reviews).where(eq(reviews.jobId, job.id)).limit(1);
  if (existingReview.length === 0) {
    await db.insert(reviews).values({
      organizationId: job.organizationId,
      jobId: job.id,
      reviewerId: manager.id,
      verdict: "approved",
      notes: "Demo client-visible approval note.",
      idempotencyKey: `demo-report:${job.id}`,
      reviewedAt: new Date(),
    });
  }
}

export async function seedDemoOrganisation() {
  const db = getDb();
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const existing = await db.select().from(users).where(eq(users.email, "owner@demo.cleanproof.app")).limit(1);
  if (existing.length > 0) {
    await ensureDemoReportJobApproved(db);
    console.log("Demo organisation already seeded — ensured client report job is approved.");
    return;
  }

  const [org] = await db
    .insert(organizations)
    .values({
      legalName: "Sparkle Commercial Cleaning Ltd",
      displayName: "Sparkle Commercial",
      region: "UK",
      currency: "GBP",
      timeZone: "Europe/London",
    })
    .returning();

  const [owner] = await db
    .insert(users)
    .values({ email: "owner@demo.cleanproof.app", passwordHash, name: "Alex Owner" })
    .returning();
  const [manager] = await db
    .insert(users)
    .values({ email: "manager@demo.cleanproof.app", passwordHash, name: "Sam Supervisor" })
    .returning();
  const [cleaner] = await db
    .insert(users)
    .values({ email: "cleaner@demo.cleanproof.app", passwordHash, name: "Jordan Cleaner" })
    .returning();

  await db.insert(memberships).values([
    { organizationId: org.id, userId: owner.id, role: "owner", status: "active" },
    { organizationId: org.id, userId: manager.id, role: "manager", status: "active" },
    { organizationId: org.id, userId: cleaner.id, role: "cleaner", status: "active" },
  ]);

  const { startTrialForOrganization } = await import("../src/lib/billing/subscription-service");
  await startTrialForOrganization(org.id);
  await db
    .update(subscriptions)
    .set({ plan: "growth" })
    .where(eq(subscriptions.organizationId, org.id));

  const [client] = await db
    .insert(clients)
    .values({
      organizationId: org.id,
      displayName: "Harbour Office Group",
      contactsJson: [{ name: "Priya Shah", email: "facilities@harbour.example" }],
    })
    .returning();

  const [siteA] = await db
    .insert(sites)
    .values({
      organizationId: org.id,
      clientId: client.id,
      name: "Harbour Tower — Floor 3",
      addressLine1: "12 Quayside",
      city: "Newcastle",
      postcode: "NE1 3DX",
      country: "GB",
      timeZone: "Europe/London",
      instructions: "Collect keys from reception. Alarm code in secure note (manager only).",
      accessSensitivity: "restricted",
    })
    .returning();

  await db.insert(sites).values({
    organizationId: org.id,
    clientId: client.id,
    name: "Harbour Annex",
    addressLine1: "14 Quayside",
    city: "Newcastle",
    postcode: "NE1 3DY",
    country: "GB",
    timeZone: "Europe/London",
    instructions: "Staff entrance on side alley.",
    accessSensitivity: "standard",
  });

  const [template] = await db
    .insert(checklistTemplates)
    .values({ organizationId: org.id, name: "Office nightly clean", status: "published" })
    .returning();

  const [version] = await db
    .insert(checklistTemplateVersions)
    .values({ templateId: template.id, version: 1 })
    .returning();

  const itemDefs = [
    { section: "Reception", label: "Vacuum and mop entrance", required: true, evidencePolicy: "optional" },
    { section: "Reception", label: "Wipe reception desk", required: true, evidencePolicy: "none" },
    { section: "Restrooms", label: "Sanitise fixtures", required: true, evidencePolicy: "required" },
    { section: "Kitchen", label: "Empty bins", required: true, evidencePolicy: "optional" },
    { section: "Close-out", label: "Lock up confirmed", required: true, evidencePolicy: "none" },
  ];

  const items = await db
    .insert(templateItems)
    .values(
      itemDefs.map((item, i) => ({
        templateVersionId: version.id,
        section: item.section,
        label: item.label,
        taskType: "checkbox",
        required: item.required,
        evidencePolicy: item.evidencePolicy,
        sortOrder: i,
      })),
    )
    .returning();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [job1] = await db
    .insert(jobs)
    .values({
      organizationId: org.id,
      siteId: siteA.id,
      templateVersionId: version.id,
      title: "Nightly office clean",
      startAt: now,
      status: "needs_review",
      assignedUserId: cleaner.id,
    })
    .returning();

  await db.insert(jobs).values({
    organizationId: org.id,
    siteId: siteA.id,
    templateVersionId: version.id,
    title: "Weekly deep clean",
    startAt: tomorrow,
    status: "assigned",
    assignedUserId: cleaner.id,
  });

  await db.insert(issues).values({
    organizationId: org.id,
    siteId: siteA.id,
    jobId: job1.id,
    title: "Restroom sanitiser missed on last visit",
    category: "quality",
    severity: "medium",
    status: "open",
    assigneeId: manager.id,
    dueAt: tomorrow,
  });

  await db.insert(reviews).values({
    organizationId: org.id,
    jobId: job1.id,
    reviewerId: manager.id,
    verdict: "approved",
    notes: "Demo client-visible approval note.",
    idempotencyKey: `demo-report:${job1.id}`,
    reviewedAt: now,
  });
  await db.update(jobs).set({ status: "approved" }).where(eq(jobs.id, job1.id));

  await db.insert(reportShares).values({
    organizationId: org.id,
    jobId: job1.id,
    tokenHash: hashToken(DEMO_REPORT_TOKEN),
    expiresAt: new Date(now.getTime() + 30 * 86400000),
  });

  for (const item of items.slice(0, 3)) {
    await db.insert(jobItemResults).values({
      jobId: job1.id,
      itemId: item.id,
      result: "pass",
      submittedAt: now,
    });
  }

  console.log("Demo organisation seeded.");
  console.log("Demo report URL token (dev only):", DEMO_REPORT_TOKEN);
}
