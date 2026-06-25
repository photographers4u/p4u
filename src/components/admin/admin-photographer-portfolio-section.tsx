"use client";

import { ImagePlus, Loader2, Pin, PinOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { imageUploadAccept } from "@/lib/imagekit";
import { useAdminPhotographerEditMode } from "./admin-photographer-edit-mode";

type PortfolioUpload = {
  displayOrder: number;
  id: string;
  imageUrl: string;
  pinnedAt?: string | null;
};

export function AdminPhotographerPortfolioSection({
  photographerId,
  uploads,
}: {
  photographerId: string;
  uploads: PortfolioUpload[];
}) {
  const isEditing = useAdminPhotographerEditMode();
  const router = useRouter();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [busyUploadIds, setBusyUploadIds] = useState<string[]>([]);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("photographerId", photographerId);

        const response = await fetch(
          "/api/uploads/admin-photographer-portfolio",
          {
            method: "POST",
            body: formData,
          },
        );
        const { errorMessage } = await readApiResponse(response);

        if (!response.ok) {
          toast.error(errorMessage ?? `Couldn't upload ${file.name}.`);
        }
      }

      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  async function togglePin(uploadId: string, isPinned: boolean) {
    setBusyUploadIds((current) => [...current, uploadId]);

    try {
      const response = await apiClient.admin.photographers[":id"].uploads[
        ":uploadId"
      ].pin.$patch({
        param: { id: photographerId, uploadId },
        json: { isPinned: !isPinned },
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "Couldn't update the pin.");
        return;
      }

      router.refresh();
    } finally {
      setBusyUploadIds((current) => current.filter((id) => id !== uploadId));
    }
  }

  async function deleteUpload(uploadId: string) {
    setBusyUploadIds((current) => [...current, uploadId]);

    try {
      const response = await apiClient.admin.photographers[":id"].uploads[
        ":uploadId"
      ].$delete({
        param: { id: photographerId, uploadId },
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "Couldn't delete the image.");
        return;
      }

      toast.success("Image deleted.");
      router.refresh();
    } finally {
      setBusyUploadIds((current) => current.filter((id) => id !== uploadId));
    }
  }

  if (uploads.length === 0 && !isEditing) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
        No portfolio images have been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={imageUploadAccept}
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              void handleFilesSelected(event.target.files);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {isUploading ? "Uploading..." : "Add images"}
          </Button>
        </div>
      ) : null}

      {uploads.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
          No portfolio images have been added yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {uploads.map((upload, index) => {
            const isPinned = Boolean(upload.pinnedAt);
            const isBusy = busyUploadIds.includes(upload.id);

            return (
              <div
                key={upload.id}
                className={`overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-sm ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Image {index + 1}
                    {isPinned ? " (Pinned)" : ""}
                  </p>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => void togglePin(upload.id, isPinned)}
                        aria-label={isPinned ? "Unpin image" : "Pin image"}
                      >
                        {isBusy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : isPinned ? (
                          <PinOff className="size-4" />
                        ) : (
                          <Pin className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => void deleteUpload(upload.id)}
                        aria-label="Delete image"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-muted/20">
                  {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                  <img
                    src={upload.imageUrl}
                    alt={`Portfolio upload ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
