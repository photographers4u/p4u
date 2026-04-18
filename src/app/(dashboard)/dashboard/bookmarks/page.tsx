import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ItemCard } from "@/components/item-card";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/server/auth/session";
import { bookmarkController } from "@/server/db/controller/bookmark";
import { itemController } from "@/server/db/controller/item";

export default async function DashboardBookmarksPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const bookmarkedValues = await bookmarkController.getValuesByIdentifier(
    session.user.id,
    "item",
  );
  const items = await itemController.getItemsByIds(bookmarkedValues);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookmarks"
        subtitle="Keep quick access to the items you want to revisit."
      />

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {items.length} bookmarked item{items.length === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground">
            Bookmarks currently track items from the shared library and stay
            synced with your signed-in account.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/items">Browse more items</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <h2 className="text-2xl font-semibold">No bookmarks yet</h2>
          <p className="mt-2 text-muted-foreground">
            Open an item and bookmark it to see it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} eyebrow="Bookmarked item" />
          ))}
        </div>
      )}
    </div>
  );
}
