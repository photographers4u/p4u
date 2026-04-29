import { headers } from "next/headers";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { sanitizeBookmarkStore } from "@/lib/bookmark-store";
import { BookmarkProvider } from "@/lib/bookmarks-context";
import {
  getPublicPhotographerExploreFilters,
  getPublicPhotographerExplorePageFromParams,
  PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
} from "@/lib/public-photographer-explore";
import { getAuthSession } from "@/server/auth/session";
import { getBookmarkValuesByIdentifier } from "@/server/services/bookmark";
import { getPublicPhotographerExplorePage } from "@/server/services/photographer";
import { getSpecialityFilterOptions } from "@/server/services/speciality";
import { PhotographersBrowser } from "./photographers-browser";

type PhotographersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PhotographersPage({
  searchParams,
}: PhotographersPageProps) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const initialFilters = getPublicPhotographerExploreFilters(params);
  const requestedPage = getPublicPhotographerExplorePageFromParams(params);
  const sessionPromise = getAuthSession({ headers: requestHeaders });
  const bookmarkedPhotographerIdsPromise = sessionPromise.then((session) =>
    session?.user
      ? getBookmarkValuesByIdentifier(session.user.id, "photographer")
      : [],
  );
  const [initialPage, session, bookmarkedPhotographerIds, specialities] =
    await Promise.all([
      getPublicPhotographerExplorePage(initialFilters, {
        page: 1,
        pageSize: requestedPage * PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
      }),
      sessionPromise,
      bookmarkedPhotographerIdsPromise,
      getSpecialityFilterOptions(),
    ]);
  const initialLoadedPageCount = Math.max(
    1,
    Math.ceil(
      initialPage.photographers.length / PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
    ),
  );
  const initialBookmarkStore = sanitizeBookmarkStore({
    photographer: bookmarkedPhotographerIds,
  });

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <BookmarkProvider
            initialStore={initialBookmarkStore}
            session={session}
          >
            <PhotographersBrowser
              initialFilters={initialFilters}
              initialLoadedPageCount={initialLoadedPageCount}
              initialPage={initialPage}
              availableSpecialities={specialities}
            />
          </BookmarkProvider>
        </section>
      </main>
      <Footer />
    </>
  );
}
