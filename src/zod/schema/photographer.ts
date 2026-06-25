import z from "zod";
import { photographerReviewPhotoMinimum } from "@/lib/photographer-upload-config";
import { isInstagramReelUrl, isYouTubeVideoUrl } from "@/lib/video-embeds";
import {
  CITIES,
  EXPERIENCE_YEARS,
  emailSchema,
  entitySchema,
  eventTimestamp,
  idValueSchema,
  NAME_MAX_LENGTH,
  nameSlugSchema,
  nullableTextSchema,
  ONBOARDING_STEPS,
  requiredTextSchema,
  reviewDecisionSchema,
} from "@/zod/helpers";
import {
  type SavePhotographerContactInput,
  savePhotographerContactSchema,
} from "./photographer-contact";

const BIO_MAX_LENGTH = 1000;

const onboardingStepSchema = z.union([
  z.literal(ONBOARDING_STEPS[0]),
  z.literal(ONBOARDING_STEPS[1]),
  z.literal(ONBOARDING_STEPS[2]),
  z.literal(ONBOARDING_STEPS[3]),
  z.literal(ONBOARDING_STEPS[4]),
]);

const startingPriceSchema = z
  .union([z.number(), z.string().trim().min(1, "Starting price is required")])
  .transform((value) => Number(value))
  .pipe(z.number().int().min(0, "Starting price must be 0 or greater"));

function optionalSocialVideoUrlSchema({
  fieldName,
  isSupportedUrl,
  supportedUrlMessage,
}: {
  fieldName: string;
  isSupportedUrl: (value: string) => boolean;
  supportedUrlMessage: string;
}) {
  return z.union([
    z
      .string()
      .trim()
      .length(0)
      .transform(() => null),
    z
      .string()
      .trim()
      .url(`Enter a valid ${fieldName} URL`)
      .refine(isSupportedUrl, supportedUrlMessage),
    z.null(),
  ]);
}

const instagramReelUrlSchema = optionalSocialVideoUrlSchema({
  fieldName: "Instagram Reel",
  isSupportedUrl: isInstagramReelUrl,
  supportedUrlMessage:
    "Paste a valid Instagram Reel link, for example https://www.instagram.com/reel/...",
});

const youtubeVideoUrlSchema = optionalSocialVideoUrlSchema({
  fieldName: "YouTube video",
  isSupportedUrl: isYouTubeVideoUrl,
  supportedUrlMessage:
    "Paste a valid YouTube video link, for example https://www.youtube.com/watch?v=...",
});

const photographerProfileBioInputSchema = z.union([
  z
    .string()
    .trim()
    .length(0)
    .transform(() => null),
  z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `Bio must be at most ${BIO_MAX_LENGTH} characters`),
  z.null(),
]);

export const photographerWorkflowStatusValues = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "on_hold",
  "pending_verification",
] as const;
export const photographerWorkflowStatusSchema = z.enum(
  photographerWorkflowStatusValues,
);

export const adminPhotographerListStatusFilterValues = [
  "all",
  "draft",
  "submitted",
  "approved",
  "rejected",
  "on_hold",
  "pending_verification",
] as const;
export const adminPhotographerListStatusFilterSchema = z.enum(
  adminPhotographerListStatusFilterValues,
);

export const adminPhotographerListSortValues = [
  "review_queue",
  "updated_desc",
  "updated_asc",
  "created_desc",
  "created_asc",
  "name_asc",
  "name_desc",
] as const;
export const adminPhotographerListSortSchema = z.enum(
  adminPhotographerListSortValues,
);

export const DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS =
  adminPhotographerListStatusFilterValues[0];
export const DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT =
  adminPhotographerListSortValues[0];

export const adminPhotographerListFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  query: z.string().default(""),
  sort: adminPhotographerListSortSchema.default(
    DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  ),
  status: adminPhotographerListStatusFilterSchema.default(
    DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  ),
});

const photographerEntityShape = {
  userId: idValueSchema,
  slug: nameSlugSchema.nullable(),
  name: z.union([
    requiredTextSchema("Name").max(
      NAME_MAX_LENGTH,
      `Name must be at most ${NAME_MAX_LENGTH} characters`,
    ),
    z.null(),
  ]),
  avatar: nullableTextSchema("Avatar"),
  bio: nullableTextSchema("Bio"),
  instagramReelUrl: instagramReelUrlSchema,
  youtubeVideoUrl: youtubeVideoUrlSchema,
  locationCity: z.enum(CITIES).nullable(),
  locationCountry: requiredTextSchema("Location country").default("india"),
  experienceYears: z.enum(EXPERIENCE_YEARS).nullable(),
  onboardingStep: onboardingStepSchema.default(1),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
};

