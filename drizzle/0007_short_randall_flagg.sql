CREATE TYPE "public"."tool_category" AS ENUM('design', 'development', 'ai', 'productivity', 'prototyping', 'collaboration', 'assets', 'other');--> statement-breakpoint
CREATE TABLE "app_tool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"link" text NOT NULL,
	"category" "tool_category" NOT NULL,
	"created_by" uuid NOT NULL,
	"logo" text,
	"status" text DEFAULT 'pending',
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "app_tool_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "app_tool" ADD CONSTRAINT "app_tool_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;