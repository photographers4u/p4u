import { notificationController } from "@/server/db/controller/notification";
import { bookmarkDal } from "@/server/db/dal/bookmark";
import { photographerDal } from "@/server/db/dal/photographer";
import { BadRequestError, InternalError } from "@/server/db/helpers/errors";
import type {
  BookmarkIdentifier,
  BookmarkToggleInput,
} from "@/zod/schema/bookmark";

function normalizeBookmarkValue(value: string) {
  return bookmarkDal.normalizeValue(value);
}

async function getBookmarkTargetPhotographer(
  identifier: BookmarkIdentifier,
  value: string,
) {
  if (identifier !== "photographer") {
    throw new BadRequestError("Unsupported bookmark target");
  }

  const photographer = await photographerDal.getById(value);

  if (!photographer || !photographer.isPublished) {
    throw new BadRequestError("Photographer not found");
  }

  return photographer;
}

async function notifyPhotographerOfNewBookmark(
  photographer: NonNullable<
    Awaited<ReturnType<typeof photographerDal.getById>>
  >,
  bookmarkingUserId: string,
) {
  if (photographer.userId === bookmarkingUserId) {
    return;
  }

  try {
    await notificationController.create({
      body: null,
      link: photographer.slug ? `/p/${photographer.slug}` : null,
      title: "Someone saved your profile",
      type: "bookmark_received",
      userId: photographer.userId,
    });
  } catch (error) {
    console.error("Failed to create bookmark notification", {
      error,
      photographerId: photographer.id,
    });
  }
}

export const bookmarkController = {
  async getValuesByIdentifier(userId: string, identifier: BookmarkIdentifier) {
    return bookmarkDal.getValuesByIdentifier(userId, identifier);
  },

  async hasBookmark(
    userId: string,
    identifier: BookmarkIdentifier,
    value: string,
  ) {
    const normalizedValue = normalizeBookmarkValue(value);

    if (!normalizedValue) {
      return false;
    }

    return Boolean(
      await bookmarkDal.hasBookmark(userId, identifier, normalizedValue),
    );
  },

  async toggleBookmark(userId: string, input: BookmarkToggleInput) {
    const value = normalizeBookmarkValue(input.value);

    if (!value) {
      throw new BadRequestError("Value is required");
    }

    const existing = await bookmarkDal.hasBookmark(
      userId,
      input.identifier,
      value,
    );

    if (existing) {
      const deleted = await bookmarkDal.deleteBookmark(
        userId,
        input.identifier,
        value,
      );

      if (!deleted) {
        throw new InternalError("Failed to remove bookmark");
      }

      return {
        isBookmarked: false,
        value,
      };
    }

    const photographer = await getBookmarkTargetPhotographer(
      input.identifier,
      value,
    );

    const created = await bookmarkDal.createBookmark(
      userId,
      input.identifier,
      value,
    );

    if (!created) {
      throw new InternalError("Failed to create bookmark");
    }

    await notifyPhotographerOfNewBookmark(photographer, userId);

    return {
      isBookmarked: true,
      value,
    };
  },
};
