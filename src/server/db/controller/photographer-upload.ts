import { sql } from "drizzle-orm";
import { photographerPortfolioPinnedImageLimit } from "@/lib/photographer-upload-config";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerDal } from "@/server/db/dal/photographer";
import {
  type PhotographerUploadRecord,
  photographerUploadDal,
} from "@/server/db/dal/photographer-upload";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/server/db/helpers/errors";
import { photographer as photographerTable } from "@/server/db/schema/photographer";
import { deleteProviderFile } from "@/server/services/image-upload";
import type {
  CreatePhotographerPortfolioUploadInput,
  ReorderPhotographerUploadsInput,
  SetPhotographerUploadPinnedInput,
} from "@/zod/schema/photographer-upload";

type DBClient = DBExecutor | DBTransaction;

function toPhotographerUploadEntry(upload: PhotographerUploadRecord) {
  return {
    id: upload.id,
    createdAt: upload.createdAt,
    displayOrder: upload.displayOrder,
    imageUrl: upload.imageUrl,
    pinnedAt: upload.pinnedAt?.toISOString() ?? null,
    updatedAt: upload.updatedAt,
  };
}

async function getOwnedPhotographerOrThrow(
  userId: string,
  executor: DBClient = db,
) {
  const photographer = await photographerDal.getByUserId(userId, executor);

  if (!photographer) {
    throw new ForbiddenError("Only photographers can manage portfolio images.");
  }

  return photographer;
}

async function lockOwnedPhotographerUploads(
  photographerId: string,
  executor: DBClient = db,
) {
  await executor.execute(
    sql`select ${photographerTable.id} from ${photographerTable} where ${photographerTable.id} = ${photographerId} for update`,
  );
}

async function syncPhotographerUploadOrder(
  orderedUploadIds: string[],
  executor: DBClient = db,
) {
  for (const [index, uploadId] of orderedUploadIds.entries()) {
    const updatedUpload = await photographerUploadDal.updateById(
      uploadId,
      {
        displayOrder: index,
      },
      executor,
    );

    if (!updatedUpload) {
      throw new InternalError("Failed to save the portfolio image order.");
    }
  }
}

async function createPortfolioUploadByPhotographerId(
  photographerId: string,
  input: CreatePhotographerPortfolioUploadInput & {
    storageFileId?: string | null;
  },
) {
  return db.transaction(async (tx) => {
    await lockOwnedPhotographerUploads(photographerId, tx);
    const existingUploads = await photographerUploadDal.getByPhotographerId(
      photographerId,
      tx,
    );

    const createdUpload = await photographerUploadDal.create(
      {
        photographerId,
        displayOrder: existingUploads.length,
        imageUrl: input.imageUrl,
        storageFileId: input.storageFileId ?? null,
      },
      tx,
    );

    if (!createdUpload) {
      throw new InternalError("Failed to save the portfolio image.");
    }

    return toPhotographerUploadEntry(createdUpload);
  });
}

