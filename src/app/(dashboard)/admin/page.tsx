import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { itemController } from "@/server/db/controller/item";

export default async function AdminPage() {
  const items = await itemController.getAllItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin"
        subtitle="Review photographer submissions and manage supporting content from one admin workspace."
      />

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} in the collection
          </p>
          <p className="text-sm text-muted-foreground">
            Content management lives alongside the photographer moderation queue
            so operational work stays in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/photographers">Review photographers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/items">View public items</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/items/new">Create item</Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <h2 className="text-xl font-semibold">No items yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create the first item to populate the shared library.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              eyebrow="Admin item"
              showBookmark={false}
              actions={
                <Button asChild size="sm">
                  <Link href={`/admin/items/${item.id}/edit`}>Edit item</Link>
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
