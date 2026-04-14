CREATE TYPE "public"."bookmark_identifier" AS ENUM('item');--> statement-breakpoint
CREATE TYPE "public"."experience_years" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10+');--> statement-breakpoint
CREATE TYPE "public"."photographer_city" AS ENUM('Agra', 'Ahmedabad', 'Amritsar', 'Asansol', 'Aurangabad', 'Bengaluru', 'Bhopal', 'Chandigarh', 'Chennai', 'Coimbatore', 'Dhanbad', 'Durg-Bhilai Nagar', 'Faridabad', 'Ghaziabad', 'Gwalior', 'Hyderabad', 'Indore', 'Jabalpur', 'Jaipur', 'Jamshedpur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolkata', 'Kollam', 'Kota', 'Kozhikode', 'Lucknow', 'Ludhiana', 'Madurai', 'Malappuram', 'Meerut', 'Mumbai', 'Nagpur', 'Nashik', 'Patna', 'Pimpri-Chinchwad', 'Prayagraj', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Srinagar', 'Surat', 'Thane', 'Thrissur', 'Tiruchirappalli', 'Tiruppur', 'Vadodara', 'Varanasi', 'Vasai-Virar', 'Vijayawada', 'Visakhapatnam');--> statement-breakpoint
CREATE TABLE "app_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"impersonated_by" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "app_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_bookmark" (
	"user_id" uuid NOT NULL,
	"identifier" "bookmark_identifier" NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_bookmark_user_id_identifier_value_unique" UNIQUE("user_id","identifier","value")
);
--> statement-breakpoint
CREATE TABLE "app_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "app_photographer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text,
	"avatar" text,
	"bio" text,
	"location_city" "photographer_city",
	"country" text DEFAULT 'india' NOT NULL,
	"experience_years" "experience_years",
	"onboarding_step" integer DEFAULT 1 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending',
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "app_photographer_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "app_photographer_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"photographer_id" uuid NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "app_photographer_contact_photographer_id_unique" UNIQUE("photographer_id"),
	CONSTRAINT "app_photographer_contact_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "app_speciality" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "app_speciality_name_unique" UNIQUE("name"),
	CONSTRAINT "app_speciality_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app_photographer_speciality" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"photographer_id" uuid NOT NULL,
	"speciality_id" uuid NOT NULL,
	"starting_price" integer NOT NULL,
	CONSTRAINT "photographer_speciality_unique" UNIQUE("photographer_id","speciality_id")
);
--> statement-breakpoint
CREATE TABLE "app_photographer_upload" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"photographer_id" uuid NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_account" ADD CONSTRAINT "app_account_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_session" ADD CONSTRAINT "app_session_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_bookmark" ADD CONSTRAINT "app_bookmark_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer" ADD CONSTRAINT "app_photographer_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer_contact" ADD CONSTRAINT "app_photographer_contact_photographer_id_app_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."app_photographer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer_speciality" ADD CONSTRAINT "app_photographer_speciality_photographer_id_app_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."app_photographer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer_speciality" ADD CONSTRAINT "app_photographer_speciality_speciality_id_app_speciality_id_fk" FOREIGN KEY ("speciality_id") REFERENCES "public"."app_speciality"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_photographer_upload" ADD CONSTRAINT "app_photographer_upload_photographer_id_app_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."app_photographer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "app_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "app_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "app_verification" USING btree ("identifier");