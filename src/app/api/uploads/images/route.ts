import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  type ImageUploadKind,
  imageUploadTagNamespace,
  isAcceptedImageUploadMimeType,
  isImageUploadKind,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";
import { auth } from "@/server/auth";
import { photographerDal } from "@/server/db/dal/photographer";
import {
  ImageUploadProviderError,
  uploadProviderImage,
} from "@/server/services/image-upload";

export const runtime = "nodejs";

async function getUploadAuthorizationError(
  userId: string,
  uploadKind: ImageUploadKind,
) {
  if (uploadKind === "photographerAvatar") {
    return null;
  }

  if (uploadKind === "photographerPortfolio") {
    const photographer = await photographerDal.getByUserId(userId);

    return photographer
      ? null
      : "Only photographers can upload portfolio images.";
  }

  return "That upload target isn't allowed for this account.";
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

  const authorizationError = await getUploadAuthorizationError(
    session.user.id,
    uploadKind,
  );

  if (authorizationError) {
    return NextResponse.json({ message: authorizationError }, { status: 403 });
  }

  if (!isAcceptedImageUploadMimeType(file.type)) {
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

  try {
    const payload = await uploadProviderImage({
      file,
      tags: [
        imageUploadTagNamespace,
        uploadKind,
        `user:${session.user.id}`,
      ],
      uploadKind,
    });

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ImageUploadProviderError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Couldn't upload the image right now." },
      { status: 500 },
    );
  }
}
