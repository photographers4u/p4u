CREATE TABLE "app_saved_inspiration" (
	"user_id" uuid NOT NULL,
	"inspiration_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_saved_inspiration_user_id_inspiration_id_unique" UNIQUE("user_id","inspiration_id")
);
--> statement-breakpoint
CREATE TABLE "app_saved_portfolio" (
	"user_id" uuid NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_saved_portfolio_user_id_portfolio_id_unique" UNIQUE("user_id","portfolio_id")
);
--> statement-breakpoint
ALTER TABLE "app_saved_inspiration" ADD CONSTRAINT "app_saved_inspiration_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_saved_inspiration" ADD CONSTRAINT "app_saved_inspiration_inspiration_id_app_inspiration_id_fk" FOREIGN KEY ("inspiration_id") REFERENCES "public"."app_inspiration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_saved_portfolio" ADD CONSTRAINT "app_saved_portfolio_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_saved_portfolio" ADD CONSTRAINT "app_saved_portfolio_portfolio_id_app_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."app_portfolio"("id") ON DELETE cascade ON UPDATE no action;