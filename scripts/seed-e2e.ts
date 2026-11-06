/**
 * Deterministic E2E seed into PGLITE_DATA_DIR (default .data/pglite-e2e).
 * Does not touch .data/pglite developer database.
 */
import fs from "fs";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import path from "path";
import { migrate } from "drizzle-orm/pglite/migrator";
import { getDb, closeDb } from "@/db";
import {
  checklistTemplateVersions,
  checklistTemplates,
  clients,
  evidence,
  issues,
  jobItemResults,
  jobs,
  memberships,
  organizations,
  reportShares,
  sites,
  subscriptions,
  templateItems,
  users,
} from "@/db/schema";
import { hashToken } from "@/lib/crypto/tokens";
import { ISSUE_CATEGORIES } from "@/lib/issues/categories";
import { getStorageAdapter } from "@/lib/storage";

export const E2E_PASSWORD = "E2eTest1234!";
export const E2E_REPORT_TOKEN = "e2e-client-report-token";

export const E2E_ORG_A = {
  owner: "owner@e2e.cleanproof.test",
  manager: "manager@e2e.cleanproof.test",
  cleaner: "cleaner@e2e.cleanproof.test",
};

export const E2E_ORG_B = {
  owner: "owner@e2b.cleanproof.test",
};

async function seedOrgA(db: ReturnType<typeof getDb>, passwordHash: string) {
  const existing = await db.select().from(users).where(eq(users.email, E2E_ORG_A.owner)).limit(1);
  if (existing.length > 0) return;

  const [org] = await db
    .insert(organizations)
    .values({
      legalName: "E2E Primary Cleaning Ltd",
      displayName: "E2E Primary",
      region: "UK",
      currency: "GBP",
      timeZone: "Europe/London",
    })
    .returning();

  const [owner] = await db
    .insert(users)
    .values({ email: E2E_ORG_A.owner, passwordHash, name: "E2E Owner" })
    .returning();
  const [manager] = await db
    .insert(users)
    .values({ email: E2E_ORG_A.manager, passwordHash, name: "E2E Manager" })
    .returning();
  const [cleaner] = await db
    .insert(users)
    .values({ email: E2E_ORG_A.cleaner, passwordHash, name: "E2E Cleaner" })
    .returning();

  await db.insert(memberships).values([
    { organizationId: org.id, userId: owner.id, role: "owner", status: "active" },
    { organizationId: org.id, userId: manager.id, role: "manager", status: "active" },
    { organizationId: org.id, userId: cleaner.id, role: "cleaner", status: "active" },
  ]);

  const trialStart = new Date();
  const trialEnd = addDays(trialStart, 14);
  await db.insert(subscriptions).values({
    organizationId: org.id,
    plan: "starter",
    status: "trialing",
    trialStartsAt: trialStart,
    trialEndsAt: trialEnd,
    currentPeriodStart: trialStart,
    currentPeriodEnd: trialEnd,
  });

  const [client] = await db
    .insert(clients)
    .values({
      organizationId: org.id,
      displayName: "E2E Client Co",
      contactsJson: [{ name: "Contact", email: "contact@e2e.test" }],
    })
    .returning();

  const [site] = await db.insert(sites).values({
    organizationId: org.id,
    clientId: client.id,
    name: "E2E Main Site",
    addressLine1: "1 Test Lane",
    city: "London",
    postcode: "E1 1AA",
    country: "GB",
    timeZone: "Europe/London",
    instructions: "E2E access notes",
    accessSensitivity: "standard",
  }).returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({ organizationId: org.id, name: "E2E checklist", status: "published" })
    .returning();
  const [version] = await db
    .insert(checklistTemplateVersions)
    .values({ templateId: template.id, version: 1 })
    .returning();
  const templateItemRows = await db
    .insert(templateItems)
    .values([
      {
        templateVersionId: version.id,
        section: "General",
        label: "Vacuum floors",
        taskType: "checkbox",
        required: true,
        evidencePolicy: "none",
        sortOrder: 0,
      },
      {
        templateVersionId: version.id,
        section: "General",
        label: "Sanitise surfaces",
        taskType: "checkbox",
        required: true,
        evidencePolicy: "none",
        sortOrder: 1,
      },
    ])
    .returning();
  const vacuumItemId = templateItemRows.find((r) => r.label === "Vacuum floors")?.id;
  const sanitiseItemId = templateItemRows.find((r) => r.label === "Sanitise surfaces")?.id;
  if (!vacuumItemId || !sanitiseItemId) {
    throw new Error("E2E seed: template items missing");
  }

  const startAt = new Date();
  startAt.setMinutes(0, 0, 0);
  await db.insert(jobs).values([
    {
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E lifecycle job",
      startAt,
      status: "assigned",
      assignedUserId: cleaner.id,
    },
    {
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E offline job",
      startAt,
      status: "assigned",
      assignedUserId: cleaner.id,
    },
    {
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E offline sync job",
      startAt,
      status: "assigned",
      assignedUserId: cleaner.id,
    },
    {
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E pdf guard job",
      startAt,
      status: "assigned",
      assignedUserId: cleaner.id,
    },
  ]);

  /** Rich supervisor / marketing capture: submitted checklist + photo evidence + quality queue */
  const [reviewJob] = await db
    .insert(jobs)
    .values({
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E review job (needs review)",
      startAt,
      status: "needs_review",
      reviewPriority: "high",
      assignedUserId: cleaner.id,
    })
    .returning();

  await db.insert(jobItemResults).values([
    {
      jobId: reviewJob.id,
      itemId: vacuumItemId,
      result: "pass",
      submittedAt: new Date(),
    },
    {
      jobId: reviewJob.id,
      itemId: sanitiseItemId,
      result: "pass",
      submittedAt: new Date(),
    },
  ]);

  const fixtureBefore = path.join(process.cwd(), "e2e/fixtures/e2e-before.jpg");
  const fixtureAfter = path.join(process.cwd(), "e2e/fixtures/e2e-after.jpg");
  const beforeBytes = fs.readFileSync(fixtureBefore);
  const afterBytes = fs.readFileSync(fixtureAfter);
  const storage = getStorageAdapter();
  const beforeKey = `${org.id}/${reviewJob.id}/e2e-seed-before.jpg`;
  const afterKey = `${org.id}/${reviewJob.id}/e2e-seed-after.jpg`;
  await storage.putObject(beforeKey, beforeBytes, "image/jpeg");
  await storage.putObject(afterKey, afterBytes, "image/jpeg");

  await db.insert(evidence).values([
    {
      organizationId: org.id,
      jobId: reviewJob.id,
      kind: "before",
      objectKey: beforeKey,
      mimeType: "image/jpeg",
      sizeBytes: beforeBytes.length,
      scanState: "ready",
      uploadedBy: cleaner.id,
    },
    {
      organizationId: org.id,
      jobId: reviewJob.id,
      kind: "after",
      objectKey: afterKey,
      mimeType: "image/jpeg",
      sizeBytes: afterBytes.length,
      scanState: "ready",
      uploadedBy: cleaner.id,
    },
  ]);

  await db.insert(issues).values([
    {
      organizationId: org.id,
      siteId: site.id,
      jobId: reviewJob.id,
      title: "E2E demo issue (open)",
      description: "Seeded for capture — not a real customer complaint.",
      category: ISSUE_CATEGORIES.poorQuality,
      severity: "high",
      status: "open",
      source: "internal",
    },
    {
      organizationId: org.id,
      siteId: site.id,
      jobId: reviewJob.id,
      title: "E2E demo issue (in progress)",
      category: ISSUE_CATEGORIES.missedTask,
      severity: "medium",
      status: "work_in_progress",
      source: "internal",
      assigneeId: cleaner.id,
    },
    {
      organizationId: org.id,
      siteId: site.id,
      jobId: reviewJob.id,
      title: "E2E demo issue (assigned)",
      category: ISSUE_CATEGORIES.incompleteChecklist,
      severity: "low",
      status: "assigned",
      source: "internal",
      assigneeId: manager.id,
    },
  ]);

  const [approvedJob] = await db
    .insert(jobs)
    .values({
      organizationId: org.id,
      siteId: site.id,
      templateVersionId: version.id,
      title: "E2E approved report job",
      startAt,
      status: "approved",
      assignedUserId: cleaner.id,
    })
    .returning();

  await db.insert(reportShares).values({
    organizationId: org.id,
    jobId: approvedJob.id,
    tokenHash: hashToken(E2E_REPORT_TOKEN),
    expiresAt: addDays(new Date(), 30),
  });
}

