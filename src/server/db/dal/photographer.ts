import { desc, eq } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographer } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerRecord = typeof photographer.$inferSelect;
export type CreatePhotographerData = Omit<
  typeof photographer.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerData = Partial<CreatePhotographerData>;

export const photographerDal = {
  async create(
    data: CreatePhotographerData,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .insert(photographer)
      .values(data)
      .returning();

    return record ?? null;
  },

  async getById(
    id: string,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .select()
      .from(photographer)
      .where(eq(photographer.id, id));

    return record ?? null;
  },

  async getByUserId(
    userId: string,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .select()
      .from(photographer)
      .where(eq(photographer.userId, userId));

    return record ?? null;
  },

  async getAll(executor: DBClient = db): Promise<PhotographerRecord[]> {
    return executor
      .select()
      .from(photographer)
      .orderBy(desc(photographer.createdAt));
  },

  async updateById(
    id: string,
    data: UpdatePhotographerData,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .update(photographer)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(photographer.id, id))
      .returning();

    return record ?? null;
  },

  async deleteById(
    id: string,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .delete(photographer)
      .where(eq(photographer.id, id))
      .returning();

    return record ?? null;
  },
};
