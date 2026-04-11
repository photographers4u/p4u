import { boolean, text, uuid } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { photographer } from "./photographer";

export const photographerContact = createTable("photographer_contact", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  photographerId: uuid("photographer_id")
    .notNull()
    .unique()
    .references(() => photographer.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
});
