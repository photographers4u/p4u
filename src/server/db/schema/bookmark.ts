import { pgEnum, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { bookmarkIdentifierValues } from "@/zod/helpers";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";

export const bookmarkIdentifierEnum = pgEnum(
  "bookmark_identifier",
  bookmarkIdentifierValues,
);

export const bookmarks = createTable(
  "bookmark",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    identifier: bookmarkIdentifierEnum("identifier").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.userId, table.identifier, table.value)],
);
