"use client";

import {
  CheckCircle2,
  CircleSlash,
  Ellipsis,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { imageUploadAccept } from "@/lib/imagekit";
import { cn } from "@/lib/utils";
import type { PhotographerOnboardingUploadInput } from "@/zod/schema/photographer";
import {
  type PortfolioUploadQueueItem,
  usePhotographerImagesQueue,
} from "./use-photographer-images-queue";

function getItemTitle(
  item: PortfolioUploadQueueItem,
  index: number,
  fallbackLabel: string,
) {
  return item.file?.name || `${fallbackLabel} ${index + 1}`;
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
  context = "portfolio",
  initialUploads,
  onUploadsChange,
}: {
  context?: "portfolio" | "review";
  initialUploads: PhotographerOnboardingUploadInput[];
  onUploadsChange?: (uploads: PhotographerOnboardingUploadInput[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const queue = usePhotographerImagesQueue({
    initialUploads,
  });

  const fallbackItemLabel =
    context === "review" ? "Review photo" : "Portfolio image";

  const addButtonLabel =
    context === "review" ? "Add review photos" : "Add images";

  const dialogTitle = context === "review" ? "Add review photos" : "Add images";

  const dropTitle =
    context === "review" ? "Drop review photos here" : "Drop images here";

  const emptyGalleryLabel =
    context === "review" ? "No review photos yet." : "No portfolio images yet.";

  const savedCountLabel =
    context === "review" ? "review photo" : "portfolio image";

  const notifyUploadsChange = useEffectEvent(() => {
    onUploadsChange?.(queue.persistedUploads);
  });

  const persistedUploadsSignature = queue.persistedUploads
    .map((upload) =>
      [
        upload.id,
        upload.displayOrder,
        upload.imageUrl,
        upload.pinnedAt ?? "",
      ].join(":"),
    )
    .join("|");

  const previousPersistedUploadsSignatureRef = useRef<string | null>(null);

  const galleryItems = queue.items.filter((item) => item.persistedUploadId);

  const deleteItem = deleteClientId
    ? (galleryItems.find((item) => item.clientId === deleteClientId) ?? null)
    : null;

  const deleteItemIndex = deleteItem
    ? galleryItems.findIndex((item) => item.clientId === deleteItem.clientId)
    : -1;

  const deleteItemLabel =
    deleteItem && deleteItemIndex >= 0
      ? getItemTitle(deleteItem, deleteItemIndex, fallbackItemLabel)
      : "this image";

  const isDeletingSelectedImage =
    deleteItem !== null &&
    (isDeletePending || queue.removingClientIds.includes(deleteItem.clientId));

  const pinnedImageCount = galleryItems.filter((item) => item.pinnedAt).length;

  const uploadPreviewItems = queue.items.filter(
    (item) => item.source === "new",
  );

  const hasSelectedFiles = uploadPreviewItems.length > 0;

  const isUploadInProcess =
    queue.activeUploadCount > 0 || queue.queuedUploadCount > 0;

  useEffect(() => {
    if (
      previousPersistedUploadsSignatureRef.current === persistedUploadsSignature
    ) {
      return;
    }

    previousPersistedUploadsSignatureRef.current = persistedUploadsSignature;
    notifyUploadsChange();
  }, [notifyUploadsChange, persistedUploadsSignature]);

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
    <div className="space-y-5">
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {galleryItems.length === 0
              ? emptyGalleryLabel
              : `${galleryItems.length} ${savedCountLabel}${
                  galleryItems.length === 1 ? "" : "s"
                }`}
          </p>

          <p className="text-xs leading-5 text-muted-foreground">
            {context === "portfolio"
              ? `${pinnedImageCount} pinned of 5 max`
              : "Pick your strongest work for admin review."}
          </p>
        </div>

        <AlertDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open && isUploadInProcess) {
              return;
            }

            setIsDialogOpen(open);
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm">
              <ImagePlus className="size-4" />
              {addButtonLabel}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="flex max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)]! max-w-5xl! flex-col overflow-hidden rounded-3xl! p-0 sm:w-full! gap-0"
            onEscapeKeyDown={(event) => {
              if (isUploadInProcess) {
                event.preventDefault();
              }
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              <div className="space-y-5">
                <AlertDialogHeader className="items-start text-left">
                  <AlertDialogTitle className="text-lg">
                    {dialogTitle}
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-sm leading-6">
                    Upload clean, high-quality images. Review them once before
                    starting the upload.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {hasSelectedFiles ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Files to upload
                      </p>

                      {isUploadInProcess ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Uploading now. Please keep this dialog open.
                        </p>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={openFilePicker}
                      disabled={isUploadInProcess}
                    >
                      <ImagePlus className="size-4" />
                      Add more
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      queue.setIsDropActive(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();

                      if (
                        event.currentTarget.contains(
                          event.relatedTarget as Node,
                        )
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
                      "flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-10 text-center transition",
                      queue.isDropActive
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/30",
                    )}
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <UploadCloud className="size-5 text-muted-foreground" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-foreground">
                      {dropTitle}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, WEBP, GIF up to 8 MB each.
                    </p>

                    <span className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm">
                      <ImagePlus className="size-4" />
                      Choose files
                    </span>
                  </button>
                )}

                {hasSelectedFiles ? (
                  <ScrollArea className="h-[min(44vh,430px)] rounded-md pr-3">
                    <div className="grid grid-cols-2 gap-3 pb-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {uploadPreviewItems.map((item, index) => {
                        const isRemoving = queue.removingClientIds.includes(
                          item.clientId,
                        );

                        const overlayLabel =
                          item.state === "idle"
                            ? queue.scheduledUploadClientIds.includes(
                                item.clientId,
                              )
                              ? "Queued"
                              : null
                            : getUploadOverlayLabel(item);

                        const isUploaded = item.state === "success";

                        return (
                          <div key={item.clientId} className="overflow-hidden">
                            <div className="relative aspect-square overflow-hidden border rounded-md">
                              {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded assets are rendered here */}
                              <img
                                src={item.previewUrl}
                                alt={getItemTitle(
                                  item,
                                  index,
                                  fallbackItemLabel,
                                )}
                                className="h-full w-full object-cover"
                              />

                              {overlayLabel ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                                  <div className="rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
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

                            <div className="flex min-h-8 items-center justify-between gap-2 p-1">
                              <p
                                className={cn(
                                  "line-clamp-1 flex min-w-0 items-center gap-1.5 text-xs",
                                  isUploaded
                                    ? "font-medium text-emerald-700"
                                    : item.errorMessage
                                      ? "font-medium text-destructive"
                                      : "text-muted-foreground",
                                )}
                              >
                                {isUploaded ? (
                                  <CheckCircle2 className="size-3.5 shrink-0" />
                                ) : null}

                                <span className="truncate">
                                  {item.errorMessage ??
                                    getItemTitle(
                                      item,
                                      index,
                                      fallbackItemLabel,
                                    )}
                                </span>
                              </p>

                              <div className="flex shrink-0 items-center gap-1">
                                {item.state === "uploading" ? (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={() =>
                                      queue.cancelItem(item.clientId)
                                    }
                                    disabled={isRemoving}
                                    aria-label="Cancel upload"
                                  >
                                    <CircleSlash className="size-3.5" />
                                  </Button>
                                ) : null}

                                {item.state === "failed" ||
                                item.state === "cancelled" ? (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={() =>
                                      queue.retryItem(item.clientId)
                                    }
                                    disabled={isRemoving}
                                    aria-label="Retry upload"
                                  >
                                    <RefreshCw className="size-3.5" />
                                  </Button>
                                ) : null}

                                {item.state !== "uploading" &&
                                item.state !== "success" ? (
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
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : null}

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
                  disabled={isUploadInProcess}
                />
              </div>
            </div>

            <div className="flex-col-reverse gap-2 border-t bg-background/95 px-6 pb-4 py-4 flex sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <AlertDialogCancel
                className="mt-0 w-full sm:w-auto"
                disabled={isUploadInProcess}
              >
                Close
              </AlertDialogCancel>

              {queue.stagedUploadCount > 0 ? (
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={queue.startUploads}
                  disabled={isUploadInProcess}
                >
                  Upload {queue.stagedUploadCount} image
                  {queue.stagedUploadCount === 1 ? "" : "s"}
                </Button>
              ) : (
                <Button type="button" className="w-full sm:w-auto" disabled>
                  {isUploadInProcess ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    "Nothing to upload"
                  )}
                </Button>
              )}
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {galleryItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryItems.map((item, index) => {
            const isRemoving = queue.removingClientIds.includes(item.clientId);
            const isPinning = queue.pinningClientIds.includes(item.clientId);
            const isPinned = Boolean(item.pinnedAt);
            const isBusy = isRemoving || isPinning;

            return (
              <div
                key={item.clientId}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded assets are rendered here */}
                  <img
                    src={item.previewUrl}
                    alt={getItemTitle(item, index, fallbackItemLabel)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />

                  {isPinned ? (
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
                      Pinned
                    </div>
                  ) : null}

                  <div className="absolute right-2.5 top-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="size-8 rounded-full bg-background/90 shadow-sm hover:bg-background"
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

                  {isBusy ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/65">
                      <Loader2 className="size-5 animate-spin text-foreground" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-background shadow-sm">
            <ImagePlus className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-3 text-sm font-medium text-foreground">
            {emptyGalleryLabel}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Add images to start building this gallery.
          </p>
        </div>
      )}
    </div>
  );
}
