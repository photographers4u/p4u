import { env } from "@/lib/env";

export const imageUploadKinds = {
  itemImage: {
    fileNamePrefix: "item-image",
    folder: "/photographers4u/items",
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

export const maxImageUploadSizeBytes = 8 * 1024 * 1024;

export function isImageUploadKind(value: string): value is ImageUploadKind {
  return value in imageUploadKinds;
}

export function getImageUploadPrivateKey() {
  if (!env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Image uploads are not configured.");
  }

  return env.IMAGEKIT_PRIVATE_KEY;
}
