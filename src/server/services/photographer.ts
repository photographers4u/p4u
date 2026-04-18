import "server-only";

import type { PhotographerContact } from "@/zod/schema";
import type {
  Photographer,
  PhotographerOnboardingState,
} from "@/zod/schema/photographer";
import { photographerSchema } from "@/zod/schema/photographer";
import { getAuthSession } from "@/server/auth/session";
import { photographerController } from "@/server/db/controller/photographer";
import { photographerContactController } from "@/server/db/controller/photographer-contact";
import { NotFoundError } from "@/server/db/helpers/errors";

function toPhotographer(
  photographer: Awaited<
    ReturnType<typeof photographerController.getPhotographerByUserId>
  >,
): Photographer {
  return photographerSchema.parse({
    ...photographer,
    createdAt: photographer.createdAt.toISOString(),
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
  return toPhotographer(await photographerController.getPhotographerByUserId(userId));
}

export async function getPhotographerContactByUserId(
  userId: string,
): Promise<PhotographerContact | null> {
  return photographerContactController.getPhotographerContactByUserId(userId);
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
