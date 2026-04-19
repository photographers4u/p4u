import "server-only";

import {
  type BookmarkStore,
  sanitizeBookmarkStore,
} from "@/lib/bookmark-store";
import { bookmarkController } from "@/server/db/controller/bookmark";
import { bookmarkIdentifierValues } from "@/zod/helpers";
import type {
  BookmarkIdentifier,
  BookmarkToggleInput,
} from "@/zod/schema/bookmark";

export type { BookmarkStore } from "@/lib/bookmark-store";

export async function getBookmarkValuesByIdentifier(
  userId: string,
  identifier: BookmarkIdentifier,
) {
  return bookmarkController.getValuesByIdentifier(userId, identifier);
}

export async function hasBookmarkByUserId(
  userId: string,
  identifier: BookmarkIdentifier,
  value: string,
) {
  return bookmarkController.hasBookmark(userId, identifier, value);
}

export async function getBookmarkStoreByUserId(
  userId: string,
): Promise<BookmarkStore> {
  const entries = await Promise.all(
    bookmarkIdentifierValues.map(async (identifier) => {
      const values = await bookmarkController.getValuesByIdentifier(
        userId,
        identifier,
      );

      return [identifier, values] as const;
    }),
  );

  return sanitizeBookmarkStore(
    Object.fromEntries(entries) as Partial<BookmarkStore>,
  );
}

export async function toggleBookmarkByUserId(
  userId: string,
  input: BookmarkToggleInput,
) {
  return bookmarkController.toggleBookmark(userId, input);
}
