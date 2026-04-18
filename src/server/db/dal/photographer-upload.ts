import { asc, eq, inArray } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerUpload } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerUploadRecord = typeof photographerUpload.$inferSelect;
export type CreatePhotographerUploadData = Omit<
  typeof photographerUpload.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerUploadData = Partial<CreatePhotographerUploadData>;

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
      .orderBy(
        asc(photographerUpload.displayOrder),
        asc(photographerUpload.createdAt),
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
        asc(photographerUpload.displayOrder),
        asc(photographerUpload.createdAt),
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
