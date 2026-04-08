import { desc, eq, inArray } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "../index";
import { items } from "../schema";

type DBClient = DBExecutor | DBTransaction;

export const itemDal = {
  async create(data: { title: string }) {
    const [item] = await db.insert(items).values(data).returning();

    return item ?? null;
  },

  async getById(id: string, executor: DBClient = db) {
    const [item] = await executor.select().from(items).where(eq(items.id, id));

    return item ?? null;
  },

  async getByTitle(title: string) {
    const [item] = await db.select().from(items).where(eq(items.title, title));

    return item ?? null;
  },

  async getAll() {
    return db.select().from(items).orderBy(desc(items.createdAt));
  },

  async getManyByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const rows = await db.select().from(items).where(inArray(items.id, ids));
    const rowMap = new Map(rows.map((row) => [row.id, row]));

    return ids.flatMap((id) => {
      const item = rowMap.get(id);
      return item ? [item] : [];
    });
  },

  async updateById(id: string, data: Partial<{ title: string }>) {
    const [item] = await db
      .update(items)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    return item ?? null;
  },

  async deleteById(id: string, executor: DBClient = db) {
    const [item] = await executor
      .delete(items)
      .where(eq(items.id, id))
      .returning();

    return item ?? null;
  },
};
