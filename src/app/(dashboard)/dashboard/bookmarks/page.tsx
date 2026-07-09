import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import { PhotographerCard } from "@/components/photographer-card";
import { Button } from "@/components/ui/button";
import { sanitizeBookmarkStore } from "@/lib/bookmark-store";
import { BookmarkProvider } from "@/lib/bookmarks-context";
import { getAuthSession } from "@/server/auth/session";
import { getBookmarkValuesByIdentifier } from "@/server/services/bookmark";
import { getContactedPhotographerIdsByUserId } from "@/server/services/photographer-event";
import { getPublicPhotographersByIds } from "@/server/services/photographer";

function SectionHeading({
  title,
  count,
  singularNoun,
  pluralNoun,
}: {
  title: string;
  count: number;
  singularNoun: string;
  pluralNoun: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} {count === 1 ? singularNoun : pluralNoun}
      </p>
    </div>
  );
}

export default async function DashboardBookmarksPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const [bookmarkedValues, contactedIds] = await Promise.all([
    getBookmarkValuesByIdentifier(session.user.id, "photographer"),
    getContactedPhotographerIdsByUserId(session.user.id),
  ]);
  const [savedPhotographers, contactedPhotographers] = await Promise.all([
    getPublicPhotographersByIds(bookmarkedValues),
    getPublicPhotographersByIds(contactedIds),
  ]);
  const initialBookmarkStore = sanitizeBookmarkStore({
    photographer: bookmarkedValues,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          className="mb-0"
          title="Saved & contacted"
          subtitle="Photographers you've wishlisted or reached out to."
        />
        <Button asChild variant="outline">
          <Link href="/photographers">Browse photographers</Link>
        </Button>
      </div>

      <BookmarkProvider initialStore={initialBookmarkStore} session={session}>
        <section className="space-y-4">
          <SectionHeading
            title="Saved"
            count={savedPhotographers.length}
            singularNoun="saved photographer"
            pluralNoun="saved photographers"
          />

          {savedPhotographers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Open a photographer profile and save it to see it here.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {savedPhotographers.map((photographer) => (
                <PhotographerCard
                  key={photographer.id}
                  photographer={photographer}
                  eyebrow="Saved photographer"
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Contacted"
            count={contactedPhotographers.length}
            singularNoun="photographer contacted"
            pluralNoun="photographers contacted"
          />

          {contactedPhotographers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Photographers you call or email from their profile will show up
              here.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {contactedPhotographers.map((photographer) => (
                <PhotographerCard
                  key={photographer.id}
                  photographer={photographer}
                  eyebrow="Contacted"
                />
              ))}
            </div>
          )}
        </section>
      </BookmarkProvider>
    </div>
  );
}
