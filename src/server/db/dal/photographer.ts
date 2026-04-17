import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographer, photographerContact } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export type PhotographerRecord = typeof photographer.$inferSelect;
export type CreatePhotographerData = Omit<
  typeof photographer.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerData = Partial<CreatePhotographerData>;
export const ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS = [
  "all",
  "draft",
  "submitted",
  "approved",
  "rejected",
  "on_hold",
] as const;
export type AdminPhotographerListStatusFilter =
  (typeof ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS)[number];
export const ADMIN_PHOTOGRAPHER_LIST_SORTS = [
  "review_queue",
  "updated_desc",
  "updated_asc",
  "created_desc",
  "created_asc",
  "name_asc",
  "name_desc",
] as const;
export type AdminPhotographerListSort =
  (typeof ADMIN_PHOTOGRAPHER_LIST_SORTS)[number];
export type AdminPhotographerListFilters = {
  query?: string;
  sort?: AdminPhotographerListSort;
  status?: AdminPhotographerListStatusFilter;
};
export type AdminPhotographerListQuery = AdminPhotographerListFilters & {
  limit: number;
  offset: number;
};
export type AdminPhotographerListRow = {
  id: string;
  userId: string;
  name: string | null;
  avatar: string | null;
  onboardingStep: PhotographerRecord["onboardingStep"];
  isPublished: boolean;
  status: PhotographerRecord["status"];
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contactEmail: string | null;
  contactEmailVerified: boolean | null;
  contactPhone: string | null;
  contactIsPublic: boolean | null;
};

function buildAdminPhotographerListWhere({
  query,
  status,
}: AdminPhotographerListFilters) {
  const conditions = [];
  const trimmedQuery = query?.trim();

  if (status && status !== "all") {
    conditions.push(
      status === "draft"
        ? or(eq(photographer.status, "draft"), isNull(photographer.status))
        : eq(photographer.status, status),
    );
  }

  if (trimmedQuery) {
    const searchPattern = `%${trimmedQuery}%`;

    conditions.push(
      or(
        ilike(photographer.name, searchPattern),
        ilike(photographerContact.email, searchPattern),
      ),
    );
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

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

  async getPublished(executor: DBClient = db): Promise<PhotographerRecord[]> {
    return executor
      .select()
      .from(photographer)
      .where(eq(photographer.isPublished, true))
      .orderBy(desc(photographer.createdAt));
  },

  async countAdminList(
    filters: AdminPhotographerListFilters = {},
    executor: DBClient = db,
  ): Promise<number> {
    const whereClause = buildAdminPhotographerListWhere(filters);
    const baseQuery = executor
      .select({
        count: sql<number>`count(distinct ${photographer.id})`.mapWith(Number),
      })
      .from(photographer)
      .leftJoin(
        photographerContact,
        eq(photographerContact.photographerId, photographer.id),
      );
    const query = whereClause ? baseQuery.where(whereClause) : baseQuery;
    const [result] = await query;

    return result?.count ?? 0;
  },

  async getAdminListPage(
    {
      limit,
      offset,
      query,
      sort = "review_queue",
      status = "all",
    }: AdminPhotographerListQuery,
    executor: DBClient = db,
  ): Promise<AdminPhotographerListRow[]> {
    const whereClause = buildAdminPhotographerListWhere({
      query,
      status,
    });
    const reviewPriority = sql<number>`case
      when coalesce(${photographer.status}, 'draft') = 'submitted' then 0
      when coalesce(${photographer.status}, 'draft') = 'draft' then 1
      when coalesce(${photographer.status}, 'draft') = 'on_hold' then 2
      when coalesce(${photographer.status}, 'draft') = 'rejected' then 3
      else 4
    end`;
    const normalizedName = sql<string>`coalesce(${photographer.name}, '')`;
    const baseQuery = executor
      .select({
        id: photographer.id,
        userId: photographer.userId,
        name: photographer.name,
        avatar: photographer.avatar,
        onboardingStep: photographer.onboardingStep,
        isPublished: photographer.isPublished,
        status: photographer.status,
        rejectionReason: photographer.rejectionReason,
        reviewedAt: photographer.reviewedAt,
        createdAt: photographer.createdAt,
        updatedAt: photographer.updatedAt,
        contactEmail: photographerContact.email,
        contactEmailVerified: photographerContact.emailVerified,
        contactPhone: photographerContact.phone,
        contactIsPublic: photographerContact.isPublic,
      })
      .from(photographer)
      .leftJoin(
        photographerContact,
        eq(photographerContact.photographerId, photographer.id),
      );
    const filteredQuery = whereClause
      ? baseQuery.where(whereClause)
      : baseQuery;

    switch (sort) {
      case "updated_asc":
        return filteredQuery
          .orderBy(
            asc(photographer.updatedAt),
            asc(photographer.createdAt),
            asc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "created_desc":
        return filteredQuery
          .orderBy(
            desc(photographer.createdAt),
            desc(photographer.updatedAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "created_asc":
        return filteredQuery
          .orderBy(
            asc(photographer.createdAt),
            asc(photographer.updatedAt),
            asc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "name_asc":
        return filteredQuery
          .orderBy(
            asc(normalizedName),
            desc(photographer.updatedAt),
            asc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "name_desc":
        return filteredQuery
          .orderBy(
            desc(normalizedName),
            desc(photographer.updatedAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "updated_desc":
        return filteredQuery
          .orderBy(
            desc(photographer.updatedAt),
            desc(photographer.createdAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      default:
        return filteredQuery
          .orderBy(
            reviewPriority,
            desc(photographer.updatedAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
    }
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