async function seedOrgB(db: ReturnType<typeof getDb>, passwordHash: string) {
  const existing = await db.select().from(users).where(eq(users.email, E2E_ORG_B.owner)).limit(1);
  if (existing.length > 0) return;

  const [org] = await db
    .insert(organizations)
    .values({
      legalName: "E2E Tenant B Ltd",
      displayName: "E2E Tenant B",
      region: "UK",
      currency: "GBP",
      timeZone: "Europe/London",
    })
    .returning();
  const [owner] = await db
    .insert(users)
    .values({ email: E2E_ORG_B.owner, passwordHash, name: "E2E B Owner" })
    .returning();
  await db.insert(memberships).values({
    organizationId: org.id,
    userId: owner.id,
    role: "owner",
    status: "active",
  });
  const trialStart = new Date();
  await db.insert(subscriptions).values({
    organizationId: org.id,
    plan: "starter",
    status: "trialing",
    trialStartsAt: trialStart,
    trialEndsAt: addDays(trialStart, 14),
    currentPeriodStart: trialStart,
    currentPeriodEnd: addDays(trialStart, 14),
  });
}

export async function seedE2eDatabase() {
  const db = getDb();
  const passwordHash = await bcrypt.hash(E2E_PASSWORD, 12);
  await seedOrgA(db, passwordHash);
  await seedOrgB(db, passwordHash);
}

async function main() {
  process.env.CLEANPROOF_DEV_PGLITE = "true";
  process.env.USE_PGLITE = "true";
  process.env.PGLITE_DATA_DIR =
    process.env.PGLITE_DATA_DIR ?? `${process.cwd()}/.data/pglite-e2e`;
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? "postgresql://cleanproof:e2e@127.0.0.1:5432/cleanproof_e2e";
  process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "e2e-auth-secret-minimum-32-characters!!";
  process.env.ALLOW_DEMO_MODE = "true";
  process.env.APP_URL = process.env.APP_URL ?? "http://127.0.0.1:3099";

  const db = getDb();
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedE2eDatabase();
  console.log("E2E seed complete:", process.env.PGLITE_DATA_DIR);
  await closeDb();
}

if (process.argv[1]?.includes("seed-e2e")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
