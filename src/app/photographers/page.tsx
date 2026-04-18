import { headers } from "next/headers";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  getPublicPhotographerExploreFilters,
  getPublicPhotographerExplorePageFromParams,
  PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
} from "@/lib/public-photographer-explore";
import { getAuthSession } from "@/server/auth/session";
import { specialityDal } from "@/server/db/dal/speciality";
import { getPublicPhotographerExplorePage } from "@/server/services/photographer";
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
  const [initialPage, session, specialities] = await Promise.all([
    getPublicPhotographerExplorePage(initialFilters, {
      page: 1,
      pageSize: requestedPage * PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
    }),
    getAuthSession({ headers: requestHeaders }),
    specialityDal.getAll(),
  ]);
  const initialLoadedPageCount = Math.max(
    1,
    Math.ceil(
      initialPage.photographers.length / PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
    ),
  );

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#f8fafc_38%,#ffffff_100%)]">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <PhotographersBrowser
            initialFilters={initialFilters}
            initialLoadedPageCount={initialLoadedPageCount}
            initialPage={initialPage}
            availableSpecialities={specialities.map((speciality) => ({
              name: speciality.name,
              slug: speciality.slug,
            }))}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
