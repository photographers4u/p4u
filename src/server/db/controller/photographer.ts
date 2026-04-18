import { env } from "@/lib/env";
import {
  canReviewPhotographerWithStatus,
  isApprovedPhotographer,
  isPhotographerSubmittedForReview,
} from "@/lib/photographer-status";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerContactController } from "@/server/db/controller/photographer-contact";
import {
  ADMIN_PHOTOGRAPHER_LIST_SORTS,
  ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS,
  type AdminPhotographerListRow,
  type AdminPhotographerListSort,
  type AdminPhotographerListStatusFilter,
  type PhotographerRecord,
  photographerDal,
} from "@/server/db/dal/photographer";
import { photographerSpecialityDal } from "@/server/db/dal/photographer-speciality";
import { photographerUploadDal } from "@/server/db/dal/photographer-upload";
import { specialityDal } from "@/server/db/dal/speciality";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/server/db/helpers/errors";
import { email } from "@/server/email";
import {
  ONBOARDING_STEPS,
  photographerSlugBaseFromName,
  photographerSlugSuffix,
} from "@/zod/helpers";
import type {
  PhotographerOnboardingSpecialityInput,
  PhotographerOnboardingState,
  ReviewPhotographerInput,
  SavePhotographerAvatarStepInput,
  SavePhotographerOnboardingStepInput,
  UpdatePhotographerProfileInput,
} from "@/zod/schema/photographer";

type DBClient = DBExecutor | DBTransaction;

const DEFAULT_LOCATION_COUNTRY = "india";
const PROFILE_ONBOARDING_STEP = ONBOARDING_STEPS[0];
const AVATAR_ONBOARDING_STEP = ONBOARDING_STEPS[1];
const SPECIALITIES_ONBOARDING_STEP = ONBOARDING_STEPS[2];
const CONTACT_ONBOARDING_STEP = ONBOARDING_STEPS[3];
const FINAL_ONBOARDING_STEP = CONTACT_ONBOARDING_STEP;
export const ADMIN_PHOTOGRAPHER_LIST_PAGE_SIZE = 20;
export const DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS: AdminPhotographerListStatusFilter =
  "all";
export const DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT: AdminPhotographerListSort =
  "review_queue";
export {
  ADMIN_PHOTOGRAPHER_LIST_SORTS,
  ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS,
};
export type { AdminPhotographerListSort, AdminPhotographerListStatusFilter };

