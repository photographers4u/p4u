import { text } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";

export const items = createTable("item", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  title: text("title"),
});
