import z from "zod";
import {
  CITIES,
  EXPERIENCE_YEARS,
  entitySchema,
  eventTimestamp,
  idValueSchema,
  NAME_MAX_LENGTH,
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
]);

const startingPriceSchema = z
  .union([z.number(), z.string().trim().min(1, "Starting price is required")])
  .transform((value) => Number(value))
  .pipe(z.number().int().min(0, "Starting price must be 0 or greater"));

export const photographerWorkflowStatusValues = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "on_hold",
] as const;
export const photographerWorkflowStatusSchema = z.enum(
  photographerWorkflowStatusValues,
);

const photographerEntityShape = {
  userId: idValueSchema,
  name: z.union([
    requiredTextSchema("Name").max(
      NAME_MAX_LENGTH,
      `Name must be at most ${NAME_MAX_LENGTH} characters`,
    ),
    z.null(),
  ]),
  avatar: nullableTextSchema("Avatar"),
  bio: nullableTextSchema("Bio"),
  locationCity: z.enum(CITIES).nullable(),
  locationCountry: requiredTextSchema("Location country").default("india"),
  experienceYears: z.enum(EXPERIENCE_YEARS).nullable(),
  onboardingStep: onboardingStepSchema.default(1),
  isPublished: z.boolean().default(false),
};

const photographerProfileInputShape = {
  name: requiredTextSchema("Name").max(
    NAME_MAX_LENGTH,
    `Name must be at most ${NAME_MAX_LENGTH} characters`,
  ),
  avatar: nullableTextSchema("Avatar"),
  bio: nullableTextSchema("Bio"),
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
  });

export const createPhotographerProfileSchema = z
  .object(photographerProfileInputShape)
  .extend({
    avatar: photographerProfileInputShape.avatar.optional(),
    bio: photographerProfileInputShape.bio.optional(),
    experienceYears: photographerProfileInputShape.experienceYears.optional(),
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
  imageUrl: requiredTextSchema("Image"),
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

const savePhotographerContactStepSchema = z.object({
  step: z.literal(ONBOARDING_STEPS[3]),
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

// Accept stale pre-refresh tabs temporarily, but normalize everything to the
// new canonical step mapping before controller logic runs.
export const savePhotographerOnboardingStepRequestSchema = z.union([
  savePhotographerOnboardingStepSchema,
  legacySavePhotographerOnboardingAvatarStepSchema,
  legacySavePhotographerProfileStepSchema,
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

export const reviewPhotographerSchema = reviewDecisionSchema({
  rejectionRequiredMessage:
    "A rejection reason is required when rejecting this photographer.",
  onHoldRequiredMessage:
    "A hold reason is required when putting this photographer on hold.",
});

export type Photographer = z.infer<typeof photographerSchema>;
export type CreatePhotographerInput = z.infer<typeof createPhotographerSchema>;
export type UpdatePhotographerInput = z.infer<typeof updatePhotographerSchema>;
export type CreatePhotographerProfileInput = z.infer<
  typeof createPhotographerProfileSchema
>;
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
export type UpdatePhotographerProfileInput = z.infer<
  typeof updatePhotographerProfileSchema
>;
export type ReviewPhotographerInput = z.infer<typeof reviewPhotographerSchema>;
