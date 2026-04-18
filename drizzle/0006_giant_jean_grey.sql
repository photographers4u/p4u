DROP TABLE "app_item" CASCADE;--> statement-breakpoint
DELETE FROM "app_bookmark";--> statement-breakpoint
ALTER TABLE "app_bookmark" ALTER COLUMN "identifier" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."bookmark_identifier";--> statement-breakpoint
CREATE TYPE "public"."bookmark_identifier" AS ENUM('photographer');--> statement-breakpoint
ALTER TABLE "app_bookmark" ALTER COLUMN "identifier" SET DATA TYPE "public"."bookmark_identifier" USING "identifier"::"public"."bookmark_identifier";
