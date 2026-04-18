import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  imageUploadTagNamespace,
  isAcceptedImageUploadMimeType,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";
import { auth } from "@/server/auth";
import { mapError } from "@/server/api/lib/route-helpers";
import { photographerDal } from "@/server/db/dal/photographer";
import { photographerUploadController } from "@/server/db/controller/photographer-upload";
import {
  deleteProviderFile,
  ImageUploadProviderError,
  uploadProviderImage,
} from "@/server/services/image-upload";

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

  const photographer = await photographerDal.getByUserId(session.user.id);

  if (!photographer) {
    return NextResponse.json(
      { message: "Only photographers can upload portfolio images." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Please choose an image to upload." },
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

  let uploadedAsset: Awaited<ReturnType<typeof uploadProviderImage>> | null =
    null;

  try {
    uploadedAsset = await uploadProviderImage({
      file,
      tags: [
        imageUploadTagNamespace,
        "photographerPortfolio",
        `user:${session.user.id}`,
        `photographer:${photographer.id}`,
      ],
      uploadKind: "photographerPortfolio",
    });

    const portfolioUpload =
      await photographerUploadController.createPortfolioUploadByUserId(
        session.user.id,
        {
          imageUrl: uploadedAsset.url,
          storageFileId: uploadedAsset.fileId,
        },
      );

    return NextResponse.json(portfolioUpload, { status: 201 });
  } catch (error) {
    if (uploadedAsset) {
      try {
        await deleteProviderFile(uploadedAsset.fileId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up photographer portfolio upload after a save error",
          {
            cleanupError,
            fileId: uploadedAsset.fileId,
            userId: session.user.id,
          },
        );
      }
    }

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
