import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  getImageUploadPrivateKey,
  imageUploadAcceptMimeTypes,
  imageUploadKinds,
  isImageUploadKind,
  maxImageUploadSizeBytes,
  type ImageUploadKind,
} from "@/lib/imagekit";
import { auth } from "@/server/auth";

export const runtime = "nodejs";

const uploadEndpoint = "https://upload.imagekit.io/api/v1/files/upload";

function sanitizeFileNamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function createFileName(kind: ImageUploadKind, originalName: string) {
  const { fileNamePrefix } = imageUploadKinds[kind];
  const extension =
    originalName.lastIndexOf(".") >= 0
      ? originalName.slice(originalName.lastIndexOf("."))
      : "";

  return `${sanitizeFileNamePart(fileNamePrefix)}-${Date.now()}${extension}`;
}

function getUploadErrorMessage(payload: unknown) {
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

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please sign in to upload images." },
      { status: 401 },
    );
  }

  let privateKey: string;

  try {
    privateKey = getImageUploadPrivateKey();
  } catch {
    return NextResponse.json(
      { message: "Image uploads are not configured yet." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const uploadKind = formData.get("uploadKind");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Please choose an image to upload." },
      { status: 400 },
    );
  }

  if (typeof uploadKind !== "string" || !isImageUploadKind(uploadKind)) {
    return NextResponse.json(
      { message: "That upload target isn't allowed." },
      { status: 400 },
    );
  }

  if (
    !imageUploadAcceptMimeTypes.includes(
      file.type as (typeof imageUploadAcceptMimeTypes)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Please choose a PNG, JPG, WEBP, or GIF image." },
      { status: 415 },
    );
  }

  if (file.size > maxImageUploadSizeBytes) {
    return NextResponse.json(
      { message: "Please upload an image smaller than 8 MB." },
      { status: 400 },
    );
  }

  const providerFormData = new FormData();
  providerFormData.set("file", file, file.name);
  providerFormData.set("fileName", createFileName(uploadKind, file.name));
  providerFormData.set("folder", imageUploadKinds[uploadKind].folder);
  providerFormData.set("tags", ["dezine-mafia", uploadKind].join(","));
  providerFormData.set("useUniqueFileName", "true");

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
    body: providerFormData,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { message: getUploadErrorMessage(payload) },
      { status: response.status >= 500 ? 502 : response.status },
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("url" in payload) ||
    typeof payload.url !== "string" ||
    payload.url.length === 0
  ) {
    return NextResponse.json(
      { message: "Upload finished, but we couldn't save the image." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: payload.url });
}
