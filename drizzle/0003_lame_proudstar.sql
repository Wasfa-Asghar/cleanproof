ALTER TYPE "public"."job_status" ADD VALUE 'rejected' BEFORE 'closed';--> statement-breakpoint
CREATE TABLE "issue_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"body" text,
	"is_internal" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"evidence_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "source" text DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "created_by_id" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "linked_reclean_job_id" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "resolution_notes" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_kind" text DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "reclean_source_job_id" uuid;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "review_priority" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "failed_item_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "idempotency_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_activities" ADD CONSTRAINT "issue_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_activities" ADD CONSTRAINT "issue_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_activities" ADD CONSTRAINT "issue_activities_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_evidence" ADD CONSTRAINT "issue_evidence_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_evidence" ADD CONSTRAINT "issue_evidence_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_evidence" ADD CONSTRAINT "issue_evidence_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_activities_issue_idx" ON "issue_activities" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_evidence_pair" ON "issue_evidence" USING btree ("issue_id","evidence_id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_linked_reclean_job_id_jobs_id_fk" FOREIGN KEY ("linked_reclean_job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issues_job_idx" ON "issues" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "jobs_reclean_source_idx" ON "jobs" USING btree ("reclean_source_job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_job_idempotency" ON "reviews" USING btree ("job_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "reviews_job_idx" ON "reviews" USING btree ("job_id");