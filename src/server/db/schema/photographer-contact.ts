import { sql } from "drizzle-orm";
import { boolean, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { photographer } from "./photographer";

export const photographerContact = createTable(
  "photographer_contact",
  {
    ...primaryKeyColumns(),
    ...timestampColumns(),
    photographerId: uuid("photographer_id")
      .notNull()
      .unique()
      .references(() => photographer.id, { onDelete: "cascade" }),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("photographer_contact_email_ci_unique").on(
      sql`lower(btrim(${table.email}))`,
    ),
  ],
);
