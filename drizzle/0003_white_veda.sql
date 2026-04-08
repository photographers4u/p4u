CREATE TYPE "public"."portfolio_skill" AS ENUM('ui-design', 'ux-design', 'product-design', 'web-design', 'branding', 'illustration', 'motion', 'typography', 'photography', 'graphic-design', '3d', 'other');--> statement-breakpoint
CREATE TABLE "app_portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"bio" text,
	"avatar_url" text,
	"portfolio_url" text,
	"location" text,
	"skills" json DEFAULT '[]'::json NOT NULL,
	"cover_image" text,
	"created_by" uuid NOT NULL,
	"status" text DEFAULT 'pending',
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "app_portfolio_slug_unique" UNIQUE("slug"),
	CONSTRAINT "app_portfolio_created_by_unique" UNIQUE("created_by")
);
--> statement-breakpoint
ALTER TABLE "app_portfolio" ADD CONSTRAINT "app_portfolio_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;