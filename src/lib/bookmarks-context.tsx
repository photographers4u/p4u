"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import type { AuthClientSession } from "@/lib/auth-client";
import { bookmarkIdentifierValues } from "@/zod/helpers";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

type BookmarkStore = Record<BookmarkIdentifier, string[]>;

type BookmarkContextValue = {
  isAuthenticated: boolean;
  isLoaded: boolean;
  isBookmarked: (identifier: BookmarkIdentifier, value: string) => boolean;
  isPending: (identifier: BookmarkIdentifier, value: string) => boolean;
  toggleBookmark: (
    identifier: BookmarkIdentifier,
    value: string,
  ) => Promise<boolean | null>;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

function createEmptyBookmarkStore() {
  const store = {} as BookmarkStore;

  for (const identifier of bookmarkIdentifierValues) {
    store[identifier] = [];
  }

  return store;
}

function getPendingKey(identifier: BookmarkIdentifier, value: string) {
  return `${identifier}:${value}`;
}

export function BookmarkProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AuthClientSession | null;
}) {
  const [bookmarks, setBookmarks] = useState<BookmarkStore>(
    createEmptyBookmarkStore,
  );
  const [isLoaded, setIsLoaded] = useState(!session?.user);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user) {
      setBookmarks(createEmptyBookmarkStore());
      setIsLoaded(true);
      return;
    }

    let isActive = true;

    async function loadBookmarks() {
      setIsLoaded(false);

      try {
        const nextBookmarks = createEmptyBookmarkStore();

        for (const identifier of bookmarkIdentifierValues) {
          const response = await apiClient.bookmark[":identifier"].$get({
            param: { identifier },
          });
          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              getApiErrorMessage(payload) ?? "Couldn't load bookmarks.",
            );
          }

          if (
            payload &&
            typeof payload === "object" &&
            "values" in payload &&
            Array.isArray(payload.values)
          ) {
            nextBookmarks[identifier] = payload.values.filter(
              (value): value is string => typeof value === "string",
            );
          }
        }

        if (!isActive) {
          return;
        }

        setBookmarks(nextBookmarks);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setBookmarks(createEmptyBookmarkStore());
        toast.error(
          error instanceof Error ? error.message : "Couldn't load bookmarks.",
        );
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    }

    void loadBookmarks();

    return () => {
      isActive = false;
    };
  }, [session?.user?.id]);

  async function toggleBookmark(
    identifier: BookmarkIdentifier,
    value: string,
  ): Promise<boolean | null> {
    const normalizedValue = value.trim();

    if (!session?.user) {
      return null;
    }

    if (!normalizedValue) {
      toast.error("Value is required.");
      return null;
    }

    const pendingKey = getPendingKey(identifier, normalizedValue);
    setPendingKeys((current) =>
      current.includes(pendingKey) ? current : [...current, pendingKey],
    );

    try {
      const response = await apiClient.bookmark.toggle.$post({
        json: {
          identifier,
          value: normalizedValue,
        },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          getApiErrorMessage(payload) ?? "Couldn't update the bookmark.",
        );
        return null;
      }

      const isBookmarked = !!(
        payload &&
        typeof payload === "object" &&
        "isBookmarked" in payload &&
        payload.isBookmarked === true
      );

      setBookmarks((current) => {
        const currentValues = current[identifier];

        return {
          ...current,
          [identifier]: isBookmarked
            ? Array.from(new Set([...currentValues, normalizedValue]))
            : currentValues.filter((entry) => entry !== normalizedValue),
        };
      });

      return isBookmarked;
    } catch {
      toast.error("Couldn't update the bookmark.");
      return null;
    } finally {
      setPendingKeys((current) =>
        current.filter((entry) => entry !== pendingKey),
      );
    }
  }

  return (
    <BookmarkContext.Provider
      value={{
        isAuthenticated: !!session?.user,
        isLoaded,
        isBookmarked(identifier, value) {
          return bookmarks[identifier].includes(value.trim());
        },
        isPending(identifier, value) {
          return pendingKeys.includes(getPendingKey(identifier, value.trim()));
        },
        toggleBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);

  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider.");
  }

  return context;
}
