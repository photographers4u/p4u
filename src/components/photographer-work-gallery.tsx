"use client";

import { useMemo, useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";
import {
  ResponsiveMasonryGrid,
  sortUploads,
  type Upload,
} from "@/components/masonary";

export function PhotographerWorkGallery({
  uploads,
  photographerName,
}: {
  uploads: Upload[];
  photographerName: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // The grid re-sorts uploads (pinned first) and reports click indices
  // relative to that order, so the lightbox must use the same order.
  const orderedUploads = useMemo(() => sortUploads(uploads), [uploads]);

  return (
    <>
      <ResponsiveMasonryGrid
        uploads={uploads}
        onImageClick={(_upload, index) => setActiveIndex(index)}
        getAlt={(_upload, index) =>
          `${photographerName} portfolio photo ${index + 1}`
        }
        mobileColumnCount={3}
        borderRadius={4}
        gap={4}
      />

      <ImageLightbox
        images={orderedUploads.map((upload, index) => ({
          id: upload.id,
          imageUrl: upload.imageUrl,
          alt: `${photographerName} portfolio photo ${index + 1}`,
        }))}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
