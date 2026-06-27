"use client";
import { Pin } from "lucide-react";
import type React from "react";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Upload = {
  displayOrder: number;
  id: string;
  imageUrl: string;
  pinnedAt: string | null;
};

export type ResponsiveMasonryGridProps = {
  uploads: Upload[];
  minColumnWidth?: number;
  gap?: number;
  borderRadius?: number;
  eagerCount?: number;
  className?: string;
  emptyState?: React.ReactNode;
  getAlt?: (upload: Upload, index: number) => string;
  onImageClick?: (upload: Upload, index: number) => void;
  fallbackAspectRatio?: number;
};

type RatioMap = Record<string, number>;
type MasonryColumn = {
  id: string;
  items: Array<{ upload: Upload; index: number }>;
};

export function sortUploads(uploads: Upload[]) {
  const copy = [...uploads];

  copy.sort((a, b) => {
    const aPinned = a.pinnedAt ? 1 : 0;
    const bPinned = b.pinnedAt ? 1 : 0;

    if (aPinned !== bPinned) {
      return bPinned - aPinned;
    }

    if (a.pinnedAt && b.pinnedAt) {
      const aPinnedTime = new Date(a.pinnedAt).getTime();
      const bPinnedTime = new Date(b.pinnedAt).getTime();

      if (aPinnedTime !== bPinnedTime) {
        return bPinnedTime - aPinnedTime;
      }
    }

    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    return a.id.localeCompare(b.id);
  });

  return copy;
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      setWidth((prev) => (prev !== nextWidth ? nextWidth : prev));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function getColumnCount(
  containerWidth: number,
  minColumnWidth: number,
  gap: number,
) {
  if (containerWidth <= 0) return 1;
  return Math.max(
    1,
    Math.floor((containerWidth + gap) / (minColumnWidth + gap)),
  );
}

type MasonryImageProps = {
  upload: Upload;
  index: number;
  borderRadius: number;
  eager: boolean;
  getAlt?: (upload: Upload, index: number) => string;
  onImageClick?: (upload: Upload, index: number) => void;
  onImageLoad: (uploadId: string, width: number, height: number) => void;
};

const MasonryImage = memo(function MasonryImage({
  upload,
  index,
  borderRadius,
  eager,
  getAlt,
  onImageClick,
  onImageLoad,
}: MasonryImageProps) {
  const alt = getAlt?.(upload, index) ?? `Uploaded image ${index + 1}`;
  const isPinned = Boolean(upload.pinnedAt);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        onImageLoad(upload.id, img.naturalWidth, img.naturalHeight);
      }
    },
    [onImageLoad, upload.id],
  );

  const image = (
    <div
      style={{
        position: "relative",
        width: "100%",
        contentVisibility: "auto",
        containIntrinsicSize: "320px 480px",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: masonry items use external hosted uploads and rely on native image dimensions on load */}
      <img
        src={upload.imageUrl}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "low"}
        draggable={false}
        onLoad={handleLoad}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius,
          backgroundColor: "#f1f5f9",
          userSelect: "none",
        }}
      />

      {isPinned ? (
        <div className="absolute top-3 flex items-center justify-center right-3 rounded-full p-1 size-8 rotate-315 bg-white/80 backdrop-blur-sm text-stone-700">
          <Pin className="size-5" />
        </div>
      ) : null}
    </div>
  );

  if (!onImageClick) return image;

  return (
    <button
      type="button"
      onClick={() => onImageClick(upload, index)}
      aria-label={alt}
      style={{
        display: "block",
        width: "100%",
        padding: 0,
        border: 0,
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {image}
    </button>
  );
}, areImagePropsEqual);

function areImagePropsEqual(prev: MasonryImageProps, next: MasonryImageProps) {
  return (
    prev.upload.id === next.upload.id &&
    prev.upload.imageUrl === next.upload.imageUrl &&
    prev.upload.displayOrder === next.upload.displayOrder &&
    prev.upload.pinnedAt === next.upload.pinnedAt &&
    prev.index === next.index &&
    prev.borderRadius === next.borderRadius &&
    prev.eager === next.eager &&
    prev.getAlt === next.getAlt &&
    prev.onImageClick === next.onImageClick &&
    prev.onImageLoad === next.onImageLoad
  );
}

export function ResponsiveMasonryGrid({
  uploads,
  minColumnWidth = 260,
  gap = 12,
  borderRadius = 12,
  eagerCount = 4,
  className,
  emptyState = null,
  getAlt,
  onImageClick,
  fallbackAspectRatio = 4 / 5,
}: ResponsiveMasonryGridProps) {
  const deferredUploads = useDeferredValue(uploads);
  const { ref, width: containerWidth } = useContainerWidth<HTMLDivElement>();
  const [ratios, setRatios] = useState<RatioMap>({});

  const orderedUploads = useMemo(() => {
    return sortUploads(deferredUploads);
  }, [deferredUploads]);

  const columnCount = useMemo(() => {
    return getColumnCount(containerWidth, minColumnWidth, gap);
  }, [containerWidth, minColumnWidth, gap]);

  const handleImageLoad = useCallback(
    (uploadId: string, width: number, height: number) => {
      const nextRatio = width / height;

      setRatios((prev) => {
        if (prev[uploadId] === nextRatio) return prev;
        return { ...prev, [uploadId]: nextRatio };
      });
    },
    [],
  );

  const columns = useMemo(() => {
    const nextColumns: MasonryColumn[] = Array.from(
      { length: columnCount },
      (_, columnIndex) => ({
        id: `column-${columnIndex}`,
        items: [],
      }),
    );

    if (orderedUploads.length === 0) return nextColumns;

    const totalGapWidth = gap * (columnCount - 1);
    const columnWidth =
      columnCount > 0
        ? Math.max(0, (containerWidth - totalGapWidth) / columnCount)
        : containerWidth;

    const heights = new Array(columnCount).fill(0);

    orderedUploads.forEach((upload, index) => {
      const ratio = ratios[upload.id] || fallbackAspectRatio;
      const estimatedHeight =
        ratio > 0 ? columnWidth / ratio : columnWidth / fallbackAspectRatio;

      let targetColumn = 0;
      for (let i = 1; i < columnCount; i++) {
        if (heights[i] < heights[targetColumn]) {
          targetColumn = i;
        }
      }

      nextColumns[targetColumn].items.push({ upload, index });
      heights[targetColumn] += estimatedHeight + gap;
    });

    return nextColumns;
  }, [
    orderedUploads,
    columnCount,
    containerWidth,
    gap,
    ratios,
    fallbackAspectRatio,
  ]);

  if (orderedUploads.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div ref={ref} className={className} style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          gap,
          alignItems: "start",
        }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap,
              minWidth: 0,
            }}
          >
            {column.items.map(({ upload, index }) => (
              <MasonryImage
                key={upload.id}
                upload={upload}
                index={index}
                borderRadius={borderRadius}
                eager={index < eagerCount}
                getAlt={getAlt}
                onImageClick={onImageClick}
                onImageLoad={handleImageLoad}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
