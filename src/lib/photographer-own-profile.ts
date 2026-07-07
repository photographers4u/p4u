import type { Photographer } from "@/zod/schema/photographer";

export type OwnPhotographerProfileLink = {
  href: string;
  matchPath: string;
  avatarUrl: string | null;
};

// Unpublished profiles 404 on the bare public URL, so route the owner
// through the existing preview flow until their profile goes live.
export function getOwnPhotographerProfileLink(
  photographer: Photographer | null,
): OwnPhotographerProfileLink | null {
  if (!photographer?.slug) {
    return null;
  }

  return {
    href: `/p/${photographer.slug}${photographer.isPublished ? "" : "?preview=1"}`,
    matchPath: `/p/${photographer.slug}`,
    avatarUrl: photographer.avatar,
  };
}
