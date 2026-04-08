import { defineConfig } from "drizzle-kit";
import { getEnvVariable } from "@/lib/env";

const databaseUrl = getEnvVariable("DATABASE_URL");

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
