import { boolean, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";
import {
  primaryKeyColumns,
  reviewColumns,
  timestampColumns,
} from "../helpers/base-column";
import { CITIES, EXPERIENCE_YEARS, type ONBOARDING_STEPS } from "@/zod/helpers/enum";

export const experienceYearsEnum = pgEnum("experience_years", EXPERIENCE_YEARS);
export const photographerCityEnum = pgEnum("photographer_city", CITIES);
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const photographer = createTable("photographer", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name"),
  avatar: text("avatar"),
  bio: text("bio"),
  locationCity: photographerCityEnum("location_city"),
  locationCountry: text("country").default("india").notNull(),
  experienceYears: experienceYearsEnum("experience_years"),
  onboardingStep: integer("onboarding_step")
    .$type<OnboardingStep>()
    .notNull()
    .default(1),
  isPublished: boolean("is_published").notNull().default(false),
  ...reviewColumns(),
});
