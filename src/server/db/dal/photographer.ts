import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT,
  type PublicPhotographerExploreFilters,
  type PublicPhotographerExploreSort,
} from "@/lib/public-photographer-explore";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import {
  type DashboardSeriesPoint,
  type DashboardTimeBucket,
  dateTruncExpression,
} from "@/server/db/helpers/date-bucket";
import { photographer, photographerContact } from "@/server/db/schema";
import {
  type AdminPhotographerListCityFilter,
  type AdminPhotographerListOnboardingStepFilter,
  type AdminPhotographerListSort,
  type AdminPhotographerListStatusFilter,
  type PhotographerWorkflowStatus,
  PHOTOGRAPHER_STALE_THRESHOLD_DAYS,
} from "@/zod/schema/photographer";

const STALE_PHOTOGRAPHER_STATUSES: PhotographerWorkflowStatus[] = [
  "submitted",
  "pending_verification",
  "on_hold",
];

type DBClient = DBExecutor | DBTransaction;

export type PhotographerRecord = typeof photographer.$inferSelect;
export type CreatePhotographerData = Omit<
  typeof photographer.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdatePhotographerData = Partial<CreatePhotographerData>;
export type AdminPhotographerListFilters = {
  query?: string;
  sort?: AdminPhotographerListSort;
  status?: AdminPhotographerListStatusFilter;
  city?: AdminPhotographerListCityFilter;
  onboardingStep?: AdminPhotographerListOnboardingStepFilter;
  createdFrom?: Date;
  createdTo?: Date;
  stale?: boolean;
};
export type AdminPhotographerListQuery = AdminPhotographerListFilters & {
  limit: number;
  offset: number;
};
export type PublicPhotographerExploreListFilters = {
  experience?: PublicPhotographerExploreFilters["experience"];
  location?: PublicPhotographerExploreFilters["location"];
  photographerIds?: string[];
  query?: PublicPhotographerExploreFilters["query"];
  sort?: PublicPhotographerExploreFilters["sort"];
};
export type PublicPhotographerExplorePageQuery =
  PublicPhotographerExploreListFilters & {
    limit: number;
    offset: number;
  };
