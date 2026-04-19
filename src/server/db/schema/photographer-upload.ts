import { integer, text, uuid } from "drizzle-orm/pg-core";
import {
  eventTimestamptz,
  primaryKeyColumns,
  timestampColumns,
} from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { photographer } from "./photographer";

export const photographerUpload = createTable("photographer_upload", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  photographerId: uuid("photographer_id")
    .notNull()
    .references(() => photographer.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").notNull().default(0),
  pinnedAt: eventTimestamptz("pinned_at"),
  imageUrl: text("image_url").notNull(),
  storageFileId: text("storage_file_id"),
});
