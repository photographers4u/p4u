ALTER TABLE "app_photographer" ADD COLUMN "slug" text;--> statement-breakpoint
WITH slug_source AS (
  SELECT
    "id",
    regexp_split_to_array(btrim("name"), '\s+') AS "name_parts",
    lpad(lower(to_hex(row_number() OVER (ORDER BY "id"))), 8, '0') AS "slug_suffix"
  FROM "app_photographer"
  WHERE "slug" IS NULL
    AND "name" IS NOT NULL
    AND btrim("name") <> ''
)
UPDATE "app_photographer" AS photographer
SET "slug" = concat(
  coalesce(
    nullif(
      regexp_replace(
        regexp_replace(
          lower(
            CASE
              WHEN array_length(slug_source."name_parts", 1) > 1
                THEN slug_source."name_parts"[1] || '-' || slug_source."name_parts"[array_length(slug_source."name_parts", 1)]
              ELSE slug_source."name_parts"[1]
            END
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        '(^-+|-+$)',
        '',
        'g'
      ),
      ''
    ),
    'photographer'
  ),
  '-',
  slug_source."slug_suffix"
)
FROM slug_source
WHERE photographer."id" = slug_source."id";--> statement-breakpoint
ALTER TABLE "app_photographer" ADD CONSTRAINT "app_photographer_slug_unique" UNIQUE("slug");
