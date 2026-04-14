"use client";

import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageUploadKind } from "@/lib/imagekit";
import { cn } from "@/lib/utils";
import { useImageUpload } from "./use-image-upload";

const previewAspectClassName = {
  fourThree: "aspect-[4/3]",
  sixteenNine: "aspect-video",
  square: "aspect-square",
} as const;

type PreviewAspect = keyof typeof previewAspectClassName;
type PreviewFit = "contain" | "cover";

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
  const upload = useImageUpload({
    disabled,
    onChange,
    uploadKind,
    value,
  });

  return (
    <div className="space-y-2.5">
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
          onClick={upload.openFilePicker}
          disabled={disabled || upload.isUploading}
          className={cn(
            "group relative w-full overflow-hidden rounded-t-xl border-b border-slate-200 bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
            !upload.hasImage && "cursor-pointer hover:bg-slate-100",
            previewAspectClassName[previewAspect],
          )}
          aria-label={
            upload.hasImage ? upload.info.replaceLabel : upload.info.uploadLabel
          }
        >
          {upload.hasImage ? (
            // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
            <img
              alt={previewAlt}
              className={cn(
                "h-full w-full transition-opacity group-hover:opacity-90",
                previewFit === "contain" ? "object-contain" : "object-cover",
              )}
              src={upload.previewValue}
            />
          ) : (
            <div className="flex h-full min-h-32 flex-col items-center justify-center gap-3 px-5 text-center text-slate-400">
              <div className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs">
                <UploadCloud className="size-4.5 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {upload.info.emptyTitle}
                </p>
                <p className="text-xs leading-5 text-slate-500">
                  {upload.info.emptyDescription}
                </p>
              </div>
            </div>
          )}
        </button>

        {/* Bottom bar */}
        <div className="flex h-10 items-center gap-2 px-3">
          {upload.isUploading ? (
            <>
              <Loader2 className="size-3.5 shrink-0 animate-spin text-slate-400" />
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-[width] duration-150"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
                {Math.round(upload.progress)}%
              </span>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                {upload.hasImage && (
                  <CheckCircle2
                    className="size-3.5 shrink-0 text-emerald-500"
                  />
                )}
                <p
                  className={cn(
                    "truncate text-xs",
                    upload.hasImage ? "text-slate-500" : "text-slate-400",
                  )}
                >
                  {upload.statusMessage}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={upload.openFilePicker}
                  disabled={disabled || upload.isUploading}
                  className="h-7 gap-1.5 px-2.5 text-xs"
                >
                  {upload.hasImage ? (
                    <RefreshCw className="size-3" />
                  ) : (
                    <ImagePlus className="size-3" />
                  )}
                  {upload.hasImage
                    ? upload.info.replaceLabel
                    : upload.info.uploadLabel}
                </Button>

                {upload.hasImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={upload.removeImage}
                    disabled={disabled || upload.isUploading}
                    className="h-7 w-7 p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label={upload.info.removeLabel}
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
        ref={upload.inputRef}
        type="file"
        accept={upload.accept}
        className="sr-only"
        onChange={(event) => void upload.handleFileChange(event)}
        disabled={disabled || upload.isUploading}
      />

      {upload.errorMessage ? (
        <p className="text-xs text-red-600" role="alert">
          {upload.errorMessage}
        </p>
      ) : null}
    </div>
  );
}
