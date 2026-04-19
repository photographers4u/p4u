"use client";

import type { InferResponseType } from "hono/client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import type { AuthClientSession } from "@/lib/auth-client";
import {
  type BookmarkStore,
  createEmptyBookmarkStore,
  sanitizeBookmarkStore,
} from "@/lib/bookmark-store";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

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
type BookmarkCollectionResponse = InferResponseType<
  typeof apiClient.bookmark.$get,
  200
>;
type BookmarkToggleResponse = InferResponseType<
  typeof apiClient.bookmark.toggle.$post,
  200
>;

function getPendingKey(identifier: BookmarkIdentifier, value: string) {
  return `${identifier}:${value}`;
}

export function BookmarkProvider({
  children,
  initialStore,
  session,
}: {
  children: React.ReactNode;
  initialStore?: BookmarkStore;
  session: AuthClientSession | null;
}) {
  const [bookmarks, setBookmarks] = useState<BookmarkStore>(() =>
    sanitizeBookmarkStore(initialStore),
  );
  const [isLoaded, setIsLoaded] = useState(
    !session?.user || Boolean(initialStore),
  );
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user) {
      setBookmarks(createEmptyBookmarkStore());
      setIsLoaded(true);
      return;
    }

    if (initialStore) {
      setBookmarks(sanitizeBookmarkStore(initialStore));
      setIsLoaded(true);
      return;
    }

    let isActive = true;

    async function loadBookmarks() {
      setIsLoaded(false);

      try {
        const response = await apiClient.bookmark.$get();
        const { errorMessage, payload } =
          await readApiResponse<BookmarkCollectionResponse>(response);

        if (!response.ok || !payload) {
          throw new Error(errorMessage ?? "Couldn't load bookmarks.");
        }

        if (!isActive) {
          return;
        }

        setBookmarks(sanitizeBookmarkStore(payload));
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
  }, [initialStore, session?.user]);

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
      const { errorMessage, payload } =
        await readApiResponse<BookmarkToggleResponse>(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "Couldn't update the bookmark.");
        return null;
      }

      const isBookmarked = payload?.isBookmarked === true;

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
