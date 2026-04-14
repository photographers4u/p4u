import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { isApprovedPhotographer } from "@/lib/photographer-status";
import {
  type PhotographerRecord,
  photographerDal,
} from "@/server/db/dal/photographer";
import { photographerContactDal } from "@/server/db/dal/photographer-contact";
import { photographerSpecialityDal } from "@/server/db/dal/photographer-speciality";
import { photographerUploadDal } from "@/server/db/dal/photographer-upload";
import { specialityDal } from "@/server/db/dal/speciality";
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "@/server/db/helpers/errors";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type {
  CreatePhotographerProfileInput,
  PhotographerOnboardingContactInput,
  PhotographerOnboardingSpecialityInput,
  PhotographerOnboardingState,
  SavePhotographerAvatarStepInput,
  SavePhotographerOnboardingStepInput,
  UpdatePhotographerProfileInput,
} from "@/zod/schema/photographer";

type DBClient = DBExecutor | DBTransaction;

const DEFAULT_LOCATION_COUNTRY = "india";
const AVATAR_COMPLETED_STEP = ONBOARDING_STEPS[1];
const PROFILE_COMPLETED_STEP = ONBOARDING_STEPS[2];
const SPECIALITIES_COMPLETED_STEP = ONBOARDING_STEPS[3];
const FINAL_ONBOARDING_STEP = ONBOARDING_STEPS[3];

function toPublicPhotographer(photographer: PhotographerRecord) {
  return {
    id: photographer.id,
    name: photographer.name,
    avatar: photographer.avatar,
    bio: photographer.bio,
    locationCity: photographer.locationCity,
    locationCountry: photographer.locationCountry,
    experienceYears: photographer.experienceYears,
    createdAt: photographer.createdAt,
    updatedAt: photographer.updatedAt,
  };
}

function buildCreatePhotographerData(
  userId: string,
  input: CreatePhotographerProfileInput,
) {
  return {
    userId,
    ...input,
    bio: input.bio?.trim() ? input.bio : null,
    locationCountry: input.locationCountry ?? DEFAULT_LOCATION_COUNTRY,
    onboardingStep: PROFILE_COMPLETED_STEP,
    isPublished: false,
  };
}

function buildEmptyOnboardingState(): PhotographerOnboardingState {
  return {
    avatar: null,
    bio: null,
    contact: null,
    experienceYears: null,
    isPublished: false,
    locationCity: null,
    locationCountry: DEFAULT_LOCATION_COUNTRY,
    name: null,
    onboardingStep: ONBOARDING_STEPS[0],
    status: "pending",
    specialities: [],
    uploads: [],
  };
}

function getProgressedOnboardingStep(
  currentStep: number,
  targetStep: number,
): (typeof ONBOARDING_STEPS)[number] {
  const progressedStep = Math.max(currentStep, targetStep);

  return ONBOARDING_STEPS.includes(
    progressedStep as (typeof ONBOARDING_STEPS)[number],
  )
    ? (progressedStep as (typeof ONBOARDING_STEPS)[number])
    : (targetStep as (typeof ONBOARDING_STEPS)[number]);
}

function normalizeOnboardingStep(
  step: number,
): (typeof ONBOARDING_STEPS)[number] {
  if (ONBOARDING_STEPS.includes(step as (typeof ONBOARDING_STEPS)[number])) {
    return step as (typeof ONBOARDING_STEPS)[number];
  }

  if (step > FINAL_ONBOARDING_STEP) {
    return FINAL_ONBOARDING_STEP;
  }

  return ONBOARDING_STEPS[0];
}

function hasChanges<
  TRecord extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>,
>(record: TRecord, data: TUpdate) {
  return Object.entries(data).some(([key, value]) => record[key] !== value);
}

function normalizeSpecialities(
  input: PhotographerOnboardingSpecialityInput[],
): PhotographerOnboardingSpecialityInput[] {
  const uniqueSpecialities = new Map<string, number>();

  for (const speciality of input) {
    uniqueSpecialities.set(speciality.specialityId, speciality.startingPrice);
  }

  return Array.from(uniqueSpecialities.entries()).map(
    ([specialityId, startingPrice]) => ({
      specialityId,
      startingPrice,
    }),
  );
}

async function getPhotographerByUserIdOrThrow(
  userId: string,
  executor: DBClient = db,
) {
  const photographer = await photographerDal.getByUserId(userId, executor);

  if (!photographer) {
    throw new NotFoundError("Photographer not found");
  }

  return photographer;
}

async function ensurePhotographerByUserId(
  userId: string,
  executor: DBClient = db,
) {
  const existing = await photographerDal.getByUserId(userId, executor);

  if (existing) {
    return existing;
  }

  const photographer = await photographerDal.create(
    {
      userId,
      isPublished: false,
    },
    executor,
  );

  if (!photographer) {
    throw new InternalError("Failed to create photographer onboarding draft");
  }

  return photographer;
}

