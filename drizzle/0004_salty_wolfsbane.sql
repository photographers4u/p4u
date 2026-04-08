CREATE TYPE "public"."experience_years" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15+');--> statement-breakpoint
ALTER TABLE "app_portfolio" RENAME COLUMN "cover_image" TO "screenshot_url";--> statement-breakpoint
ALTER TABLE "app_portfolio" ADD COLUMN "experience_years" "experience_years";--> statement-breakpoint
ALTER TABLE "app_portfolio" ADD COLUMN "open_to_work" boolean DEFAULT false NOT NULL;