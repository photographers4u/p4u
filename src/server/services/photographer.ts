import "server-only";

import type { PublicPhotographerExploreFilters } from "@/lib/public-photographer-explore";
import { getAuthSession } from "@/server/auth/session";
import { photographerController } from "@/server/db/controller/photographer";
import { photographerContactController } from "@/server/db/controller/photographer-contact";
import { NotFoundError } from "@/server/db/helpers/errors";
import type {
  PhotographerContact,
  SavePhotographerContactInput,
} from "@/zod/schema";
import type {
  AdminPhotographerListSort,
  AdminPhotographerListStatusFilter,
  Photographer,
  PhotographerOnboardingState,
  ReviewPhotographerInput,
  SavePhotographerAvatarStepInput,
  SavePhotographerOnboardingStepInput,
  UpdatePhotographerProfileInput,
} from "@/zod/schema/photographer";
import {
  adminPhotographerListSortValues as ADMIN_PHOTOGRAPHER_LIST_SORTS,
  adminPhotographerListStatusFilterValues as ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  photographerSchema,
} from "@/zod/schema/photographer";
export {
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
};
export {
  ADMIN_PHOTOGRAPHER_LIST_SORTS,
  ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS,
};
export type { AdminPhotographerListSort, AdminPhotographerListStatusFilter };

export type AdminPhotographerEntriesPage = Awaited<
  ReturnType<typeof photographerController.getAdminPhotographerEntriesPage>
>;
export type AdminPhotographerListEntry =
  AdminPhotographerEntriesPage["entries"][number];
export type AdminPhotographerReviewEntry = Awaited<
  ReturnType<typeof photographerController.getAdminPhotographerEntryById>
>;
export type PublicPhotographerDetail = Awaited<
  ReturnType<typeof photographerController.getPublicPhotographerBySlug>
>;
export type PublicPhotographerExplorePage = Awaited<
  ReturnType<typeof photographerController.getPublicPhotographerExplorePage>
>;
export type PublicPhotographerExploreEntry =
  PublicPhotographerExplorePage["photographers"][number];
export type PublicPhotographerListEntry = Awaited<
  ReturnType<typeof photographerController.getPublicPhotographers>
>[number];

function toPhotographer(
  photographer: Awaited<
    ReturnType<typeof photographerController.getPhotographerByUserId>
  >,
): Photographer {
  return photographerSchema.parse({
    ...photographer,
    createdAt: photographer.createdAt.toISOString(),
    slug: photographer.slug ?? null,
    updatedAt: photographer.updatedAt.toISOString(),
    reviewedAt: photographer.reviewedAt?.toISOString() ?? null,
    status: photographer.status ?? "draft",
  });
}

export async function getPhotographerOnboardingByUserId(
  userId: string,
): Promise<PhotographerOnboardingState> {
  return photographerController.getPhotographerOnboardingByUserId(userId);
}

export async function getPhotographerProfileByUserId(
  userId: string,
): Promise<Photographer> {
  return toPhotographer(
    await photographerController.getPhotographerByUserId(userId),
  );
}

export async function getPhotographerContactByUserId(
  userId: string,
): Promise<PhotographerContact | null> {
  return photographerContactController.getPhotographerContactByUserId(userId);
}

export async function getPublicPhotographerBySlug(
  slug: string,
  options?: {
    includeContactDetails?: boolean;
  },
): Promise<PublicPhotographerDetail> {
  return photographerController.getPublicPhotographerBySlug(slug, options);
}

export async function getPublicPhotographers(): Promise<
  PublicPhotographerListEntry[]
> {
  return photographerController.getPublicPhotographers();
}

export async function getPublicPhotographerExplorePage(
  filters: PublicPhotographerExploreFilters,
  options?: {
    page?: number;
    pageSize?: number;
  },
): Promise<PublicPhotographerExplorePage> {
  return photographerController.getPublicPhotographerExplorePage(
    filters,
    options,
  );
}

export async function getPublicPhotographersByIds(
  ids: string[],
): Promise<PublicPhotographerListEntry[]> {
  return photographerController.getPublicPhotographersByIds(ids);
}

export async function getAdminPhotographerEntriesPage(filters?: {
  page?: number;
  query?: string;
  sort?: AdminPhotographerListSort;
  status?: AdminPhotographerListStatusFilter;
}): Promise<AdminPhotographerEntriesPage> {
  return photographerController.getAdminPhotographerEntriesPage(filters);
}

export async function getAdminPhotographerEntryById(
  id: string,
): Promise<AdminPhotographerReviewEntry> {
  return photographerController.getAdminPhotographerEntryById(id);
}

async function getCurrentUserId(headers: Headers) {
  const session = await getAuthSession({ headers });
  return session?.user?.id ?? null;
}

export async function getCurrentPhotographer(
  headers: Headers,
): Promise<Photographer | null> {
  const userId = await getCurrentUserId(headers);

  if (!userId) {
    return null;
  }

  try {
    return await getPhotographerProfileByUserId(userId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}

export async function getCurrentPhotographerOnboarding(
  headers: Headers,
): Promise<PhotographerOnboardingState | null> {
  const userId = await getCurrentUserId(headers);

  if (!userId) {
    return null;
  }

  return getPhotographerOnboardingByUserId(userId);
}

export async function getCurrentPhotographerContact(
  headers: Headers,
): Promise<PhotographerContact | null> {
  const userId = await getCurrentUserId(headers);

  if (!userId) {
    return null;
  }

  try {
    return await getPhotographerContactByUserId(userId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}

export async function savePhotographerAvatarByUserId(
  userId: string,
  input: SavePhotographerAvatarStepInput,
) {
  return photographerController.savePhotographerAvatarStep(userId, input);
}

export async function updatePhotographerProfileByUserId(
  userId: string,
  input: UpdatePhotographerProfileInput,
) {
  return photographerController.updatePhotographerProfile(userId, input);
}

export async function savePhotographerOnboardingStepByUserId(
  userId: string,
  input: SavePhotographerOnboardingStepInput,
) {
  return photographerController.savePhotographerOnboardingStep(userId, input);
}

export async function savePhotographerContactByUserId(
  userId: string,
  input: SavePhotographerContactInput,
) {
  return photographerContactController.savePhotographerContactByUserId(
    userId,
    input,
  );
}

export async function reviewPhotographerById(
  id: string,
  reviewerId: string,
  input: ReviewPhotographerInput,
) {
  return photographerController.reviewPhotographer(id, reviewerId, input);
}

export async function deletePhotographerByUserId(userId: string) {
  return photographerController.deletePhotographer(userId);
}
