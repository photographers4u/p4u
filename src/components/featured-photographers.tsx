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
      <Marquee pauseOnHover repeat={2} speed={7}>
        {photographers.map((elem) => (
          <div className="px-3 max-w-sm lg:max-w-lg w-full" key={elem.id}>
            <ExplorePhotographerCard photographer={elem} imageMode="cover" />
          </div>
        ))}
      </Marquee>
    </BookmarkProvider>
  );
};

export default FeaturedPhotographersCarousel;
