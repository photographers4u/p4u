import { text } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";

export const speciality = createTable("speciality", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull()
});
