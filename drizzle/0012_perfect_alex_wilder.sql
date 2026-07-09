CREATE TYPE "public"."photographer_event_type" AS ENUM('view', 'contact_call', 'contact_email');--> statement-breakpoint
CREATE TABLE "app_photographer_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photographer_id" uuid NOT NULL,
	"viewer_user_id" uuid,
	"event_type" "photographer_event_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_photographer_event" ADD CONSTRAINT "app_photographer_event_photographer_id_app_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."app_photographer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer_event" ADD CONSTRAINT "app_photographer_event_viewer_user_id_app_user_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "photographer_event_photographer_type_created_idx" ON "app_photographer_event" USING btree ("photographer_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "photographer_event_viewer_type_idx" ON "app_photographer_event" USING btree ("viewer_user_id","event_type");