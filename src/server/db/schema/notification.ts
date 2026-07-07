import { text, uuid } from "drizzle-orm/pg-core";
import {
  eventTimestamptz,
  primaryKeyColumns,
  timestampColumns,
} from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";

export const notification = createTable("notification", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  readAt: eventTimestamptz("read_at"),
});
