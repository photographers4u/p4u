CREATE TYPE "public"."inspiration_category" AS ENUM('typography', 'layout', 'color', 'illustration', 'photography', 'motion', 'branding', 'ui', 'other');--> statement-breakpoint
CREATE TABLE "app_inspiration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"category" "inspiration_category" NOT NULL,
	"created_by" uuid NOT NULL,
	"cover_image" text,
	"status" text DEFAULT 'pending',
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "app_inspiration_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "app_inspiration" ADD CONSTRAINT "app_inspiration_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;