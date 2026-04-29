"use client";

import { Camera, Loader2 } from "lucide-react";
import type { ImageUploadKind } from "@/lib/imagekit";
import { useImageUpload } from "./use-image-upload";

export function AvatarUploadField({
  disabled = false,
  inputId,
  onChange,
  previewAlt,
  uploadKind,
  value,
}: {
  disabled?: boolean;
  inputId?: string;
  onChange: (value: string) => void;
  previewAlt: string;
  uploadKind: ImageUploadKind;
  value: string;
}) {
  const upload = useImageUpload({
    disabled,
    onChange,
    uploadKind,
    value,
  });

  const isDisabled = disabled || upload.isUploading;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={upload.openFilePicker}
        disabled={isDisabled}
        aria-label={
          upload.hasImage ? upload.info.replaceLabel : upload.info.uploadLabel
        }
        aria-busy={upload.isUploading}
        className="group relative flex size-40 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {upload.hasImage ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded asset URLs are rendered here */}
            <img
              src={upload.previewValue}
              alt={previewAlt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-200 group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </div>
          </>
        ) : (
          <Camera className="size-8 text-muted-foreground" />
        )}

        {upload.isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-foreground" />
          </div>
        ) : null}
      </button>

      <div className="space-y-1 text-start mt-4">
        <p className="text-sm font-medium text-foreground">
          {upload.hasImage ? "Change profile photo" : "Upload profile photo"}
        </p>

        <p className="text-[13px] leading-5 text-muted-foreground">
          Choose a clear square image for your photographer profile.
        </p>
      </div>

      {upload.errorMessage ? (
        <p
          className="max-w-64 text-center text-xs leading-5 text-destructive"
          role="alert"
        >
          {upload.errorMessage}
        </p>
      ) : null}

      <input
        id={inputId}
        ref={upload.inputRef}
        type="file"
        accept={upload.accept}
        className="sr-only"
        onChange={(event) => void upload.handleFileChange(event)}
        disabled={isDisabled}
      />
    </div>
  );
}