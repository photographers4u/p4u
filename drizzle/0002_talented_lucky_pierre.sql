ALTER TABLE "app_photographer_contact" DROP CONSTRAINT "app_photographer_contact_email_unique";--> statement-breakpoint
DO $$
DECLARE
  duplicate_email text;
BEGIN
  SELECT lower(btrim(email))
    INTO duplicate_email
    FROM "app_photographer_contact"
   GROUP BY lower(btrim(email))
  HAVING count(*) > 1
   LIMIT 1;

  IF duplicate_email IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot apply photographer contact email normalization because duplicate normalized email "%" already exists.',
      duplicate_email;
  END IF;
END $$;--> statement-breakpoint
UPDATE "app_photographer_contact"
SET "email" = lower(btrim("email"))
WHERE "email" <> lower(btrim("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "photographer_contact_email_ci_unique" ON "app_photographer_contact" USING btree (lower(btrim("email")));
