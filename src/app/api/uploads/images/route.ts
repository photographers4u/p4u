import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  imageUploadTagNamespace,
  isAcceptedImageUploadMimeType,
  isImageUploadKind,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";
import { mapError } from "@/server/api/lib/route-helpers";
import { auth } from "@/server/auth";
import {
  ImageUploadProviderError,
  uploadProviderImage,
} from "@/server/services/image-upload";
import { assertCanUploadImageByUserId } from "@/server/services/photographer-upload";

export const runtime = "nodejs";

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
    await assertCanUploadImageByUserId(session.user.id, uploadKind);

    const payload = await uploadProviderImage({
      file,
      tags: [imageUploadTagNamespace, uploadKind, `user:${session.user.id}`],
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

    const [status, message] = mapError(error);

    return NextResponse.json({ message }, { status });
  }
}
