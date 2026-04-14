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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-2 bg-primary/5 border rounded-full">
        {/* Avatar */}
        <button
          type="button"
          className="group relative flex size-40 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
          onClick={upload.openFilePicker}
          disabled={disabled || upload.isUploading}
          aria-label={
            upload.hasImage ? upload.info.replaceLabel : upload.info.uploadLabel
          }
        >
          {upload.hasImage ? (
            <>
              {/* biome-ignore lint/performance/noImgElement: local blob previews and external uploaded asset URLs are rendered here */}
              <img
                alt={previewAlt}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                src={upload.previewValue}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
                <Camera className="size-5 text-white" />
                <span className="text-xs font-medium text-white">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="flex size-14 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                <Camera className="size-5 text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">Upload</span>
            </div>
          )}

          {/* Uploading state */}
          {upload.isUploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/40">
              <Loader2 className="size-5 animate-spin text-white" />
              <span className="text-xs font-medium text-white">
                {Math.round(upload.progress)}%
              </span>
            </div>
          ) : null}
        </button>
      </div>

      {/* Error */}
      {upload.errorMessage ? (
        <p className="text-xs text-red-600" role="alert">
          {upload.errorMessage}
        </p>
      ) : null}

      {/* Hidden input */}
      <input
        id={inputId}
        ref={upload.inputRef}
        type="file"
        accept={upload.accept}
        className="sr-only"
        onChange={(event) => void upload.handleFileChange(event)}
        disabled={disabled || upload.isUploading}
      />
    </div>
  );
}
