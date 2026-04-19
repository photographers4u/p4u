"use client";

import {
  CircleSlash,
  Ellipsis,
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    return item.hasExactProgress
      ? `${Math.round(item.progress)}%`
      : "Uploading";
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
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const queue = usePhotographerImagesQueue({
    initialUploads,
  });

  const galleryItems = queue.items.filter((item) => item.persistedUploadId);
  const deleteItem = deleteClientId
    ? (galleryItems.find((item) => item.clientId === deleteClientId) ?? null)
    : null;
  const deleteItemIndex = deleteItem
    ? galleryItems.findIndex((item) => item.clientId === deleteItem.clientId)
    : -1;
  const deleteItemLabel =
    deleteItem && deleteItemIndex >= 0
      ? getItemTitle(deleteItem, deleteItemIndex)
      : "this image";
  const isDeletingSelectedImage =
    deleteItem !== null &&
    (isDeletePending || queue.removingClientIds.includes(deleteItem.clientId));
  const pinnedImageCount = galleryItems.filter((item) => item.pinnedAt).length;
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

  async function handleDeleteSelectedImage() {
    if (!deleteItem || isDeletePending) {
      return;
    }

    setIsDeletePending(true);
    const wasRemoved = await queue.removeItem(deleteItem.clientId);
    setIsDeletePending(false);

    if (wasRemoved) {
      setDeleteClientId(null);
    }
  }

  return (
    <div className="space-y-4">
      <AlertDialog
        open={Boolean(deleteItem)}
        onOpenChange={(open) => {
          if (!open && !isDeletingSelectedImage) {
            setDeleteClientId(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader className="items-start text-left">
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently remove ${deleteItemLabel}. This action can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSelectedImage}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingSelectedImage || !deleteItem}
              onClick={() => void handleDeleteSelectedImage()}
            >
              {isDeletingSelectedImage ? "Deleting..." : "Delete image"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {galleryItems.length === 0
              ? "No portfolio images yet."
              : `${galleryItems.length} portfolio image${
                  galleryItems.length === 1 ? "" : "s"
                }`}
          </p>
          <p className="text-xs text-muted-foreground">
            {pinnedImageCount} pinned of 5 max
          </p>
        </div>

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
                    <span className="tabular-nums">
                      {queue.overallProgress}%
                    </span>
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
                onClick={openFilePicker}
                onDragEnter={(event) => {
                  event.preventDefault();
                  queue.setIsDropActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (
                    event.currentTarget.contains(event.relatedTarget as Node)
                  ) {
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
                  "cursor-pointer rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
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
                    onClick={(event) => {
                      event.stopPropagation();
                      openFilePicker();
                    }}
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
                                  onClick={() =>
                                    queue.cancelItem(item.clientId)
                                  }
                                  disabled={isRemoving}
                                >
                                  <CircleSlash className="size-3.5" />
                                  Cancel
                                </Button>
                              ) : null}

                              {item.state === "failed" ||
                              item.state === "cancelled" ? (
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
                                  onClick={() =>
                                    void queue.removeItem(item.clientId)
                                  }
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
                id="photographer-images-input"
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
                <Button type="button" onClick={queue.startUploads}>
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
            const isPinning = queue.pinningClientIds.includes(item.clientId);
            const isPinned = Boolean(item.pinnedAt);
            const isBusy = isRemoving || isPinning;

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

                    {isPinned ? (
                      <div className="absolute left-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
                        Pinned
                      </div>
                    ) : null}

                    <div className="absolute right-2 top-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="size-8"
                            disabled={isBusy}
                            aria-label="Open image actions"
                          >
                            {isBusy ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Ellipsis className="size-3.5" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={() =>
                              void queue.setItemPinned(item.clientId, !isPinned)
                            }
                            disabled={isBusy}
                          >
                            {isPinned ? "Unpin image" : "Pin image"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteClientId(item.clientId)}
                            disabled={isBusy}
                          >
                            Delete image
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