export type AdminPhotographerListRow = {
  id: string;
  userId: string;
  name: string | null;
  avatar: string | null;
  locationCity: PhotographerRecord["locationCity"];
  onboardingStep: PhotographerRecord["onboardingStep"];
  isPublished: boolean;
  isFeatured: boolean;
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
  city,
  onboardingStep,
  createdFrom,
  createdTo,
  stale,
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

  if (city && city !== "all") {
    conditions.push(eq(photographer.locationCity, city));
  }

  if (onboardingStep && onboardingStep !== "all") {
    conditions.push(eq(photographer.onboardingStep, onboardingStep));
  }

  if (createdFrom) {
    conditions.push(gte(photographer.createdAt, createdFrom));
  }

  if (createdTo) {
    conditions.push(lte(photographer.createdAt, createdTo));
  }

  if (stale) {
    const staleBefore = new Date(
      Date.now() - PHOTOGRAPHER_STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );

    conditions.push(
      and(
        inArray(photographer.status, STALE_PHOTOGRAPHER_STATUSES),
        lt(photographer.updatedAt, staleBefore),
      ),
    );
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

function buildPublicPhotographerExploreWhere({
  experience,
  location,
  photographerIds,
  query,
}: PublicPhotographerExploreListFilters) {
  if (photographerIds && photographerIds.length === 0) {
    return sql`false`;
  }

  const conditions = [eq(photographer.isPublished, true)];
  const trimmedQuery = query?.trim();

  if (trimmedQuery) {
    conditions.push(ilike(photographer.name, `%${trimmedQuery}%`));
  }

  if (experience) {
    conditions.push(eq(photographer.experienceYears, experience));
  }

  if (location) {
    conditions.push(eq(photographer.locationCity, location));
  }

  if (photographerIds) {
    conditions.push(inArray(photographer.id, photographerIds));
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

  async getBySlug(
    slug: string,
    executor: DBClient = db,
  ): Promise<PhotographerRecord | null> {
    const [record] = await executor
      .select()
      .from(photographer)
      .where(eq(photographer.slug, slug));

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

  async getFeaturedPublished(
    executor: DBClient = db,
  ): Promise<PhotographerRecord[]> {
    return executor
      .select()
      .from(photographer)
      .where(
        and(
          eq(photographer.isPublished, true),
          eq(photographer.isFeatured, true),
        ),
      )
      .orderBy(desc(photographer.updatedAt));
  },

  async countPublishedExploreList(
    filters: PublicPhotographerExploreListFilters = {},
    executor: DBClient = db,
  ): Promise<number> {
    const whereClause = buildPublicPhotographerExploreWhere(filters);
    const [result] = await executor
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographer)
      .where(whereClause);

    return result?.count ?? 0;
  },

  async getPublishedExplorePage(
    {
      experience,
      limit,
      location,
      offset,
      photographerIds,
      query,
      sort = DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT,
    }: PublicPhotographerExplorePageQuery,
    executor: DBClient = db,
  ): Promise<PhotographerRecord[]> {
    const whereClause = buildPublicPhotographerExploreWhere({
      experience,
      location,
      photographerIds,
      query,
    });
    const normalizedName = sql<string>`lower(coalesce(${photographer.name}, ''))`;
    const baseQuery = executor.select().from(photographer).where(whereClause);

    switch (sort as PublicPhotographerExploreSort) {
      case "oldest":
        return baseQuery
          .orderBy(
            asc(photographer.createdAt),
            asc(photographer.updatedAt),
            asc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "name_asc":
        return baseQuery
          .orderBy(
            asc(normalizedName),
            desc(photographer.createdAt),
            asc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      case "name_desc":
        return baseQuery
          .orderBy(
            desc(normalizedName),
            desc(photographer.createdAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
      default:
        return baseQuery
          .orderBy(
            desc(photographer.createdAt),
            desc(photographer.updatedAt),
            desc(photographer.id),
          )
          .limit(limit)
          .offset(offset);
    }
  },

  async getPublishedByIds(
    ids: string[],
    executor: DBClient = db,
  ): Promise<PhotographerRecord[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await executor
      .select()
      .from(photographer)
      .where(
        and(inArray(photographer.id, ids), eq(photographer.isPublished, true)),
      );
    const rowMap = new Map(rows.map((row) => [row.id, row]));

    return ids.flatMap((id) => {
      const record = rowMap.get(id);
      return record ? [record] : [];
    });
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
      city,
      onboardingStep,
      createdFrom,
      createdTo,
      stale,
    }: AdminPhotographerListQuery,
    executor: DBClient = db,
  ): Promise<AdminPhotographerListRow[]> {
    const whereClause = buildAdminPhotographerListWhere({
      query,
      status,
      city,
      onboardingStep,
      createdFrom,
      createdTo,
      stale,
    });
    const reviewPriority = sql<number>`case
      when coalesce(${photographer.status}, 'draft') = 'pending_verification' then 0
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
        locationCity: photographer.locationCity,
        onboardingStep: photographer.onboardingStep,
        isPublished: photographer.isPublished,
        isFeatured: photographer.isFeatured,
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

  async getDashboardTotals(
    { since }: { since: Date },
    executor: DBClient = db,
  ): Promise<{
    total: number;
    published: number;
    featured: number;
    avgReviewTurnaroundDays: number | null;
  }> {
    const sinceIso = since.toISOString();
    const [result] = await executor
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        published:
          sql<number>`count(*) filter (where ${photographer.isPublished})`.mapWith(
            Number,
          ),
        featured:
          sql<number>`count(*) filter (where ${photographer.isFeatured})`.mapWith(
            Number,
          ),
        avgReviewTurnaroundDays: sql`avg(extract(epoch from (${photographer.reviewedAt} - ${photographer.createdAt})) / 86400) filter (where ${photographer.reviewedAt} is not null and ${photographer.createdAt} >= ${sinceIso}::timestamptz)`.mapWith(
          (value: string | null) => (value === null ? null : Number(value)),
        ),
      })
      .from(photographer);

    return (
      result ?? {
        total: 0,
        published: 0,
        featured: 0,
        avgReviewTurnaroundDays: null,
      }
    );
  },

  async getStatusCounts(executor: DBClient = db): Promise<
    { status: PhotographerWorkflowStatus; count: number }[]
  > {
    const normalizedStatus = sql<PhotographerWorkflowStatus>`coalesce(${photographer.status}, 'draft')`;

    return executor
      .select({
        status: normalizedStatus,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographer)
      .groupBy(normalizedStatus);
  },

  async getCityCounts(
    limit: number,
    executor: DBClient = db,
  ): Promise<{ city: string; count: number }[]> {
    const rows = await executor
      .select({
        city: photographer.locationCity,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographer)
      .where(isNotNull(photographer.locationCity))
      .groupBy(photographer.locationCity)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return rows.map((row) => ({ city: row.city ?? "Unknown", count: row.count }));
  },

  async getOnboardingStepCounts(executor: DBClient = db): Promise<
    { step: PhotographerRecord["onboardingStep"]; count: number }[]
  > {
    return executor
      .select({
        step: photographer.onboardingStep,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographer)
      .where(
        or(eq(photographer.status, "draft"), isNull(photographer.status)),
      )
      .groupBy(photographer.onboardingStep)
      .orderBy(asc(photographer.onboardingStep));
  },

  async getSignupSeries(
    { bucket, since }: { bucket: DashboardTimeBucket; since: Date },
    executor: DBClient = db,
  ): Promise<DashboardSeriesPoint[]> {
    const bucketExpr = dateTruncExpression(bucket, photographer.createdAt);

    return executor
      .select({
        bucket: bucketExpr,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographer)
      .where(gte(photographer.createdAt, since))
      .groupBy(bucketExpr)
      .orderBy(asc(bucketExpr));
  },

  async getRecentlyCreated(
    limit: number,
    executor: DBClient = db,
  ): Promise<PhotographerRecord[]> {
    return executor
      .select()
      .from(photographer)
      .orderBy(desc(photographer.createdAt))
      .limit(limit);
  },

  async getRecentlyReviewed(
    limit: number,
    executor: DBClient = db,
  ): Promise<PhotographerRecord[]> {
    return executor
      .select()
      .from(photographer)
      .where(isNotNull(photographer.reviewedAt))
      .orderBy(desc(photographer.reviewedAt))
      .limit(limit);
  },

};
