import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteItemButton } from "@/components/delete-item-button";
import PageHeader from "@/components/page-header";
import { ItemForm } from "@/components/forms/item-form";
import { Button } from "@/components/ui/button";
import { itemController } from "@/server/db/controller/item";
import { NotFoundError } from "@/server/db/helpers/errors";

type AdminEditItemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditItemPage({
  params,
}: AdminEditItemPageProps) {
  const { id } = await params;

  try {
    const item = await itemController.getItemById(id);

    return (
      <div className="space-y-8">
        <PageHeader
          title="Edit Item"
          subtitle="Update the item title without touching the generic bookmark model."
        />

        <div className="max-w-2xl space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-semibold">
                {item.title || "Untitled item"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.id}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Back</Link>
            </Button>
          </div>

          <ItemForm mode="edit" item={item} cancelHref="/admin" />

          <div className="border-t border-border pt-6">
            <DeleteItemButton itemId={item.id} itemTitle={item.title} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}