async function updatePhotographerRecord(
  existing: PhotographerRecord,
  data: Partial<Omit<PhotographerRecord, "id" | "createdAt" | "updatedAt">>,
  executor: DBClient = db,
) {
  if (!hasChanges(existing, data)) {
    return existing;
  }

  const photographer = await photographerDal.updateById(
    existing.id,
    data,
    executor,
  );

  if (!photographer) {
    throw new InternalError("Failed to update photographer");
  }

  return photographer;
}

async function syncPhotographerSpecialities(
  photographerId: string,
  input: PhotographerOnboardingSpecialityInput[],
  executor: DBClient = db,
) {
  const normalizedSpecialities = normalizeSpecialities(input);
  const specialityIds = normalizedSpecialities.map(
    (speciality) => speciality.specialityId,
  );
  const existingSpecialities = await specialityDal.getByIds(
    specialityIds,
    executor,
  );

  if (existingSpecialities.length !== specialityIds.length) {
    throw new BadRequestError("Select valid specialities before continuing");
  }

  await photographerSpecialityDal.deleteAllByPhotographerId(
    photographerId,
    executor,
  );

  const photographerSpecialities = normalizedSpecialities.map((speciality) => {
    return {
      photographerId,
      specialityId: speciality.specialityId,
      startingPrice: speciality.startingPrice,
    };
  });

  await photographerSpecialityDal.createMany(
    photographerSpecialities,
    executor,
  );
}

async function upsertPhotographerContact(
  photographerId: string,
  input: PhotographerOnboardingContactInput,
  executor: DBClient = db,
) {
  const existingContact = await photographerContactDal.getByPhotographerId(
    photographerId,
    executor,
  );
  const conflictingContact = await photographerContactDal.getByEmail(
    input.email,
    executor,
  );

  if (
    conflictingContact &&
    conflictingContact.photographerId !== photographerId
  ) {
    throw new ConflictError(
      "That email address is already being used by another photographer contact",
    );
  }

  if (!existingContact) {
    const contact = await photographerContactDal.create(
      {
        photographerId,
        phone: input.phone,
        email: input.email,
        emailVerified: false,
        isPublic: input.isPublic,
      },
      executor,
    );

    if (!contact) {
      throw new InternalError("Failed to create photographer contact");
    }

    return contact;
  }

  const nextEmailVerified =
    existingContact.email === input.email
      ? existingContact.emailVerified
      : false;
  const contact = await photographerContactDal.updateById(
    existingContact.id,
    {
      phone: input.phone,
      email: input.email,
      emailVerified: nextEmailVerified,
      isPublic: input.isPublic,
    },
    executor,
  );

  if (!contact) {
    throw new InternalError("Failed to update photographer contact");
  }

  return contact;
}

async function assertReadyForPublication(
  photographer: PhotographerRecord,
  executor: DBClient = db,
) {
  const contact = await photographerContactDal.getByPhotographerId(
    photographer.id,
    executor,
  );
  const specialities = await photographerSpecialityDal.getByPhotographerId(
    photographer.id,
    executor,
  );

  if (!photographer.avatar) {
    throw new BadRequestError(
      "Complete the avatar step before finishing onboarding",
    );
  }

  if (
    !photographer.name ||
    !photographer.locationCity ||
    !photographer.locationCountry ||
    !photographer.experienceYears
  ) {
    throw new BadRequestError(
      "Complete your profile details before finishing onboarding",
    );
  }

  if (specialities.length === 0) {
    throw new BadRequestError(
      "Enter a price for at least one speciality before finishing onboarding",
    );
  }

  if (!contact) {
    throw new BadRequestError(
      "Add your contact details before finishing onboarding",
    );
  }
}

async function buildOnboardingState(
  photographer: PhotographerRecord | null,
  executor: DBClient = db,
): Promise<PhotographerOnboardingState> {
  if (!photographer) {
    return buildEmptyOnboardingState();
  }

  const contact = await photographerContactDal.getByPhotographerId(
    photographer.id,
    executor,
  );
  const specialities = await photographerSpecialityDal.getByPhotographerId(
    photographer.id,
    executor,
  );
  const uploads = await photographerUploadDal.getByPhotographerId(
    photographer.id,
    executor,
  );

  return {
    avatar: photographer.avatar,
    bio: photographer.bio,
    contact: contact
      ? {
          phone: contact.phone,
          email: contact.email,
          emailVerified: contact.emailVerified,
          isPublic: contact.isPublic,
        }
      : null,
    experienceYears: photographer.experienceYears,
    isPublished: photographer.isPublished,
    locationCity: photographer.locationCity,
    locationCountry: photographer.locationCountry,
    name: photographer.name,
    onboardingStep: normalizeOnboardingStep(photographer.onboardingStep),
    status: photographer.status ?? "pending",
    specialities: specialities.map((speciality) => ({
      specialityId: speciality.specialityId,
      startingPrice: speciality.startingPrice,
    })),
    uploads: uploads.map((upload) => ({
      imageUrl: upload.imageUrl,
    })),
  };
}

