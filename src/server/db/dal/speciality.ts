import { asc, eq, inArray } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { speciality } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type SpecialityRecord = typeof speciality.$inferSelect;
export type CreateSpecialityData = Omit<
  typeof speciality.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export const specialityDal = {
  async create(
    data: CreateSpecialityData,
    executor: DBClient = db,
  ): Promise<SpecialityRecord | null> {
    const [record] = await executor.insert(speciality).values(data).returning();

    return record ?? null;
  },

  async getAll(executor: DBClient = db): Promise<SpecialityRecord[]> {
    return executor.select().from(speciality).orderBy(asc(speciality.name));
  },

  async getByName(
    name: string,
    executor: DBClient = db,
  ): Promise<SpecialityRecord | null> {
    const [record] = await executor
      .select()
      .from(speciality)
      .where(eq(speciality.name, name));

    return record ?? null;
  },

  async getByNames(
    names: string[],
    executor: DBClient = db,
  ): Promise<SpecialityRecord[]> {
    if (names.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(speciality)
      .where(inArray(speciality.name, names));
  },

  async getByIds(
    ids: string[],
    executor: DBClient = db,
  ): Promise<SpecialityRecord[]> {
    if (ids.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(speciality)
      .where(inArray(speciality.id, ids));
  },
};
