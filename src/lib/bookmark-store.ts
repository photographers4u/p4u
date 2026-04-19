import { bookmarkIdentifierValues } from "@/zod/helpers";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

export type BookmarkStore = Record<BookmarkIdentifier, string[]>;

export function createEmptyBookmarkStore(): BookmarkStore {
  const store = {} as BookmarkStore;

  for (const identifier of bookmarkIdentifierValues) {
    store[identifier] = [];
  }

  return store;
}

function normalizeBookmarkValues(values: readonly string[] | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

export function sanitizeBookmarkStore(
  value:
    | Partial<
        Record<BookmarkIdentifier, readonly string[] | string[] | undefined>
      >
    | null
    | undefined,
): BookmarkStore {
  const store = createEmptyBookmarkStore();

  if (!value) {
    return store;
  }

  for (const identifier of bookmarkIdentifierValues) {
    store[identifier] = normalizeBookmarkValues(value[identifier]);
  }

  return store;
}
