import Link from "next/link";
import { ItemForm } from "@/components/forms/item-form";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function AdminNewItemPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Create Item"
        subtitle="Add a new entry to the shared content library."
      />

      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-semibold">New item</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the shared item form to publish a new library entry.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Back</Link>
          </Button>
        </div>
        <ItemForm mode="create" cancelHref="/admin" />
      </div>
    </div>
  );
}
