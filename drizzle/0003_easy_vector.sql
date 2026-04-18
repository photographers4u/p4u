ALTER TABLE "app_photographer_upload" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
WITH ordered_uploads AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "photographer_id"
      ORDER BY "created_at" ASC, "id" ASC
    ) - 1 AS "next_display_order"
  FROM "app_photographer_upload"
)
UPDATE "app_photographer_upload" AS uploads
SET "display_order" = ordered_uploads."next_display_order"
FROM ordered_uploads
WHERE uploads."id" = ordered_uploads."id";
