"use client";

import { BookmarkProvider } from "@/lib/bookmarks-context";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";
import { ExplorePhotographerCard } from "./explore-photographer-card";
import { Marquee } from "./ui/marquee";

const FeaturedPhotographersCarousel = ({
  photographers,
}: {
  photographers: PublicPhotographerExploreEntry[];
}) => {
  if (photographers.length === 0) {
    return (
      <div className="px-6 text-center text-sm text-muted-foreground">
        Featured photographers will appear here soon.
      </div>
    );
  }

  return (
    <BookmarkProvider>
      <Marquee pauseOnHover>
        {photographers.map((elem) => (
          <div className="px-3 max-w-sm" key={elem.id}>
            <ExplorePhotographerCard photographer={elem} />
          </div>
        ))}
      </Marquee>
    </BookmarkProvider>
  );
};

export default FeaturedPhotographersCarousel;
