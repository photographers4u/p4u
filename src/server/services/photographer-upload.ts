import "server-only";

import { type ImageUploadKind, imageUploadTagNamespace } from "@/lib/imagekit";
import { photographerUploadController } from "@/server/db/controller/photographer-upload";
import { photographerDal } from "@/server/db/dal/photographer";
import { ForbiddenError } from "@/server/db/helpers/errors";
import {
  deleteProviderFile,
  uploadProviderImage,
} from "@/server/services/image-upload";

async function getOwnedPhotographerId(userId: string) {
  const photographer = await photographerDal.getByUserId(userId);

  if (!photographer) {
    throw new ForbiddenError("Only photographers can upload portfolio images.");
  }

  return photographer.id;
}

export async function assertCanUploadImageByUserId(
  userId: string,
  uploadKind: ImageUploadKind,
) {
  if (uploadKind === "photographerAvatar") {
    return;
  }

  if (uploadKind === "photographerPortfolio") {
    await getOwnedPhotographerId(userId);
    return;
  }

  throw new ForbiddenError(
    "That upload target isn't allowed for this account.",
  );
}

export async function createPhotographerPortfolioUploadFromFileByUserId(
  userId: string,
  file: File,
) {
  const photographerId = await getOwnedPhotographerId(userId);
  let uploadedAsset: Awaited<ReturnType<typeof uploadProviderImage>> | null =
    null;

  try {
    uploadedAsset = await uploadProviderImage({
      file,
      tags: [
        imageUploadTagNamespace,
        "photographerPortfolio",
        `user:${userId}`,
        `photographer:${photographerId}`,
      ],
      uploadKind: "photographerPortfolio",
    });

    return await photographerUploadController.createPortfolioUploadByPhotographerId(
      photographerId,
      {
        imageUrl: uploadedAsset.url,
        storageFileId: uploadedAsset.fileId,
      },
    );
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
            userId,
          },
        );
      }
    }

    throw error;
  }
}

export async function getPortfolioUploadsByUserId(userId: string) {
  return photographerUploadController.getPortfolioUploadsByUserId(userId);
}

export async function setPortfolioUploadPinnedByUserId(
  userId: string,
  uploadId: string,
  input: Parameters<
    typeof photographerUploadController.setPortfolioUploadPinnedByUserId
  >[2],
) {
  return photographerUploadController.setPortfolioUploadPinnedByUserId(
    userId,
    uploadId,
    input,
  );
}

export async function reorderPortfolioUploadsByUserId(
  userId: string,
  input: Parameters<
    typeof photographerUploadController.reorderPortfolioUploadsByUserId
  >[1],
) {
  return photographerUploadController.reorderPortfolioUploadsByUserId(
    userId,
    input,
  );
}

export async function deletePortfolioUploadByUserId(
  userId: string,
  uploadId: string,
) {
  return photographerUploadController.deletePortfolioUploadByUserId(
    userId,
    uploadId,
  );
}
