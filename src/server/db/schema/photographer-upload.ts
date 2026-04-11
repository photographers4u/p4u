import { text, uuid } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { photographer } from "./photographer";

export const photographerUpload = createTable("photographer_upload", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  photographerId: uuid("photographer_id")
    .notNull()
    .references(() => photographer.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
});
