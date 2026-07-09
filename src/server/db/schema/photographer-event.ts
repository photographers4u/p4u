import { index, pgEnum, uuid } from "drizzle-orm/pg-core";
import {
  primaryKeyColumns,
  requiredTimestamptz,
} from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";
import { photographer } from "./photographer";

export const photographerEventTypeEnum = pgEnum("photographer_event_type", [
  "view",
  "contact_call",
  "contact_email",
]);

export const photographerEvent = createTable(
  "photographer_event",
  {
    ...primaryKeyColumns(),
    photographerId: uuid("photographer_id")
      .notNull()
      .references(() => photographer.id, { onDelete: "cascade" }),
    viewerUserId: uuid("viewer_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    eventType: photographerEventTypeEnum("event_type").notNull(),
    createdAt: requiredTimestamptz("created_at"),
  },
  (table) => [
    index("photographer_event_photographer_type_created_idx").on(
      table.photographerId,
      table.eventType,
      table.createdAt,
    ),
    index("photographer_event_viewer_type_idx").on(
      table.viewerUserId,
      table.eventType,
    ),
  ],
);
