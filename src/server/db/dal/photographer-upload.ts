import { and, asc, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerUpload } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerUploadRecord = typeof photographerUpload.$inferSelect;
export type CreatePhotographerUploadData = Omit<
  typeof photographerUpload.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerUploadData =
  Partial<CreatePhotographerUploadData>;

function getDisplayOrder() {
  return [
    asc(photographerUpload.displayOrder),
    asc(photographerUpload.createdAt),
  ] as const;
}

function getPinnedFirstOrder() {
  return [
    sql`case when ${photographerUpload.pinnedAt} is not null then 0 else 1 end`,
    sql`${photographerUpload.pinnedAt} desc nulls last`,
    ...getDisplayOrder(),
  ] as const;
}

export const photographerUploadDal = {
  async create(
    data: CreatePhotographerUploadData,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord | null> {
    const [record] = await executor
      .insert(photographerUpload)
      .values(data)
      .returning();

    return record ?? null;
  },

  async createMany(
    data: CreatePhotographerUploadData[],
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    if (data.length === 0) {
      return [];
    }

    return executor.insert(photographerUpload).values(data).returning();
  },

  async deleteById(
    id: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord | null> {
    const [record] = await executor
      .delete(photographerUpload)
      .where(eq(photographerUpload.id, id))
      .returning();

    return record ?? null;
  },

  async deleteAllByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    return executor
      .delete(photographerUpload)
      .where(eq(photographerUpload.photographerId, photographerId))
      .returning();
  },

  async getById(
    id: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord | null> {
    const [record] = await executor
      .select()
      .from(photographerUpload)
      .where(eq(photographerUpload.id, id));

    return record ?? null;
  },

  async getByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    return executor
      .select()
      .from(photographerUpload)
      .where(eq(photographerUpload.photographerId, photographerId))
      .orderBy(...getPinnedFirstOrder());
  },

  async getByPhotographerIdInDisplayOrder(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    return executor
      .select()
      .from(photographerUpload)
      .where(eq(photographerUpload.photographerId, photographerId))
      .orderBy(...getDisplayOrder());
  },

  async getPinnedByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    return executor
      .select()
      .from(photographerUpload)
      .where(
        and(
          eq(photographerUpload.photographerId, photographerId),
          isNotNull(photographerUpload.pinnedAt),
        ),
      )
      .orderBy(
        asc(photographerUpload.pinnedAt),
        ...getDisplayOrder(),
      );
  },

  async getByPhotographerIds(
    photographerIds: string[],
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    if (photographerIds.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(photographerUpload)
      .where(inArray(photographerUpload.photographerId, photographerIds))
      .orderBy(
        asc(photographerUpload.photographerId),
        ...getPinnedFirstOrder(),
      );
  },

  async getPreviewByPhotographerIds(
    photographerIds: string[],
    limitPerPhotographer = 3,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord[]> {
    if (photographerIds.length === 0 || limitPerPhotographer < 1) {
      return [];
    }

    const uploadRank = sql<number>`row_number() over (
      partition by ${photographerUpload.photographerId}
      order by
        case when ${photographerUpload.pinnedAt} is not null then 0 else 1 end,
        ${photographerUpload.pinnedAt} desc nulls last,
        ${photographerUpload.displayOrder},
        ${photographerUpload.createdAt}
    )`
      .mapWith(Number)
      .as("upload_rank");
    const rankedUploads = executor.$with("ranked_uploads").as(
      executor
        .select({
          id: photographerUpload.id,
          createdAt: photographerUpload.createdAt,
          updatedAt: photographerUpload.updatedAt,
          photographerId: photographerUpload.photographerId,
          displayOrder: photographerUpload.displayOrder,
          pinnedAt: photographerUpload.pinnedAt,
          imageUrl: photographerUpload.imageUrl,
          storageFileId: photographerUpload.storageFileId,
          uploadRank,
        })
        .from(photographerUpload)
        .where(inArray(photographerUpload.photographerId, photographerIds)),
    );

    return executor
      .with(rankedUploads)
      .select({
        id: rankedUploads.id,
        createdAt: rankedUploads.createdAt,
        updatedAt: rankedUploads.updatedAt,
        photographerId: rankedUploads.photographerId,
        displayOrder: rankedUploads.displayOrder,
        pinnedAt: rankedUploads.pinnedAt,
        imageUrl: rankedUploads.imageUrl,
        storageFileId: rankedUploads.storageFileId,
      })
      .from(rankedUploads)
      .where(lte(rankedUploads.uploadRank, limitPerPhotographer))
      .orderBy(
        asc(rankedUploads.photographerId),
        sql`case when ${rankedUploads.pinnedAt} is not null then 0 else 1 end`,
        sql`${rankedUploads.pinnedAt} desc nulls last`,
        asc(rankedUploads.displayOrder),
        asc(rankedUploads.createdAt),
      );
  },

  async updateById(
    id: string,
    data: UpdatePhotographerUploadData,
    executor: DBClient = db,
  ): Promise<PhotographerUploadRecord | null> {
    const [record] = await executor
      .update(photographerUpload)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(photographerUpload.id, id))
      .returning();

    return record ?? null;
  },
};
