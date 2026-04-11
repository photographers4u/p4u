import { pgEnum, text, unique, uuid } from "drizzle-orm/pg-core";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";
import {
  primaryKeyColumns,
  reviewColumns,
  timestampColumns,
} from "../helpers/base-column";
import { EXPERIENCE_YEARS } from "@/zod/helpers/enum";

const experienceYearsEnum = pgEnum("experience_years", EXPERIENCE_YEARS);

export const photographer = createTable("photographer", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatar: text("avatar"),
  bio: text("bio").notNull(),
  locationCity: text("location_city").notNull(),
  locationCountry: text("country").default("india").notNull(),
  experienceYears: experienceYearsEnum("experience_years"),
  ...reviewColumns(),
});
