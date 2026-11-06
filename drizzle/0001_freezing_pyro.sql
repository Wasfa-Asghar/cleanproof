CREATE INDEX "checklist_templates_org_idx" ON "checklist_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "evidence_org_job_idx" ON "evidence" USING btree ("organization_id","job_id");--> statement-breakpoint
CREATE INDEX "issues_org_status_idx" ON "issues" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "jobs_org_status_idx" ON "jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "report_shares_org_job_idx" ON "report_shares" USING btree ("organization_id","job_id");--> statement-breakpoint
CREATE INDEX "sites_org_idx" ON "sites" USING btree ("organization_id");