const photographerProfileInputShape = {
  name: requiredTextSchema("Name").max(
    NAME_MAX_LENGTH,
    `Name must be at most ${NAME_MAX_LENGTH} characters`,
  ),
  avatar: nullableTextSchema("Avatar"),
  bio: photographerProfileBioInputSchema,
  instagramReelUrl: instagramReelUrlSchema,
  youtubeVideoUrl: youtubeVideoUrlSchema,
  locationCity: z.enum(CITIES),
  locationCountry: requiredTextSchema("Location country").default("india"),
  experienceYears: z.enum(EXPERIENCE_YEARS),
};

export const photographerBaseSchema = z.object(photographerEntityShape);

const photographerWorkflowShape = {
  status: photographerWorkflowStatusSchema.default("draft"),
  rejectionReason: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  reviewedAt: eventTimestamp(),
};

export const photographerSchema = entitySchema({
  ...photographerEntityShape,
  ...photographerWorkflowShape,
});

export const createPhotographerSchema = z
  .object({
    userId: idValueSchema,
    ...photographerProfileInputShape,
    onboardingStep: onboardingStepSchema.default(1),
    isPublished: z.boolean().default(false),
  })
  .extend({
    avatar: photographerProfileInputShape.avatar.optional(),
    bio: photographerProfileInputShape.bio.optional(),
    experienceYears: photographerProfileInputShape.experienceYears.optional(),
    instagramReelUrl: photographerProfileInputShape.instagramReelUrl.optional(),
    youtubeVideoUrl: photographerProfileInputShape.youtubeVideoUrl.optional(),
  });

export const updatePhotographerSchema = createPhotographerSchema.partial();

export const updatePhotographerProfileSchema = updatePhotographerSchema.omit({
  userId: true,
  onboardingStep: true,
  isPublished: true,
});

export const savePhotographerAvatarStepSchema = z.object({
  avatar: requiredTextSchema("Avatar"),
});

export const photographerOnboardingSpecialityInputSchema = z.object({
  specialityId: idValueSchema,
  startingPrice: startingPriceSchema,
});

export const photographerOnboardingUploadInputSchema = z.object({
  id: idValueSchema,
  displayOrder: z.number().int().min(0),
  imageUrl: requiredTextSchema("Image"),
  pinnedAt: eventTimestamp(),
});

const savePhotographerProfileStepFields = {
  name: requiredTextSchema("Name").max(
    NAME_MAX_LENGTH,
    `Name must be at most ${NAME_MAX_LENGTH} characters`,
  ),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `Bio must be at most ${BIO_MAX_LENGTH} characters`)
    .optional(),
  locationCity: z.enum(CITIES),
  experienceYears: z.enum(EXPERIENCE_YEARS),
};

const savePhotographerProfileStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[0]),
  ...savePhotographerProfileStepFields,
});

const savePhotographerSpecialitiesStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[2]),
  specialities: z
    .array(photographerOnboardingSpecialityInputSchema)
    .min(1, "Enter a price for at least one speciality"),
});

const savePhotographerReviewPhotosStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[3]),
  uploads: z
    .array(idValueSchema)
    .min(
      photographerReviewPhotoMinimum,
      `Upload at least ${photographerReviewPhotoMinimum} review photo`,
    )
    .refine(
      (uploadIds) => new Set(uploadIds).size === uploadIds.length,
      "Each review photo can only be included once",
    ),
});

const savePhotographerContactStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[4]),
  contact: savePhotographerContactSchema,
});

const savePhotographerOnboardingAvatarStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[1]),
  avatar: requiredTextSchema("Avatar"),
});

export const savePhotographerOnboardingStepSchema = z.discriminatedUnion(
  "step",
  [
    savePhotographerProfileStepSchema,
    savePhotographerOnboardingAvatarStepSchema,
    savePhotographerSpecialitiesStepSchema,
    savePhotographerReviewPhotosStepSchema,
    savePhotographerContactStepSchema,
  ],
);

const legacySavePhotographerOnboardingAvatarStepSchema = z
  .object({
    step: z.literal(ONBOARDING_STEPS[0]),
    avatar: requiredTextSchema("Avatar"),
  })
  .transform((input) => ({
    step: ONBOARDING_STEPS[1],
    avatar: input.avatar,
  }));

const legacySavePhotographerProfileStepSchema = z
  .object({
    step: z.literal(ONBOARDING_STEPS[1]),
    ...savePhotographerProfileStepFields,
  })
  .transform((input) => ({
    step: ONBOARDING_STEPS[0],
    name: input.name,
    bio: input.bio,
    locationCity: input.locationCity,
    experienceYears: input.experienceYears,
  }));

