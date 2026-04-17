CREATE TYPE "public"."photographer_workflow_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'on_hold');--> statement-breakpoint
UPDATE "app_photographer"
SET "status" = CASE
	WHEN "status" = 'approved' OR "is_published" = true THEN 'approved'
	WHEN "status" = 'rejected' THEN 'rejected'
	WHEN "status" = 'on_hold' THEN 'on_hold'
	WHEN "status" = 'pending' OR "status" IS NULL THEN CASE
		WHEN "onboarding_step" = 4 AND EXISTS (
			SELECT 1
			FROM "app_photographer_contact"
			WHERE "photographer_id" = "app_photographer"."id"
		) THEN 'submitted'
		ELSE 'draft'
	END
	ELSE 'draft'
END;--> statement-breakpoint
ALTER TABLE "app_photographer" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."photographer_workflow_status";--> statement-breakpoint
ALTER TABLE "app_photographer" ALTER COLUMN "status" SET DATA TYPE "public"."photographer_workflow_status" USING "status"::"public"."photographer_workflow_status";
