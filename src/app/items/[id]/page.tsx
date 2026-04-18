import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { Footer } from "@/components/footer";
import { InternalServerState } from "@/components/internal-server-state";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/server/auth/session";
import { itemController } from "@/server/db/controller/item";
import { NotFoundError } from "@/server/db/helpers/errors";

const itemDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ItemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const requestHeaders = await headers();
  const session = await getAuthSession({ headers: requestHeaders });

  try {
    const item = await itemController.getItemById(id);
    const isAdmin = session?.user.role === "admin";

    return (
      <>
        <Navbar session={session} />
        <main className="min-h-screen bg-background">
          <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">Item</Badge>
                <Badge variant="outline">Public view</Badge>
              </div>

              <div className="border-b border-border pb-6">
                <h1 className="text-4xl font-semibold tracking-tight">
                  {item.title || "Untitled item"}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Created {itemDateFormatter.format(item.createdAt)}
                </p>
              </div>

              <dl className="space-y-4 text-sm">
                <div className="border-b border-border pb-4">
                  <dt className="text-muted-foreground">Item ID</dt>
                  <dd className="mt-1 break-all font-medium">{item.id}</dd>
                </div>
                <div className="border-b border-border pb-4">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="mt-1 font-medium">
                    {itemDateFormatter.format(item.updatedAt)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row">
                <BookmarkButton
                  identifier="item"
                  value={item.id}
                  size="default"
                  label="Bookmark"
                  activeLabel="Bookmarked"
                />
                <Button asChild variant="outline">
                  <Link href="/items">Back to items</Link>
                </Button>
                {isAdmin ? (
                  <Button asChild variant="outline">
                    <Link href={`/admin/items/${item.id}/edit`}>Edit item</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    return (
      <>
        <Navbar session={session} />
        <main className="min-h-screen bg-background">
          <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
            <InternalServerState
              description="Something went wrong while loading this item."
              href="/items"
              actionLabel="Back to items"
            />
          </section>
        </main>
        <Footer />
      </>
    );
  }
}
