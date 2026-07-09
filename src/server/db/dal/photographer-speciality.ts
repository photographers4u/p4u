import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerSpeciality, speciality } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerSpecialityRecord =
  typeof photographerSpeciality.$inferSelect;
export type CreatePhotographerSpecialityData = Omit<
  typeof photographerSpeciality.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type PhotographerSpecialityDetailsRecord = {
  id: string;
  name: string;
  photographerId: string;
  specialityId: string;
  startingPrice: number;
};

export const photographerSpecialityDal = {
  async createMany(
    data: CreatePhotographerSpecialityData[],
    executor: DBClient = db,
  ): Promise<PhotographerSpecialityRecord[]> {
    if (data.length === 0) {
      return [];
    }

    return executor.insert(photographerSpeciality).values(data).returning();
  },

  async deleteAllByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerSpecialityRecord[]> {
    return executor
      .delete(photographerSpeciality)
      .where(eq(photographerSpeciality.photographerId, photographerId))
      .returning();
  },

  async getByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ): Promise<PhotographerSpecialityDetailsRecord[]> {
    return executor
      .select({
        id: photographerSpeciality.id,
        name: speciality.name,
        photographerId: photographerSpeciality.photographerId,
        specialityId: photographerSpeciality.specialityId,
        startingPrice: photographerSpeciality.startingPrice,
      })
      .from(photographerSpeciality)
      .innerJoin(
        speciality,
        eq(photographerSpeciality.specialityId, speciality.id),
      )
      .where(eq(photographerSpeciality.photographerId, photographerId))
      .orderBy(asc(speciality.name));
  },

  async getByPhotographerIds(
    photographerIds: string[],
    executor: DBClient = db,
  ): Promise<PhotographerSpecialityDetailsRecord[]> {
    if (photographerIds.length === 0) {
      return [];
    }

    return executor
      .select({
        id: photographerSpeciality.id,
        name: speciality.name,
        photographerId: photographerSpeciality.photographerId,
        specialityId: photographerSpeciality.specialityId,
        startingPrice: photographerSpeciality.startingPrice,
      })
      .from(photographerSpeciality)
      .innerJoin(
        speciality,
        eq(photographerSpeciality.specialityId, speciality.id),
      )
      .where(inArray(photographerSpeciality.photographerId, photographerIds))
      .orderBy(
        asc(photographerSpeciality.photographerId),
        asc(speciality.name),
      );
  },

  async getByPhotographerIdAndSpecialityIds(
    photographerId: string,
    specialityIds: string[],
    executor: DBClient = db,
  ): Promise<PhotographerSpecialityRecord[]> {
    if (specialityIds.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(photographerSpeciality)
      .where(
        and(
          eq(photographerSpeciality.photographerId, photographerId),
          inArray(photographerSpeciality.specialityId, specialityIds),
        ),
      );
  },

  async getPhotographerIdsBySpecialityIds(
    specialityIds: string[],
    executor: DBClient = db,
  ): Promise<string[]> {
    if (specialityIds.length === 0) {
      return [];
    }

    const rows = await executor
      .select({
        photographerId: photographerSpeciality.photographerId,
      })
      .from(photographerSpeciality)
      .where(inArray(photographerSpeciality.specialityId, specialityIds))
      .orderBy(asc(photographerSpeciality.photographerId));

    return Array.from(new Set(rows.map((row) => row.photographerId)));
  },

  async getTopSpecialities(
    limit: number,
    executor: DBClient = db,
  ): Promise<{ id: string; name: string; count: number }[]> {
    return executor
      .select({
        id: photographerSpeciality.specialityId,
        name: speciality.name,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographerSpeciality)
      .innerJoin(
        speciality,
        eq(photographerSpeciality.specialityId, speciality.id),
      )
      .groupBy(photographerSpeciality.specialityId, speciality.name)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  },
};
