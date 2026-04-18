"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type ImageUploadKind,
  imageUploadAccept,
  imageUploadAcceptMimeTypes,
  isAcceptedImageUploadMimeType,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";

export type ImageUploadResponse = {
  fileId?: string;
  message?: string;
  url?: string;
};

type ImageUploadInfo = {
  acceptedFilesLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  helperText: string;
  maxSizeLabel: string;
  readyMessage: string;
  removeLabel: string;
  replaceLabel: string;
  uploadLabel: string;
};

const acceptedFilesLabel = "PNG, JPG, WEBP, GIF";
const maxSizeLabel = "Up to 8 MB";

const imageUploadInfoByKind = {
  photographerAvatar: {
    acceptedFilesLabel,
    emptyDescription: "A clean portrait with your face centered works best.",
    emptyTitle: "Choose your avatar",
    helperText: `${acceptedFilesLabel}. ${maxSizeLabel}.`,
    maxSizeLabel,
    readyMessage: "Avatar ready.",
    removeLabel: "Remove avatar",
    replaceLabel: "Change avatar",
    uploadLabel: "Upload avatar",
  },
  photographerPortfolio: {
    acceptedFilesLabel,
    emptyDescription: "Pick work that feels polished and representative.",
    emptyTitle: "Add portfolio work",
    helperText: `${acceptedFilesLabel}. ${maxSizeLabel} each.`,
    maxSizeLabel,
    readyMessage: "Upload ready.",
    removeLabel: "Remove upload",
    replaceLabel: "Replace image",
    uploadLabel: "Upload image",
  },
} satisfies Record<ImageUploadKind, ImageUploadInfo>;

export function getImageUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message || "Couldn't upload the image right now.";
  }

  return "Couldn't upload the image. Please try again.";
}

export function validateImageUploadFile(file: File) {
  if (!isAcceptedImageUploadMimeType(file.type)) {
    return `Please choose a ${imageUploadAcceptMimeTypes
      .map((type) => type.replace("image/", "").toUpperCase())
      .join(", ")} image.`;
  }

  if (file.size > maxImageUploadSizeBytes) {
    return "Please upload an image smaller than 8 MB.";
  }

  return null;
}

export function uploadImageFile({
  file,
  onProgress,
  uploadKind,
}: {
  file: File;
  onProgress?: (value: number) => void;
  uploadKind: ImageUploadKind;
}) {
  return createImageUploadRequest({
    file,
    onProgress,
    uploadKind,
  }).promise;
}

export function createImageUploadRequest<TResponse = ImageUploadResponse>({
  file,
  onProgress,
  requestPath = "/api/uploads/images",
  uploadKind,
}: {
  file: File;
  onProgress?: (value: number) => void;
  requestPath?: string;
  uploadKind?: ImageUploadKind;
}) {
  const request = new XMLHttpRequest();
  request.open("POST", requestPath);

  const promise = new Promise<TResponse>((resolve, reject) => {
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.((event.loaded / event.total) * 100);
      }
    });

    request.addEventListener("abort", () => {
      reject(new Error("Upload canceled."));
    });

    request.addEventListener("error", () => {
      reject(
        new Error(
          "Upload failed because of a network issue. Please try again.",
        ),
      );
    });

    request.addEventListener("load", () => {
      let payload: TResponse | null = null;
      let errorPayload: ImageUploadResponse | null = null;

      if (request.responseText) {
        try {
          payload = JSON.parse(request.responseText) as TResponse;
          errorPayload = payload as ImageUploadResponse;
        } catch {
          payload = null;
          errorPayload = null;
        }
      }

      if (request.status >= 200 && request.status < 300) {
        resolve((payload ?? {}) as TResponse);
        return;
      }

      reject(
        new Error(
          errorPayload?.message ?? "Couldn't upload the image right now.",
        ),
      );
    });
  });

  const formData = new FormData();
  formData.set("file", file);

  if (uploadKind) {
    formData.set("uploadKind", uploadKind);
  }

  request.send(formData);

  return {
    cancel() {
      request.abort();
    },
    promise,
  };
}

export function useImageUpload({
  disabled = false,
  onChange,
  uploadKind,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  uploadKind: ImageUploadKind;
  value: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const previewValue = localPreviewUrl ?? value;
  const hasImage = previewValue.length > 0;
  const info = imageUploadInfoByKind[uploadKind];
  const statusMessage = hasImage ? info.readyMessage : info.helperText;

  useEffect(() => {
    if (hasImage) {
      setErrorMessage(null);
    }
  }, [hasImage]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function openFilePicker() {
    if (disabled || isUploading) {
      return;
    }

    setErrorMessage(null);
    fileInputRef.current?.click();
  }

  function clearLocalPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setLocalPreviewUrl(null);
  }

  function removeImage() {
    clearLocalPreview();
    onChange("");
    setErrorMessage(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setErrorMessage(null);

    const validationError = validateImageUploadFile(file);

    if (validationError) {
      const nextError = validationError;
      setErrorMessage(nextError);
      toast.error(nextError);
      event.target.value = "";
      return;
    }

    clearLocalPreview();
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setLocalPreviewUrl(nextPreviewUrl);
    setIsUploading(true);
    setProgress(0);

    try {
      const response = await uploadImageFile({
        file,
        onProgress: setProgress,
        uploadKind,
      });

      if (!response.url) {
        throw new Error("Upload finished, but we couldn't save the image.");
      }

      onChange(response.url);
    } catch (error) {
      const nextError = getImageUploadErrorMessage(error);
      clearLocalPreview();
      setErrorMessage(nextError);
      toast.error(nextError);
    } finally {
      setIsUploading(false);
      setProgress(0);
      event.target.value = "";
    }
  }

  return {
    accept: imageUploadAccept,
    errorMessage,
    handleFileChange,
    hasImage,
    info,
    inputRef: fileInputRef,
    isUploading,
    openFilePicker,
    previewValue,
    progress,
    removeImage,
    statusMessage,
  };
}
