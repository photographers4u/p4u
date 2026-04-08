CREATE TYPE "public"."bookmark_identifier" AS ENUM('item');--> statement-breakpoint
CREATE TABLE "app_bookmark" (
	"user_id" uuid NOT NULL,
	"identifier" "bookmark_identifier" NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_bookmark_user_id_identifier_value_unique" UNIQUE("user_id","identifier","value")
);
--> statement-breakpoint
DROP TABLE "app_inspiration" CASCADE;--> statement-breakpoint
DROP TABLE "app_portfolio" CASCADE;--> statement-breakpoint
DROP TABLE "app_tool" CASCADE;--> statement-breakpoint
DROP TABLE "app_save" CASCADE;--> statement-breakpoint
ALTER TABLE "app_bookmark" ADD CONSTRAINT "app_bookmark_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."inspiration_category";--> statement-breakpoint
DROP TYPE "public"."experience_years";--> statement-breakpoint
DROP TYPE "public"."portfolio_skill";--> statement-breakpoint
DROP TYPE "public"."tool_category";--> statement-breakpoint
DROP TYPE "public"."save_item_type";