import { boolean, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import {
  CITIES,
  EXPERIENCE_YEARS,
  type ONBOARDING_STEPS,
} from "@/zod/helpers/enum";
import {
  primaryKeyColumns,
  reviewColumns,
  timestampColumns,
} from "../helpers/base-column";
import { createTable } from "../helpers/create-table";
import { user } from "./auth-schema";

export const experienceYearsEnum = pgEnum("experience_years", EXPERIENCE_YEARS);
export const photographerCityEnum = pgEnum("photographer_city", CITIES);
export const photographerWorkflowStatusEnum = pgEnum(
  "photographer_workflow_status",
  ["draft", "submitted", "approved", "rejected", "on_hold"],
);
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const photographer = createTable("photographer", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  slug: text("slug").unique(),
  name: text("name"),
  avatar: text("avatar"),
  bio: text("bio"),
  instagramReelUrl: text("instagram_reel_url"),
  youtubeVideoUrl: text("youtube_video_url"),
  locationCity: photographerCityEnum("location_city"),
  locationCountry: text("country").default("india").notNull(),
  experienceYears: experienceYearsEnum("experience_years"),
  onboardingStep: integer("onboarding_step")
    .$type<OnboardingStep>()
    .notNull()
    .default(1),
  isPublished: boolean("is_published").notNull().default(false),
  ...reviewColumns(),
  status: photographerWorkflowStatusEnum("status").default("draft"),
});
