import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/env";

const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: NodePgDatabase<typeof schema>;
};

export function getPool() {
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: process.env.NODE_ENV === "production" ? 10 : 3,
    });
  }

  return globalForDb.pool;
}

export function getDb() {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getPool(), { schema });
  }

  return globalForDb.db;
}
