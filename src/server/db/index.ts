/// <reference types="node" />

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnvVariable } from "@/lib/env";
import * as schema from "@/server/db/schema";

const connectionString = getEnvVariable("DATABASE_URL");

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize photographers4u/db");
}

declare global {
  // eslint-disable-next-line no-var
  var pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var drizzleDb: PostgresJsDatabase<typeof schema> | undefined;
}

let db: PostgresJsDatabase<typeof schema>;

const connectionOptions = {
  prepare: false,
  max: getEnvVariable("NODE_ENV") === "production" ? 10 : 1,
};

if (!global.pgClient) {
  global.pgClient = postgres(connectionString, connectionOptions);
}

if (!global.drizzleDb) {
  global.drizzleDb = drizzle(global.pgClient, { schema });
}

db = global.drizzleDb;

export default db;
export type DBExecutor = typeof db;
export type DBTransaction = Parameters<DBExecutor["transaction"]>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;
