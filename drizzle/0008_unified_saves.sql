CREATE TYPE "public"."save_item_type" AS ENUM('inspiration', 'portfolio', 'tool');--> statement-breakpoint
CREATE TABLE "app_save" (
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"item_type" "save_item_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_save_user_id_item_id_item_type_unique" UNIQUE("user_id","item_id","item_type")
);
--> statement-breakpoint
ALTER TABLE "app_save" ADD CONSTRAINT "app_save_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "app_save" ("user_id", "item_id", "item_type", "created_at")
SELECT "user_id", "inspiration_id", 'inspiration', "created_at"
FROM "app_saved_inspiration"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "app_save" ("user_id", "item_id", "item_type", "created_at")
SELECT "user_id", "portfolio_id", 'portfolio', "created_at"
FROM "app_saved_portfolio"
ON CONFLICT DO NOTHING;--> statement-breakpoint
DROP TABLE "app_saved_inspiration" CASCADE;--> statement-breakpoint
DROP TABLE "app_saved_portfolio" CASCADE;
