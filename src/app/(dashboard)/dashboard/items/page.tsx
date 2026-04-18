import { headers } from "next/headers";
import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/server/auth/session";
import { itemController } from "@/server/db/controller/item";

export default async function DashboardItemsPage() {
  const requestHeaders = await headers();
  const [items, session] = await Promise.all([
    itemController.getAllItems(),
    getAuthSession({ headers: requestHeaders }),
  ]);
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Items"
        subtitle="Review the shared content library that supports the wider platform."
      />

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} available
          </p>
          <p className="text-sm text-muted-foreground">
            Admins can create, rename, and remove items from the admin
            workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/items">View public directory</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/bookmarks">Bookmarks</Link>
          </Button>
          {isAdmin ? (
            <Button asChild>
              <Link href="/admin/items/new">Create item</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <h2 className="text-2xl font-semibold">Nothing here yet</h2>
          <p className="mt-2 text-muted-foreground">
            Add the first item from the admin workspace to populate the library.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} eyebrow="Dashboard item" />
          ))}
        </div>
      )}
    </div>
  );
}
