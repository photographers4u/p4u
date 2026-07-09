"use client";

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
    <Marquee pauseOnHover repeat={2} speed={40}>
      {photographers.map((elem) => (
        <div className="w-[320px] shrink-0 px-3" key={elem.id}>
          <ExplorePhotographerCard photographer={elem} imageMode="cover" />
        </div>
      ))}
    </Marquee>
  );
};

export default FeaturedPhotographersCarousel;
