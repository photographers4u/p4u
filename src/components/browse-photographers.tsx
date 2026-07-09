"use client";

import Link from "next/link";
import { ExplorePhotographerCard } from "@/components/explore-photographer-card";
import { Button } from "@/components/ui/button";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";

const BrowsePhotographers = ({
  photographers,
}: {
  photographers: PublicPhotographerExploreEntry[];
}) => {
  if (photographers.length === 0) {
    return (
      <div className="px-6 text-center text-sm text-muted-foreground">
        Photographers will appear here soon.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {photographers.map((elem) => (
          <ExplorePhotographerCard
            key={elem.id}
            photographer={elem}
            imageMode="cover"
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center max-md:hidden">
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-md px-6 text-sm"
        >
          <Link href="/photographers">Browse all photographers</Link>
        </Button>
      </div>
    </div>
  );
};

export default BrowsePhotographers;