export const photographerUploadController = {
  async createPortfolioUploadByPhotographerId(
    photographerId: string,
    input: CreatePhotographerPortfolioUploadInput & {
      storageFileId?: string | null;
    },
  ) {
    return createPortfolioUploadByPhotographerId(photographerId, input);
  },

  async createPortfolioUploadByUserId(
    userId: string,
    input: CreatePhotographerPortfolioUploadInput & {
      storageFileId?: string | null;
    },
  ) {
    const photographer = await getOwnedPhotographerOrThrow(userId);

    return createPortfolioUploadByPhotographerId(photographer.id, input);
  },

  async deletePortfolioUploadByUserId(userId: string, uploadId: string) {
    const deletedUpload = await db.transaction(async (tx) => {
      const photographer = await getOwnedPhotographerOrThrow(userId, tx);
      await lockOwnedPhotographerUploads(photographer.id, tx);
      const existingUpload = await photographerUploadDal.getById(uploadId, tx);

      if (
        !existingUpload ||
        existingUpload.photographerId !== photographer.id
      ) {
        throw new NotFoundError("Portfolio image not found.");
      }

      const deletedUpload = await photographerUploadDal.deleteById(
        uploadId,
        tx,
      );

      if (!deletedUpload) {
        throw new InternalError("Failed to delete the portfolio image.");
      }

      const remainingUploads =
        await photographerUploadDal.getByPhotographerIdInDisplayOrder(
          photographer.id,
          tx,
        );

      await syncPhotographerUploadOrder(
        remainingUploads.map((upload) => upload.id),
        tx,
      );

      return deletedUpload;
    });

    if (deletedUpload?.storageFileId) {
      try {
        await deleteProviderFile(deletedUpload.storageFileId);
      } catch (error) {
        console.error("Failed to delete photographer portfolio image asset", {
          error,
          fileId: deletedUpload.storageFileId,
          uploadId,
          userId,
        });
      }
    }

    return {
      id: uploadId,
    };
  },

  async getPortfolioUploadsByUserId(userId: string) {
    const photographer = await getOwnedPhotographerOrThrow(userId);
    const uploads = await photographerUploadDal.getByPhotographerId(
      photographer.id,
    );

    return uploads.map(toPhotographerUploadEntry);
  },

  async setPortfolioUploadPinnedByUserId(
    userId: string,
    uploadId: string,
    input: SetPhotographerUploadPinnedInput,
  ) {
    return db.transaction(async (tx) => {
      const photographer = await getOwnedPhotographerOrThrow(userId, tx);
      await lockOwnedPhotographerUploads(photographer.id, tx);
      const existingUpload = await photographerUploadDal.getById(uploadId, tx);

      if (
        !existingUpload ||
        existingUpload.photographerId !== photographer.id
      ) {
        throw new NotFoundError("Portfolio image not found.");
      }

      if (input.isPinned) {
        if (!existingUpload.pinnedAt) {
          const pinnedUploads =
            await photographerUploadDal.getPinnedByPhotographerId(
              photographer.id,
              tx,
            );
          const uploadsToUnpin = pinnedUploads.slice(
            0,
            Math.max(
              0,
              pinnedUploads.length - photographerPortfolioPinnedImageLimit + 1,
            ),
          );

          for (const uploadToUnpin of uploadsToUnpin) {
            const updatedUpload = await photographerUploadDal.updateById(
              uploadToUnpin.id,
              {
                pinnedAt: null,
              },
              tx,
            );

            if (!updatedUpload) {
              throw new InternalError("Failed to update the pinned images.");
            }
          }

          const updatedUpload = await photographerUploadDal.updateById(
            uploadId,
            {
              pinnedAt: new Date(),
            },
            tx,
          );

          if (!updatedUpload) {
            throw new InternalError("Failed to pin the portfolio image.");
          }
        }
      } else if (existingUpload.pinnedAt) {
        const updatedUpload = await photographerUploadDal.updateById(
          uploadId,
          {
            pinnedAt: null,
          },
          tx,
        );

        if (!updatedUpload) {
          throw new InternalError("Failed to unpin the portfolio image.");
        }
      }

      const uploads = await photographerUploadDal.getByPhotographerId(
        photographer.id,
        tx,
      );

      return uploads.map(toPhotographerUploadEntry);
    });
  },

  async reorderPortfolioUploadsByUserId(
    userId: string,
    input: ReorderPhotographerUploadsInput,
  ) {
    return db.transaction(async (tx) => {
      const photographer = await getOwnedPhotographerOrThrow(userId, tx);
      await lockOwnedPhotographerUploads(photographer.id, tx);
      const existingUploads = await photographerUploadDal.getByPhotographerId(
        photographer.id,
        tx,
      );
      const existingUploadIds = existingUploads.map((upload) => upload.id);
      const existingUploadIdSet = new Set(existingUploadIds);
      const requestedUploadIdSet = new Set(input.orderedUploadIds);

      if (input.orderedUploadIds.length !== existingUploads.length) {
        throw new BadRequestError(
          "Send the full portfolio image order when reordering.",
        );
      }

      if (requestedUploadIdSet.size !== existingUploads.length) {
        throw new BadRequestError(
          "Send each portfolio image id only once when reordering.",
        );
      }

      if (
        input.orderedUploadIds.some(
          (uploadId) => !existingUploadIdSet.has(uploadId),
        )
      ) {
        throw new BadRequestError(
          "Only the current photographer's portfolio image ids can be reordered.",
        );
      }

      await syncPhotographerUploadOrder(input.orderedUploadIds, tx);

      const orderedUploads = await photographerUploadDal.getByPhotographerId(
        photographer.id,
        tx,
      );

      return orderedUploads.map(toPhotographerUploadEntry);
    });
  },
};
