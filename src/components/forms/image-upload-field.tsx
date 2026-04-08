"use client";

import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  imageUploadAccept,
  maxImageUploadSizeBytes,
  type ImageUploadKind,
} from "@/lib/imagekit";
import { cn } from "@/lib/utils";

const previewAspectClassName = {
  fourThree: "aspect-[4/3]",
  sixteenNine: "aspect-video",
  square: "aspect-square",
} as const;

type PreviewAspect = keyof typeof previewAspectClassName;
type PreviewFit = "contain" | "cover";

type ImageUploadResponse = {
  message?: string;
  url?: string;
};

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error)
    return error.message || "Couldn't upload the image right now.";
  return "Couldn't upload the image. Please try again.";
}

function uploadImage({
  file,
  onProgress,
  uploadKind,
}: {
  file: File;
  onProgress: (value: number) => void;
  uploadKind: ImageUploadKind;
}) {
  return new Promise<ImageUploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads/images");

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress((event.loaded / event.total) * 100);
      }
    });

    request.addEventListener("abort", () => {
      reject(new Error("Upload canceled."));
    });

    request.addEventListener("error", () => {
      reject(
        new Error("Upload failed because of a network issue. Please try again."),
      );
    });

    request.addEventListener("load", () => {
      let payload: ImageUploadResponse | null = null;

      if (request.responseText) {
        try {
          payload = JSON.parse(request.responseText) as ImageUploadResponse;
        } catch {
          payload = null;
        }
      }

      if (request.status >= 200 && request.status < 300) {
        resolve(payload ?? {});
        return;
      }

      reject(
        new Error(
          payload?.message ?? "Couldn't upload the image right now.",
        ),
      );
    });

    const formData = new FormData();
    formData.set("file", file);
    formData.set("uploadKind", uploadKind);

    request.send(formData);
  });
}

export function ImageUploadField({
  disabled = false,
  inputId,
  onChange,
  previewAlt,
  previewAspect = "sixteenNine",
  previewFit = "cover",
  uploadKind,
  value,
}: {
  disabled?: boolean;
  inputId?: string;
  onChange: (value: string) => void;
  previewAlt: string;
  previewAspect?: PreviewAspect;
  previewFit?: PreviewFit;
  uploadKind: ImageUploadKind;
  value: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const hasImage = value.length > 0;

  useEffect(() => {
    if (disabled) {
      setShowSaveReminder(false);
    }
  }, [disabled]);

  function openFilePicker() {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageUploadSizeBytes) {
      toast.error("Please upload an image smaller than 8 MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const response = await uploadImage({
        file,
        onProgress: setProgress,
        uploadKind,
      });

      if (!response.url)
        throw new Error("Upload finished, but we couldn't save the image.");
      onChange(response.url);
      setShowSaveReminder(true);
    } catch (error) {
      toast.error(getUploadErrorMessage(error));
    } finally {
      setIsUploading(false);
      setProgress(0);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white transition-colors",
          !disabled && "hover:border-slate-300",
          disabled && "opacity-60",
        )}
      >
        {/* Preview area */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled || isUploading}
          className={cn(
            "group relative w-full overflow-hidden rounded-t-xl border-b border-slate-200 bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
            !hasImage && "cursor-pointer hover:bg-slate-100",
            previewAspectClassName[previewAspect],
          )}
          aria-label={hasImage ? "Replace image" : "Choose image"}
        >
          {hasImage ? (
            // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
            <img
              alt={previewAlt}
              className={cn(
                "h-full w-full transition-opacity group-hover:opacity-90",
                previewFit === "contain" ? "object-contain" : "object-cover",
              )}
              src={value}
            />
          ) : (
            <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2.5 text-slate-400">
              <div className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs">
                <UploadCloud className="size-4.5 text-slate-500" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                Click to upload
              </p>
            </div>
          )}
        </button>

        {/* Bottom bar */}
        <div className="flex h-10 items-center gap-2 px-3">
          {isUploading ? (
            <>
              <Loader2 className="size-3.5 shrink-0 animate-spin text-slate-400" />
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
                {Math.round(progress)}%
              </span>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                {hasImage && (
                  <CheckCircle2
                    className={cn(
                      "size-3.5 shrink-0",
                      showSaveReminder ? "text-amber-500" : "text-emerald-500",
                    )}
                  />
                )}
                <p
                  className={cn(
                    "truncate text-xs",
                    showSaveReminder
                      ? "text-amber-700"
                      : hasImage
                        ? "text-slate-500"
                        : "text-slate-400",
                  )}
                >
                  {showSaveReminder
                    ? "Save to keep changes."
                    : hasImage
                      ? "Image ready."
                      : "PNG, JPG, WEBP, GIF. Up to 8 MB."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openFilePicker}
                  disabled={disabled || isUploading}
                  className="h-7 gap-1.5 px-2.5 text-xs"
                >
                  {hasImage ? (
                    <RefreshCw className="size-3" />
                  ) : (
                    <ImagePlus className="size-3" />
                  )}
                  {hasImage ? "Replace" : "Upload"}
                </Button>

                {hasImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onChange("");
                      setShowSaveReminder(true);
                    }}
                    disabled={disabled || isUploading}
                    className="h-7 w-7 p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept={imageUploadAccept}
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
