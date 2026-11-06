CREATE TABLE "job_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"submitted_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "kind" text DEFAULT 'during' NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "content_hash" text;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "uploaded_by" uuid;--> statement-breakpoint
ALTER TABLE "job_submissions" ADD CONSTRAINT "job_submissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_submissions" ADD CONSTRAINT "job_submissions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_submissions" ADD CONSTRAINT "job_submissions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_submissions_idempotency" ON "job_submissions" USING btree ("job_id","idempotency_key");--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_job_content_hash" ON "evidence" USING btree ("job_id","content_hash");