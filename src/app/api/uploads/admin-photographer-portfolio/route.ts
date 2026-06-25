import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  isAcceptedImageUploadMimeType,
  maxImageUploadSizeBytes,
} from "@/lib/imagekit";
import {
  API_CACHE_NAMESPACES,
  invalidateApiCacheNamespaces,
} from "@/server/api/lib/response-cache";
import { mapError } from "@/server/api/lib/route-helpers";
import { auth } from "@/server/auth";
import { ImageUploadProviderError } from "@/server/services/image-upload";
import { getAdminPhotographerEntryById } from "@/server/services/photographer";
import { createAdminPhotographerPortfolioUploadFromFile } from "@/server/services/photographer-upload";

export const runtime = "nodejs";
const PUBLIC_PHOTOGRAPHER_UPLOAD_CACHE_INVALIDATION_BYPASS_SECONDS = 300;

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Admin access required" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const photographerId = formData.get("photographerId");

  if (typeof photographerId !== "string" || !photographerId) {
    return NextResponse.json(
      { message: "A photographer id is required." },
      { status: 400 },
    );
  }

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
      await createAdminPhotographerPortfolioUploadFromFile(
        photographerId,
        file,
      );
    const photographer = await getAdminPhotographerEntryById(photographerId);

    if (photographer.isPublished) {
      await invalidateApiCacheNamespaces(
        [
          API_CACHE_NAMESPACES.publicPhotographerDirectory,
          API_CACHE_NAMESPACES.publicPhotographerDetails,
        ],
        {
          bypassSeconds:
            PUBLIC_PHOTOGRAPHER_UPLOAD_CACHE_INVALIDATION_BYPASS_SECONDS,
        },
      );
    }

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
