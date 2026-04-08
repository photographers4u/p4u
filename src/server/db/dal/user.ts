import { eq } from "drizzle-orm";
import db from "@/server/db";
import { user } from "@/server/db/schema";

export const userDal = {
  async getUserById(id: string) {
    return db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },
};
