import { headers } from "next/headers";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ItemCard } from "@/components/item-card";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/server/auth/session";
import { itemController } from "@/server/db/controller/item";

export default async function ItemsPage() {
  const [items, session] = await Promise.all([
    itemController.getAllItems(),
    getAuthSession({ headers: await headers() }),
  ]);

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen bg-background">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-border pb-6">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Public directory
            </span>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight">
                  Browse the shared item library.
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  This public library supports the wider photographer platform.
                  Admins can publish entries here, and signed-in users can keep
                  personal bookmarks in the dashboard.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard/items">Open dashboard</Link>
                </Button>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-14 text-center">
              <h2 className="text-2xl font-semibold">No items yet</h2>
              <p className="mt-2 text-muted-foreground">
                Create the first item from the admin area to populate the
                library.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border border-t border-border">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
