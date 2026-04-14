import { integer, unique, uuid } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { photographer } from "./photographer";
import { speciality } from "./speciality";

export const photographerSpeciality = createTable(
  "photographer_speciality",
  {
    ...primaryKeyColumns(),
    ...timestampColumns(),
    photographerId: uuid("photographer_id")
      .notNull()
      .references(() => photographer.id, { onDelete: "cascade" }),
    specialityId: uuid("speciality_id")
      .notNull()
      .references(() => speciality.id, { onDelete: "cascade" }),
    startingPrice: integer("starting_price").notNull(),
  },
  (table) => [
    unique("photographer_speciality_unique").on(
      table.photographerId,
      table.specialityId,
    ),
  ],
);
