"use client";

import {
  CircleSlash,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { imageUploadAccept } from "@/lib/imagekit";
import { cn } from "@/lib/utils";
import type { PhotographerOnboardingUploadInput } from "@/zod/schema/photographer";
import {
  type PortfolioUploadQueueItem,
  usePhotographerImagesQueue,
} from "./use-photographer-images-queue";

function getItemTitle(item: PortfolioUploadQueueItem, index: number) {
  return item.file?.name || `Portfolio image ${index + 1}`;
}

function getUploadOverlayLabel(item: PortfolioUploadQueueItem) {
  if (item.state === "uploading") {
    return item.hasExactProgress ? `${Math.round(item.progress)}%` : "Uploading";
  }

  if (item.state === "failed") {
    return "Failed";
  }

  if (item.state === "cancelled") {
    return "Cancelled";
  }

  return null;
}

export function PhotographerImagesManager({
  initialUploads,
}: {
  initialUploads: PhotographerOnboardingUploadInput[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queue = usePhotographerImagesQueue({
    initialUploads,
  });

  const galleryItems = queue.items.filter((item) => item.persistedUploadId);
  const pendingItems = queue.items.filter(
    (item) => item.source === "new" && item.state !== "success",
  );
  const shouldShowOverallProgress =
    queue.activeUploadCount > 0 ||
    queue.queuedUploadCount > 0 ||
    queue.completedUploadCount > 0 ||
    queue.failedUploadCount > 0 ||
    queue.cancelledUploadCount > 0;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {galleryItems.length === 0
            ? "No portfolio images yet."
            : `${galleryItems.length} portfolio image${
                galleryItems.length === 1 ? "" : "s"
              }`}
        </p>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              <ImagePlus className="size-4" />
              Add images
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="max-w-3xl p-0 sm:max-w-3xl">
            <div className="space-y-4 p-4">
              <AlertDialogHeader className="items-start text-left">
                <AlertDialogTitle>Add images</AlertDialogTitle>
              </AlertDialogHeader>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{queue.statusMessage}</span>
                <span>{pendingItems.length} selected</span>
              </div>

              {shouldShowOverallProgress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>Overall progress</span>
                    <span className="tabular-nums">{queue.overallProgress}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/80 transition-[width] duration-200"
                      style={{ width: `${queue.overallProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div
                role="presentation"
                onDragEnter={(event) => {
                  event.preventDefault();
                  queue.setIsDropActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget.contains(event.relatedTarget as Node)) {
                    return;
                  }

                  queue.setIsDropActive(false);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  queue.setIsDropActive(true);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  queue.setIsDropActive(false);
                  queue.addFiles(event.dataTransfer.files);
                }}
                className={cn(
                  "rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
                  queue.isDropActive
                    ? "border-foreground/25 bg-muted/20"
                    : "border-border/70 bg-background",
                )}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <UploadCloud className="size-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">Drop images here</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, GIF up to 8 MB each.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={openFilePicker}
                    className="mt-2"
                  >
                    <ImagePlus className="size-4" />
                    Choose files
                  </Button>
                </div>
              </div>

              {pendingItems.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingItems.map((item, index) => {
                    const isRemoving = queue.removingClientIds.includes(
                      item.clientId,
                    );
                    const overlayLabel =
                      item.state === "idle"
                        ? queue.scheduledUploadClientIds.includes(item.clientId)
                          ? "Queued"
                          : "Selected"
                        : getUploadOverlayLabel(item);

                    return (
                      <Card
                        key={item.clientId}
                        className="overflow-hidden border border-border/60 p-0 shadow-none"
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden bg-muted/15">
                            {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded assets are rendered here */}
                            <img
                              src={item.previewUrl}
                              alt={getItemTitle(item, index)}
                              className="h-full w-full object-cover"
                            />

                            {overlayLabel ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/18">
                                <div className="rounded-md bg-background/90 px-3 py-1.5 text-xs text-foreground shadow-sm">
                                  {item.state === "uploading" ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                                      {overlayLabel}
                                    </span>
                                  ) : (
                                    overlayLabel
                                  )}
                                </div>
                              </div>
                            ) : null}

                            {isRemoving ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/75">
                                <Loader2 className="size-5 animate-spin text-foreground" />
                              </div>
                            ) : null}
                          </div>

                          <div className="space-y-2 p-2.5">
                            {item.errorMessage ? (
                              <p className="text-xs text-red-600">
                                {item.errorMessage}
                              </p>
                            ) : null}

                            <div className="flex items-center justify-end gap-2">
                              {item.state === "uploading" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => queue.cancelItem(item.clientId)}
                                  disabled={isRemoving}
                                >
                                  <CircleSlash className="size-3.5" />
                                  Cancel
                                </Button>
                              ) : null}

                              {(item.state === "failed" ||
                                item.state === "cancelled") ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => queue.retryItem(item.clientId)}
                                  disabled={isRemoving}
                                >
                                  <RefreshCw className="size-3.5" />
                                  Retry
                                </Button>
                              ) : null}

                              {item.state !== "uploading" ? (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="size-7 text-muted-foreground"
                                  onClick={() => void queue.removeItem(item.clientId)}
                                  disabled={isRemoving}
                                  aria-label="Remove image"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No pending uploads.
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={imageUploadAccept}
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (!event.target.files) {
                    return;
                  }

                  queue.addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>

            <AlertDialogFooter>
              {queue.stagedUploadCount > 0 ? (
                <Button
                  type="button"
                  onClick={queue.startUploads}
                >
                  Upload {queue.stagedUploadCount} image
                  {queue.stagedUploadCount === 1 ? "" : "s"}
                </Button>
              ) : null}
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {galleryItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {galleryItems.map((item, index) => {
            const isRemoving = queue.removingClientIds.includes(item.clientId);

            return (
              <Card
                key={item.clientId}
                className="overflow-hidden border border-border/60 p-0 shadow-none"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted/15">
                    {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded assets are rendered here */}
                    <img
                      src={item.previewUrl}
                      alt={getItemTitle(item, index)}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute right-2 top-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="size-8"
                        onClick={() => void queue.removeItem(item.clientId)}
                        disabled={isRemoving}
                        aria-label="Delete image"
                      >
                        {isRemoving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          No portfolio images yet.
        </div>
      )}
    </div>
  );
}
