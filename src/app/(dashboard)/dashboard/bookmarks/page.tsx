import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ItemCard } from "@/components/item-card";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/server-api";
import { bookmarkController } from "@/server/db/controller/bookmark";
import { itemController } from "@/server/db/controller/item";

export default async function DashboardBookmarksPage() {
  const session = await getServerSession(await headers());

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
        subtitle="Your reusable bookmark system currently points at items, but the identifier model is ready for more."
      />

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {items.length} bookmarked item{items.length === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground">
            When you add another bookmark identifier later, the same bookmark
            table and client logic can support it.
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