export type AdminPhotographerReviewEntry = {
  id: string;
  userId: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  locationCity: PhotographerRecord["locationCity"];
  locationCountry: string;
  experienceYears: PhotographerRecord["experienceYears"];
  onboardingStep: PhotographerOnboardingState["onboardingStep"];
  isPublished: boolean;
  status: PhotographerOnboardingState["status"];
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    email: string;
    emailVerified: boolean;
    phone: string;
    isPublic: boolean;
  } | null;
  specialities: Array<{
    id: string;
    name: string;
    startingPrice: number;
  }>;
  uploads: Array<{
    displayOrder: number;
    id: string;
    imageUrl: string;
  }>;
  uploadsCount: number;
  portfolioPreview: string | null;
};
export type AdminPhotographerListEntry = {
  id: string;
  userId: string;
  name: string | null;
  avatar: string | null;
  onboardingStep: PhotographerOnboardingState["onboardingStep"];
  isPublished: boolean;
  status: PhotographerOnboardingState["status"];
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    email: string;
    emailVerified: boolean;
    phone: string;
    isPublic: boolean;
  } | null;
  specialitiesCount: number;
  uploadsCount: number;
  portfolioPreview: string | null;
};
export type AdminPhotographerEntriesPage = {
  entries: AdminPhotographerListEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
export type PublicPhotographerListEntry = {
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  experienceYears: PhotographerRecord["experienceYears"];
  id: string;
  locationCity: PhotographerRecord["locationCity"];
  locationCountry: string;
  name: string | null;
  slug: string;
  updatedAt: Date;
};
export type PublicPhotographerDetail = PublicPhotographerListEntry & {
  contact: {
    email: string;
    phone: string;
  } | null;
  hasPublicContact: boolean;
  specialities: Array<{
    id: string;
    name: string;
    startingPrice: number;
  }>;
  uploads: Array<{
    displayOrder: number;
    id: string;
    imageUrl: string;
  }>;
};

type PhotographerModerationState = Pick<PhotographerOnboardingState, "status">;
type PhotographerReviewNotification = {
  rejectionReason: string | undefined;
  reviewUrl: string;
  status: ReviewPhotographerInput["status"];
  submissionName: string;
  submissionType: string;
  userId: string;
};

function toPublicPhotographerListEntry(
  photographer: PhotographerRecord,
): PublicPhotographerListEntry | null {
  if (!photographer.slug) {
    return null;
  }

  return {
    id: photographer.id,
    slug: photographer.slug,
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
    rejectionReason: null,
    status: "draft",
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

function getDeterministicPhotographerSlugSuffix(attempt: number) {
  return attempt.toString(36).padStart(8, "0");
}

function isUniqueConstraintViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
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

async function ensurePhotographerSlug(
  photographer: PhotographerRecord,
  executor: DBClient = db,
  nameOverride?: string,
) {
  if (photographer.slug) {
    return photographer;
  }

  const name = nameOverride?.trim() || photographer.name?.trim();

  if (!name) {
    throw new BadRequestError(
      "Complete your profile details before continuing",
    );
  }
  const slugBase = photographerSlugBaseFromName(name);
  const attemptedSlugs = new Set<string>();

  for (let attempt = 0; ; attempt += 1) {
    const candidateSlug =
      attempt < 10
        ? `${slugBase}-${photographerSlugSuffix()}`
        : `${slugBase}-${getDeterministicPhotographerSlugSuffix(attempt - 10)}`;

    if (attemptedSlugs.has(candidateSlug)) {
      continue;
    }

    attemptedSlugs.add(candidateSlug);

    const existing = await photographerDal.getBySlug(candidateSlug, executor);

    if (existing && existing.id !== photographer.id) {
      continue;
    }

    try {
      return updatePhotographerRecord(
        photographer,
        {
          slug: candidateSlug,
        },
        executor,
      );
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        continue;
      }

      throw error;
    }
  }
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
      status: "draft",
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

async function assertReadyForPublication(
  photographer: PhotographerRecord,
  executor: DBClient = db,
) {
  const contact =
    await photographerContactController.getPhotographerContactByPhotographerId(
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

  const contact =
    await photographerContactController.getPhotographerContactByPhotographerId(
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
    rejectionReason: photographer.rejectionReason,
    status: photographer.status ?? "draft",
    specialities: specialities.map((speciality) => ({
      specialityId: speciality.specialityId,
      startingPrice: speciality.startingPrice,
    })),
    uploads: uploads.map((upload) => ({
      displayOrder: upload.displayOrder,
      id: upload.id,
      imageUrl: upload.imageUrl,
    })),
  };
}

async function buildPublicPhotographer(
  photographer: PhotographerRecord,
  {
    includeContactDetails = false,
  }: {
    includeContactDetails?: boolean;
  } = {},
  executor: DBClient = db,
): Promise<PublicPhotographerDetail> {
  const listing = toPublicPhotographerListEntry(photographer);

  if (!listing) {
    throw new NotFoundError("Photographer not found");
  }

  const [contact, specialities, uploads] = await Promise.all([
    photographerContactController.getPhotographerContactByPhotographerId(
      photographer.id,
      executor,
    ),
    photographerSpecialityDal.getByPhotographerId(photographer.id, executor),
    photographerUploadDal.getByPhotographerId(photographer.id, executor),
  ]);

  return {
    ...listing,
    contact:
      includeContactDetails && contact && contact.isPublic
        ? {
            email: contact.email,
            phone: contact.phone,
          }
        : null,
    hasPublicContact: contact?.isPublic ?? false,
    specialities: specialities.map((speciality) => ({
      id: speciality.specialityId,
      name: speciality.name,
      startingPrice: speciality.startingPrice,
    })),
    uploads: uploads.map((upload) => ({
      displayOrder: upload.displayOrder,
      id: upload.id,
      imageUrl: upload.imageUrl,
    })),
  };
}

function getPhotographerModerationState(
  photographer: PhotographerRecord,
): PhotographerModerationState {
  return {
    status: photographer.status ?? "draft",
  };
}

function groupRecordsByPhotographerId<
  TRecord extends { photographerId: string },
>(records: TRecord[]) {
  const recordsByPhotographerId = new Map<string, TRecord[]>();

  for (const record of records) {
    const existingRecords =
      recordsByPhotographerId.get(record.photographerId) ?? [];

    existingRecords.push(record);
    recordsByPhotographerId.set(record.photographerId, existingRecords);
  }

  return recordsByPhotographerId;
}

function buildAdminPhotographerListEntry(
  row: AdminPhotographerListRow,
  specialitiesCount: number,
  uploads: Array<{
    displayOrder: number;
    id: string;
    imageUrl: string;
  }>,
): AdminPhotographerListEntry {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    avatar: row.avatar,
    onboardingStep: normalizeOnboardingStep(row.onboardingStep),
    isPublished: row.isPublished,
    status: row.status ?? "draft",
    rejectionReason: row.rejectionReason,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contact: row.contactEmail
      ? {
          email: row.contactEmail,
          emailVerified: row.contactEmailVerified ?? false,
          phone: row.contactPhone ?? "",
          isPublic: row.contactIsPublic ?? false,
        }
      : null,
    specialitiesCount,
    uploadsCount: uploads.length,
    portfolioPreview: uploads[0]?.imageUrl ?? null,
  };
}

function assertApprovedPhotographerEditPermission(
  photographer: PhotographerRecord,
  surface: "contact" | "offerings" | "profile",
) {
  if (isApprovedPhotographer(photographer)) {
    return;
  }

  throw new ForbiddenError(
    `${
      surface.charAt(0).toUpperCase() + surface.slice(1)
    } updates are only available on approved photographer profiles.`,
  );
}

function getLockedResubmissionMessage(
  status: PhotographerOnboardingState["status"],
) {
  if (status === "rejected") {
    return "Rejected photographer profiles are locked until a resubmission flow is implemented.";
  }

  if (status === "on_hold") {
    return "On-hold photographer profiles are locked until a resubmission flow is implemented.";
  }

  return "Submitted photographer profiles can't be edited while review is pending.";
}

function assertPhotographerCanSaveOnboardingStep(
  photographer: PhotographerRecord,
  step: SavePhotographerOnboardingStepInput["step"],
) {
  if (isApprovedPhotographer(photographer)) {
    if (step === ONBOARDING_STEPS[2]) {
      return;
    }

    throw new ForbiddenError(
      step === ONBOARDING_STEPS[3]
        ? "Contact updates for approved photographer profiles must be made from the portfolio contact form."
        : "Approved photographer profiles can't use onboarding for profile edits.",
    );
  }

  const moderationState = getPhotographerModerationState(photographer);

  if (
    moderationState.status === "rejected" ||
    moderationState.status === "on_hold" ||
    isPhotographerSubmittedForReview(moderationState)
  ) {
    throw new ForbiddenError(
      getLockedResubmissionMessage(moderationState.status),
    );
  }
}

function getInvalidReviewTransitionMessage(state: PhotographerModerationState) {
  if (state.status === "draft") {
    return "Only submitted photographer profiles can be moderated.";
  }

  if (isApprovedPhotographer(state)) {
    return "Approved photographer profiles can only be put on hold.";
  }

  if (state.status === "on_hold") {
    return "On-hold photographer profiles can only be released back to approved or kept on hold.";
  }

  if (state.status === "rejected") {
    return "Rejected photographer profiles can only be re-approved or kept rejected.";
  }

  return "This moderation action isn't allowed for the current photographer state.";
}

function assertAllowedPhotographerReviewTransition(
  photographer: PhotographerRecord,
  nextStatus: ReviewPhotographerInput["status"],
) {
  const moderationState = getPhotographerModerationState(photographer);

  if (canReviewPhotographerWithStatus(moderationState, nextStatus)) {
    return moderationState;
  }

  throw new ForbiddenError(getInvalidReviewTransitionMessage(moderationState));
}

async function buildAdminPhotographerReviewEntry(
  photographer: PhotographerRecord,
  executor: DBClient = db,
): Promise<AdminPhotographerReviewEntry> {
  const [contact, specialities, uploads] = await Promise.all([
    photographerContactController.getPhotographerContactByPhotographerId(
      photographer.id,
      executor,
    ),
    photographerSpecialityDal.getByPhotographerId(photographer.id, executor),
    photographerUploadDal.getByPhotographerId(photographer.id, executor),
  ]);

  return {
    id: photographer.id,
    userId: photographer.userId,
    name: photographer.name,
    avatar: photographer.avatar,
    bio: photographer.bio,
    locationCity: photographer.locationCity,
    locationCountry: photographer.locationCountry,
    experienceYears: photographer.experienceYears,
    onboardingStep: normalizeOnboardingStep(photographer.onboardingStep),
    isPublished: photographer.isPublished,
    status: photographer.status ?? "draft",
    rejectionReason: photographer.rejectionReason,
    reviewedAt: photographer.reviewedAt,
    createdAt: photographer.createdAt,
    updatedAt: photographer.updatedAt,
    contact: contact
      ? {
          email: contact.email,
          emailVerified: contact.emailVerified,
          phone: contact.phone,
          isPublic: contact.isPublic,
        }
      : null,
    specialities: specialities.map((speciality) => ({
      id: speciality.specialityId,
      name: speciality.name,
      startingPrice: speciality.startingPrice,
    })),
    uploads: uploads.map((upload) => ({
      displayOrder: upload.displayOrder,
      id: upload.id,
      imageUrl: upload.imageUrl,
    })),
    uploadsCount: uploads.length,
    portfolioPreview: uploads[0]?.imageUrl ?? null,
  };
}

async function sendPhotographerReviewNotification(
  notification: PhotographerReviewNotification,
) {
  try {
    await email.notifySubmissionReviewed(notification);
  } catch (error) {
    console.error("Failed to send photographer review notification", {
      error,
      status: notification.status,
      userId: notification.userId,
    });
  }
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
    return this.savePhotographerOnboardingStep(userId, {
      step: AVATAR_ONBOARDING_STEP,
      avatar: input.avatar,
    });
  },

  async savePhotographerOnboardingStep(
    userId: string,
    input: SavePhotographerOnboardingStepInput,
  ) {
    return db.transaction(async (tx) => {
      const existing = await ensurePhotographerByUserId(userId, tx);
      assertPhotographerCanSaveOnboardingStep(existing, input.step);

      switch (input.step) {
        case ONBOARDING_STEPS[0]: {
          const photographerWithSlug = await ensurePhotographerSlug(
            existing,
            tx,
            input.name,
          );
          const photographer = await updatePhotographerRecord(
            photographerWithSlug,
            {
              name: input.name,
              bio: input.bio?.trim() ? input.bio : null,
              locationCity: input.locationCity,
              locationCountry: DEFAULT_LOCATION_COUNTRY,
              experienceYears: input.experienceYears,
              onboardingStep: getProgressedOnboardingStep(
                photographerWithSlug.onboardingStep,
                PROFILE_ONBOARDING_STEP,
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
              avatar: input.avatar,
              onboardingStep: getProgressedOnboardingStep(
                existing.onboardingStep,
                AVATAR_ONBOARDING_STEP,
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
                SPECIALITIES_ONBOARDING_STEP,
              ),
            },
            tx,
          );

          return buildOnboardingState(photographer, tx);
        }

        case ONBOARDING_STEPS[3]: {
          await photographerContactController.savePhotographerContactByPhotographerId(
            existing.id,
            input.contact,
            tx,
          );
          if (isApprovedPhotographer(existing)) {
            const photographer = await updatePhotographerRecord(
              existing,
              {
                onboardingStep: FINAL_ONBOARDING_STEP,
              },
              tx,
            );

            return buildOnboardingState(photographer, tx);
          }

          await assertReadyForPublication(existing, tx);

          const photographer = await updatePhotographerRecord(
            existing,
            {
              onboardingStep: FINAL_ONBOARDING_STEP,
              isPublished: false,
              rejectionReason: null,
              reviewedAt: null,
              reviewedBy: null,
              status: "submitted",
            },
            tx,
          );

          return buildOnboardingState(photographer, tx);
        }

        default:
          throw new BadRequestError("Invalid onboarding step");
      }
    });
  },

  async getPhotographerByUserId(userId: string) {
    return getPhotographerByUserIdOrThrow(userId);
  },

  async getPublicPhotographerById(
    id: string,
    options?: {
      includeContactDetails?: boolean;
    },
  ) {
    const photographer = await photographerDal.getById(id);

    if (!photographer || !photographer.isPublished) {
      throw new NotFoundError("Photographer not found");
    }

    return buildPublicPhotographer(photographer, options);
  },

  async getPublicPhotographerBySlug(
    slug: string,
    options?: {
      includeContactDetails?: boolean;
    },
  ) {
    const photographer = await photographerDal.getBySlug(slug);

    if (!photographer || !photographer.isPublished) {
      throw new NotFoundError("Photographer not found");
    }

    return buildPublicPhotographer(photographer, options);
  },

  async getPublicPhotographers() {
    const photographers = await photographerDal.getPublished();

    return photographers.flatMap((photographer) => {
      const listing = toPublicPhotographerListEntry(photographer);
      return listing ? [listing] : [];
    });
  },

  async getPublicPhotographersByIds(ids: string[]) {
    const photographers = await photographerDal.getPublishedByIds(ids);

    return photographers.flatMap((photographer) => {
      const listing = toPublicPhotographerListEntry(photographer);
      return listing ? [listing] : [];
    });
  },

  async getAdminPhotographerEntriesPage({
    page = 1,
    query,
    sort = DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
    status = DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  }: {
    page?: number;
    query?: string;
    sort?: AdminPhotographerListSort;
    status?: AdminPhotographerListStatusFilter;
  } = {}): Promise<AdminPhotographerEntriesPage> {
    const normalizedPage = Math.max(1, Math.trunc(page));
    const totalCount = await photographerDal.countAdminList({
      query,
      status,
    });
    const totalPages = Math.max(
      1,
      Math.ceil(totalCount / ADMIN_PHOTOGRAPHER_LIST_PAGE_SIZE),
    );
    const currentPage = Math.min(normalizedPage, totalPages);
    const rows = await photographerDal.getAdminListPage({
      limit: ADMIN_PHOTOGRAPHER_LIST_PAGE_SIZE,
      offset: (currentPage - 1) * ADMIN_PHOTOGRAPHER_LIST_PAGE_SIZE,
      query,
      sort,
      status,
    });
    const photographerIds = rows.map((row) => row.id);
    const [specialities, uploads] = await Promise.all([
      photographerSpecialityDal.getByPhotographerIds(photographerIds),
      photographerUploadDal.getByPhotographerIds(photographerIds),
    ]);
    const specialitiesByPhotographerId =
      groupRecordsByPhotographerId(specialities);
    const uploadsByPhotographerId = groupRecordsByPhotographerId(uploads);

    return {
      entries: rows.map((row) =>
        buildAdminPhotographerListEntry(
          row,
          specialitiesByPhotographerId.get(row.id)?.length ?? 0,
          (uploadsByPhotographerId.get(row.id) ?? []).map((upload) => ({
            displayOrder: upload.displayOrder,
            id: upload.id,
            imageUrl: upload.imageUrl,
          })),
        ),
      ),
      page: currentPage,
      pageSize: ADMIN_PHOTOGRAPHER_LIST_PAGE_SIZE,
      totalCount,
      totalPages,
    };
  },

  async getAdminPhotographerEntryById(
    id: string,
  ): Promise<AdminPhotographerReviewEntry> {
    const photographer = await photographerDal.getById(id);

    if (!photographer) {
      throw new NotFoundError("Photographer not found");
    }

    return buildAdminPhotographerReviewEntry(photographer);
  },

  async reviewPhotographer(
    id: string,
    reviewerId: string,
    input: ReviewPhotographerInput,
  ): Promise<AdminPhotographerReviewEntry> {
    const { entry, notification } = await db.transaction(async (tx) => {
      const photographer = await photographerDal.getById(id, tx);

      if (!photographer) {
        throw new NotFoundError("Photographer not found");
      }

      assertAllowedPhotographerReviewTransition(photographer, input.status);

      if (input.status === "approved") {
        await assertReadyForPublication(photographer, tx);
        await ensurePhotographerSlug(photographer, tx);
      }

      const reviewedPhotographer = await photographerDal.updateById(
        id,
        input.status === "approved"
          ? {
              isPublished: true,
              rejectionReason: null,
              reviewedAt: new Date(),
              reviewedBy: reviewerId,
              status: "approved",
            }
          : {
              isPublished: false,
              rejectionReason: input.rejectionReason,
              reviewedAt: new Date(),
              reviewedBy: reviewerId,
              status: input.status,
            },
        tx,
      );

      if (!reviewedPhotographer) {
        throw new InternalError("Failed to review photographer");
      }

      return {
        entry: await buildAdminPhotographerReviewEntry(
          reviewedPhotographer,
          tx,
        ),
        notification: {
          rejectionReason: input.rejectionReason ?? undefined,
          reviewUrl: `${env.NEXT_PUBLIC_BASE_URL}/dashboard/portfolio`,
          status: input.status,
          submissionName:
            reviewedPhotographer.name?.trim() || "photographer profile",
          submissionType: "profile",
          userId: reviewedPhotographer.userId,
        } satisfies PhotographerReviewNotification,
      };
    });

    await sendPhotographerReviewNotification(notification);

    return entry;
  },

  async updatePhotographerProfile(
    userId: string,
    input: UpdatePhotographerProfileInput,
  ) {
    const existing = await getPhotographerByUserIdOrThrow(userId);
    assertApprovedPhotographerEditPermission(existing, "profile");
    const photographerWithSlug = await ensurePhotographerSlug(
      existing,
      db,
      input.name,
    );
    const onboardingStep = getProgressedOnboardingStep(
      photographerWithSlug.onboardingStep,
      PROFILE_ONBOARDING_STEP,
    );
    const data = {
      ...input,
      bio: input.bio?.trim() ? input.bio : null,
      onboardingStep,
    };

    if (
      Object.keys(input).length === 0 &&
      photographerWithSlug.onboardingStep === onboardingStep
    ) {
      return photographerWithSlug;
    }

    if (!hasChanges(photographerWithSlug, data)) {
      return photographerWithSlug;
    }

    const photographer = await photographerDal.updateById(
      photographerWithSlug.id,
      data,
    );

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