export const photographerController = {
  async getPhotographerOnboardingByUserId(userId: string) {
    const photographer = await photographerDal.getByUserId(userId);

    return buildOnboardingState(photographer);
  },

  async savePhotographerAvatarStep(
    userId: string,
    input: SavePhotographerAvatarStepInput,
  ) {
    const onboarding = await this.savePhotographerOnboardingStep(userId, {
      step: ONBOARDING_STEPS[0],
      avatar: input.avatar,
    });

    return onboarding;
  },

  async savePhotographerOnboardingStep(
    userId: string,
    input: SavePhotographerOnboardingStepInput,
  ) {
    return db.transaction(async (tx) => {
      const existing = await ensurePhotographerByUserId(userId, tx);

      switch (input.step) {
        case ONBOARDING_STEPS[0]: {
          const photographer = await updatePhotographerRecord(
            existing,
            {
              avatar: input.avatar,
              onboardingStep: getProgressedOnboardingStep(
                existing.onboardingStep,
                AVATAR_COMPLETED_STEP,
              ),
            },
            tx,
          );

          return buildOnboardingState(photographer, tx);
        }

        case ONBOARDING_STEPS[1]: {
          const photographer = await updatePhotographerRecord(
            existing,
            {
              name: input.name,
              bio: input.bio?.trim() ? input.bio : null,
              locationCity: input.locationCity,
              locationCountry: DEFAULT_LOCATION_COUNTRY,
              experienceYears: input.experienceYears,
              onboardingStep: getProgressedOnboardingStep(
                existing.onboardingStep,
                PROFILE_COMPLETED_STEP,
              ),
            },
            tx,
          );

          return buildOnboardingState(photographer, tx);
        }

        case ONBOARDING_STEPS[2]: {
          await syncPhotographerSpecialities(
            existing.id,
            input.specialities,
            tx,
          );

          const photographer = await updatePhotographerRecord(
            existing,
            {
              onboardingStep: getProgressedOnboardingStep(
                existing.onboardingStep,
                SPECIALITIES_COMPLETED_STEP,
              ),
            },
            tx,
          );

          return buildOnboardingState(photographer, tx);
        }

        case ONBOARDING_STEPS[3]: {
          await upsertPhotographerContact(existing.id, input.contact, tx);
          const shouldKeepApprovedState = isApprovedPhotographer(existing);

          const photographer = await updatePhotographerRecord(
            existing,
            shouldKeepApprovedState
              ? {
                  onboardingStep: FINAL_ONBOARDING_STEP,
                }
              : {
                  onboardingStep: FINAL_ONBOARDING_STEP,
                  isPublished: false,
                  rejectionReason: null,
                  reviewedAt: null,
                  reviewedBy: null,
                  status: "pending",
                },
            tx,
          );

          await assertReadyForPublication(photographer, tx);

          return buildOnboardingState(photographer, tx);
        }

        default:
          throw new BadRequestError("Invalid onboarding step");
      }
    });
  },

  async createPhotographer(
    userId: string,
    input: CreatePhotographerProfileInput,
  ) {
    const existing = await photographerDal.getByUserId(userId);

    if (existing) {
      throw new ConflictError("Photographer already exists for this user");
    }

    const photographer = await photographerDal.create(
      buildCreatePhotographerData(userId, input),
    );

    if (!photographer) {
      throw new InternalError("Failed to create photographer");
    }

    return photographer;
  },

  async getPhotographerByUserId(userId: string) {
    return getPhotographerByUserIdOrThrow(userId);
  },

  async getPublicPhotographerById(id: string) {
    const photographer = await photographerDal.getById(id);

    if (!photographer || !photographer.isPublished) {
      throw new NotFoundError("Photographer not found");
    }

    return toPublicPhotographer(photographer);
  },

  async getPublicPhotographers() {
    const photographers = await photographerDal.getAll();

    return photographers
      .filter((photographer) => photographer.isPublished)
      .map(toPublicPhotographer);
  },

  async updatePhotographerProfile(
    userId: string,
    input: UpdatePhotographerProfileInput,
  ) {
    const existing = await getPhotographerByUserIdOrThrow(userId);
    const onboardingStep = getProgressedOnboardingStep(
      existing.onboardingStep,
      PROFILE_COMPLETED_STEP,
    );
    const data = {
      ...input,
      bio: input.bio?.trim() ? input.bio : null,
      onboardingStep,
    };

    if (
      Object.keys(input).length === 0 &&
      existing.onboardingStep === onboardingStep
    ) {
      return existing;
    }

    if (!hasChanges(existing, data)) {
      return existing;
    }

    const photographer = await photographerDal.updateById(existing.id, data);

    if (!photographer) {
      throw new InternalError("Failed to update photographer");
    }

    return photographer;
  },

  async deletePhotographer(userId: string) {
    const existing = await getPhotographerByUserIdOrThrow(userId);
    const photographer = await photographerDal.deleteById(existing.id);

    if (!photographer) {
      throw new InternalError("Failed to delete photographer");
    }

    return photographer;
  },
};
