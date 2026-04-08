import { bookmarkDal } from "@/server/db/dal/bookmark";
import { BadRequestError, InternalError } from "@/server/db/helpers/errors";
import type {
  BookmarkIdentifier,
  BookmarkToggleInput,
} from "@/zod/schema/bookmark";

function normalizeBookmarkValue(value: string) {
  return bookmarkDal.normalizeValue(value);
}

export const bookmarkController = {
  async getValuesByIdentifier(userId: string, identifier: BookmarkIdentifier) {
    return bookmarkDal.getValuesByIdentifier(userId, identifier);
  },

  async toggleBookmark(userId: string, input: BookmarkToggleInput) {
    const value = normalizeBookmarkValue(input.value);

    if (!value) {
      throw new BadRequestError("Value is required");
    }

    const existing = await bookmarkDal.hasBookmark(userId, input.identifier, value);

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

    const created = await bookmarkDal.createBookmark(
      userId,
      input.identifier,
      value,
    );

    if (!created) {
      throw new InternalError("Failed to create bookmark");
    }

    return {
      isBookmarked: true,
      value,
    };
  },
};