const legacySavePhotographerContactStepSchema = z
  .object({
    step: z.literal(ONBOARDING_STEPS[3]),
    contact: savePhotographerContactSchema,
  })
  .transform((input) => ({
    step: ONBOARDING_STEPS[4],
    contact: input.contact,
  }));

// Accept stale pre-refresh tabs temporarily, but normalize everything to the
// new canonical step mapping before controller logic runs.
export const savePhotographerOnboardingStepRequestSchema = z.union([
  savePhotographerOnboardingStepSchema,
  legacySavePhotographerOnboardingAvatarStepSchema,
  legacySavePhotographerProfileStepSchema,
  legacySavePhotographerContactStepSchema,
]);

export const photographerOnboardingStateSchema = z.object({
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  contact: z
    .object({
      phone: z.string(),
      email: z.string(),
      emailVerified: z.boolean(),
      isPublic: z.boolean(),
    })
    .nullable(),
  experienceYears: z.enum(EXPERIENCE_YEARS).nullable(),
  isPublished: z.boolean(),
  locationCity: z.enum(CITIES).nullable(),
  locationCountry: z.string(),
  name: z.string().nullable(),
  onboardingStep: onboardingStepSchema,
  rejectionReason: z.string().nullable(),
  status: photographerWorkflowStatusSchema,
  specialities: z.array(photographerOnboardingSpecialityInputSchema),
  uploads: z.array(photographerOnboardingUploadInputSchema),
});

export const photographerIdParamsSchema = z.object({
  id: idValueSchema,
});

export const publicPhotographerListQuerySchema = z.object({
  id: z.union([idValueSchema, z.array(idValueSchema)]).optional(),
});

export const photographerSlugParamsSchema = z.object({
  slug: nameSlugSchema,
});

export const reviewPhotographerSchema = reviewDecisionSchema({
  rejectionRequiredMessage:
    "A rejection reason is required when rejecting this photographer.",
  onHoldRequiredMessage:
    "A hold reason is required when putting this photographer on hold.",
});

export const setPhotographerFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

export const createAdminPhotographerSchema = z.object({
  name: requiredTextSchema("Name").max(
    NAME_MAX_LENGTH,
    `Name must be at most ${NAME_MAX_LENGTH} characters`,
  ),
  phone: requiredTextSchema("Phone"),
  email: emailSchema.optional(),
  bio: photographerProfileBioInputSchema.optional(),
  locationCity: z.enum(CITIES).optional(),
  experienceYears: z.enum(EXPERIENCE_YEARS).optional(),
  instagramReelUrl: instagramReelUrlSchema.optional(),
  isPublic: z.boolean().default(false),
});

export const syncAdminPhotographerSpecialitiesSchema = z.object({
  specialities: z.array(photographerOnboardingSpecialityInputSchema),
});

export type Photographer = z.infer<typeof photographerSchema>;
export type CreatePhotographerInput = z.infer<typeof createPhotographerSchema>;
export type UpdatePhotographerInput = z.infer<typeof updatePhotographerSchema>;
export type SavePhotographerAvatarStepInput = z.infer<
  typeof savePhotographerAvatarStepSchema
>;
export type PhotographerOnboardingSpecialityInput = z.infer<
  typeof photographerOnboardingSpecialityInputSchema
>;
export type PhotographerOnboardingContactInput = SavePhotographerContactInput;
export type PhotographerOnboardingUploadInput = z.infer<
  typeof photographerOnboardingUploadInputSchema
>;
export type SavePhotographerOnboardingStepInput = z.infer<
  typeof savePhotographerOnboardingStepSchema
>;
export type PhotographerOnboardingState = z.infer<
  typeof photographerOnboardingStateSchema
>;
export type PhotographerWorkflowStatus = z.infer<
  typeof photographerWorkflowStatusSchema
>;
export type AdminPhotographerListStatusFilter = z.infer<
  typeof adminPhotographerListStatusFilterSchema
>;
export type AdminPhotographerListSort = z.infer<
  typeof adminPhotographerListSortSchema
>;
export type AdminPhotographerListFilters = z.infer<
  typeof adminPhotographerListFiltersSchema
>;
export type PublicPhotographerListQuery = z.infer<
  typeof publicPhotographerListQuerySchema
>;
export type UpdatePhotographerProfileInput = z.infer<
  typeof updatePhotographerProfileSchema
>;
export type ReviewPhotographerInput = z.infer<typeof reviewPhotographerSchema>;
export type SetPhotographerFeaturedInput = z.infer<
  typeof setPhotographerFeaturedSchema
>;
export type CreateAdminPhotographerInput = z.infer<
  typeof createAdminPhotographerSchema
>;
export type SyncAdminPhotographerSpecialitiesInput = z.infer<
  typeof syncAdminPhotographerSpecialitiesSchema
>;
