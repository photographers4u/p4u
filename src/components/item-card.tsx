import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Item } from "@/zod/schema/item";

const itemDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function ItemCard({
  item,
  eyebrow = "Item",
  href = `/items/${item.id}`,
  actions,
  showBookmark = true,
}: {
  item: Item;
  eyebrow?: string;
  href?: string;
  actions?: React.ReactNode;
  showBookmark?: boolean;
}) {
  return (
    <article className="flex flex-col gap-4 border-b border-border/70 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            {eyebrow}
          </Badge>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              <Link href={href} className="hover:underline underline-offset-4">
                {item.title || "Untitled item"}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">
              Created {itemDateFormatter.format(item.createdAt)}
            </p>
          </div>
        </div>
        {showBookmark ? (
          <BookmarkButton identifier="item" value={item.id} size="icon-sm" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="truncate">ID: {item.id}</span>
        <span>Updated {itemDateFormatter.format(item.updatedAt)}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm" variant="outline">
          <Link href={href}>View item</Link>
        </Button>
        {actions}
      </div>
    </article>
  );
}
