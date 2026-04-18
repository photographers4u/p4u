import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import { PhotographerCard } from "@/components/photographer-card";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/server/auth/session";
import { bookmarkController } from "@/server/db/controller/bookmark";
import { getPublicPhotographersByIds } from "@/server/services/photographer";

export default async function DashboardBookmarksPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const bookmarkedValues = await bookmarkController.getValuesByIdentifier(
    session.user.id,
    "photographer",
  );
  const photographers = await getPublicPhotographersByIds(bookmarkedValues);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Saved photographers"
        subtitle="Keep quick access to photographer profiles you want to revisit."
      />

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {photographers.length} saved photographer
            {photographers.length === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground">
            Saved photographers stay synced with your signed-in account.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/photographers">Browse photographers</Link>
        </Button>
      </div>

      {photographers.length === 0 ? (
        <div className="py-14 text-center">
          <h2 className="text-2xl font-semibold">No saved photographers yet</h2>
          <p className="mt-2 text-muted-foreground">
            Open a photographer profile and save it to see it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {photographers.map((photographer) => (
            <PhotographerCard
              key={photographer.id}
              photographer={photographer}
              eyebrow="Saved photographer"
            />
          ))}
        </div>
      )}
    </div>
  );
}
