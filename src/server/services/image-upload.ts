import "server-only";

import {
  createImageUploadFileName,
  getImageUploadPrivateKey,
  imageUploadKinds,
  type ImageUploadKind,
} from "@/lib/imagekit";

const uploadEndpoint = "https://upload.imagekit.io/api/v1/files/upload";
const fileManagementEndpoint = "https://api.imagekit.io/v1/files";

export class ImageUploadProviderError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ImageUploadProviderError";
    this.status = status;
  }
}

type UploadProviderImageInput = {
  file: File;
  tags: string[];
  uploadKind: ImageUploadKind;
};

function getProviderAuthorizationHeader() {
  let privateKey: string;

  try {
    privateKey = getImageUploadPrivateKey();
  } catch {
    throw new ImageUploadProviderError(
      "Image uploads are not configured yet.",
      503,
    );
  }

  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}

function getProviderErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "Couldn't upload the image right now.";
}

export async function uploadProviderImage({
  file,
  tags,
  uploadKind,
}: UploadProviderImageInput) {
  const providerFormData = new FormData();
  providerFormData.set("file", file, file.name);
  providerFormData.set(
    "fileName",
    createImageUploadFileName(uploadKind, file.name),
  );
  providerFormData.set("folder", imageUploadKinds[uploadKind].folder);
  providerFormData.set("tags", tags.join(","));
  providerFormData.set("useUniqueFileName", "true");

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      Authorization: getProviderAuthorizationHeader(),
    },
    body: providerFormData,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ImageUploadProviderError(
      getProviderErrorMessage(payload),
      response.status >= 500 ? 502 : response.status,
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("fileId" in payload) ||
    typeof payload.fileId !== "string" ||
    payload.fileId.length === 0 ||
    !("url" in payload) ||
    typeof payload.url !== "string" ||
    payload.url.length === 0
  ) {
    throw new ImageUploadProviderError(
      "Upload finished, but we couldn't save the image.",
      502,
    );
  }

  return {
    fileId: payload.fileId,
    url: payload.url,
  };
}

export async function deleteProviderFile(fileId: string) {
  const response = await fetch(
    `${fileManagementEndpoint}/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: getProviderAuthorizationHeader(),
      },
      cache: "no-store",
    },
  );

  if (response.ok || response.status === 404) {
    return;
  }

  const payload = await response.json().catch(() => null);

  throw new ImageUploadProviderError(
    getProviderErrorMessage(payload),
    response.status >= 500 ? 502 : response.status,
  );
}
