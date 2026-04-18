import { env } from "@/lib/env";

export const imageUploadKinds = {
  photographerAvatar: {
    fileNamePrefix: "photographer-avatar",
    folder: "/photographers4u/photographers/avatar",
  },
  photographerPortfolio: {
    fileNamePrefix: "photographer-portfolio",
    folder: "/photographers4u/photographers/portfolio",
  },
} as const;

export type ImageUploadKind = keyof typeof imageUploadKinds;

export const imageUploadAcceptMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const imageUploadAccept = imageUploadAcceptMimeTypes.join(",");
export const imageUploadTagNamespace = "photographers4u";

export const maxImageUploadSizeBytes = 8 * 1024 * 1024;

export function isImageUploadKind(value: string): value is ImageUploadKind {
  return value in imageUploadKinds;
}

export function isAcceptedImageUploadMimeType(
  value: string,
): value is (typeof imageUploadAcceptMimeTypes)[number] {
  return imageUploadAcceptMimeTypes.includes(
    value as (typeof imageUploadAcceptMimeTypes)[number],
  );
}

function sanitizeFileNamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export function createImageUploadFileName(
  kind: ImageUploadKind,
  originalName: string,
) {
  const { fileNamePrefix } = imageUploadKinds[kind];
  const extension =
    originalName.lastIndexOf(".") >= 0
      ? originalName.slice(originalName.lastIndexOf("."))
      : "";

  return `${sanitizeFileNamePart(fileNamePrefix)}-${Date.now()}${extension}`;
}

export function getImageUploadPrivateKey() {
  if (!env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Image uploads are not configured.");
  }

  return env.IMAGEKIT_PRIVATE_KEY;
}
