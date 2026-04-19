import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  isAcceptedImageUploadMimeType,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";
import { mapError } from "@/server/api/lib/route-helpers";
import { auth } from "@/server/auth";
import { ImageUploadProviderError } from "@/server/services/image-upload";
import { createPhotographerPortfolioUploadFromFileByUserId } from "@/server/services/photographer-upload";

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

  try {
    const portfolioUpload =
      await createPhotographerPortfolioUploadFromFileByUserId(
        session.user.id,
        file,
      );

    return NextResponse.json(portfolioUpload, { status: 201 });
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
