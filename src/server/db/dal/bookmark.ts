import { and, desc, eq } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { bookmarks } from "@/server/db/schema";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

type DBClient = DBExecutor | DBTransaction;

function normalizeBookmarkValue(value: string) {
  return value.trim();
}

export const bookmarkDal = {
  normalizeValue: normalizeBookmarkValue,

  async getValuesByIdentifier(userId: string, identifier: BookmarkIdentifier) {
    const rows = await db
      .select({ value: bookmarks.value })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.identifier, identifier),
        ),
      )
      .orderBy(desc(bookmarks.createdAt));

    return rows.map((row) => row.value);
  },

  async hasBookmark(
    userId: string,
    identifier: BookmarkIdentifier,
    value: string,
  ) {
    const normalizedValue = normalizeBookmarkValue(value);
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.identifier, identifier),
          eq(bookmarks.value, normalizedValue),
        ),
      );

    return bookmark ?? null;
  },

  async createBookmark(
    userId: string,
    identifier: BookmarkIdentifier,
    value: string,
  ) {
    const normalizedValue = normalizeBookmarkValue(value);
    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        userId,
        identifier,
        value: normalizedValue,
      })
      .returning();

    return bookmark ?? null;
  },

  async deleteBookmark(
    userId: string,
    identifier: BookmarkIdentifier,
    value: string,
  ) {
    const normalizedValue = normalizeBookmarkValue(value);
    const [bookmark] = await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.identifier, identifier),
          eq(bookmarks.value, normalizedValue),
        ),
      )
      .returning();

    return bookmark ?? null;
  },

  async deleteAllByTarget(
    identifier: BookmarkIdentifier,
    value: string,
    executor: DBClient = db,
  ) {
    const normalizedValue = normalizeBookmarkValue(value);

    return executor
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.identifier, identifier),
          eq(bookmarks.value, normalizedValue),
        ),
      )
      .returning();
  },
};
