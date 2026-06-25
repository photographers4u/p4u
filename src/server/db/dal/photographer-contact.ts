import { eq, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerContact } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerContactRecord = typeof photographerContact.$inferSelect;
export type CreatePhotographerContactData = Omit<
  typeof photographerContact.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerContactData =
  Partial<CreatePhotographerContactData>;

export const photographerContactDal = {
  async create(
    data: CreatePhotographerContactData,
    executor: DBClient = db,
  ): Promise<PhotographerContactRecord | null> {
    const [record] = await executor
      .insert(photographerContact)
      .values(data)
      .returning();

    return record ?? null;
  },

  async getByEmail(
    email: string,
    executor: DBClient = db,
  ): Promise<PhotographerContactRecord | null> {
    const [record] = await executor
      .select()
      .from(photographerContact)
      .where(
        sql`lower(btrim(${photographerContact.email})) = ${email.trim().toLowerCase()}`,
      );

    return record ?? null;
  },

  async getByPhone(
    phone: string,
    executor: DBClient = db,
  ): Promise<PhotographerContactRecord | null> {
    const [record] = await executor
      .select()
      .from(photographerContact)
      .where(eq(photographerContact.phone, phone));

    return record ?? null;
  },

  async getByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerContactRecord | null> {
    const [record] = await executor
      .select()
      .from(photographerContact)
      .where(eq(photographerContact.photographerId, photographerId));

    return record ?? null;
  },

  async updateById(
    id: string,
    data: UpdatePhotographerContactData,
    executor: DBClient = db,
  ): Promise<PhotographerContactRecord | null> {
    const [record] = await executor
      .update(photographerContact)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(photographerContact.id, id))
      .returning();

    return record ?? null;
  },
};
