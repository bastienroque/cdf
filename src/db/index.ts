// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use global singleton in development to prevent (EMAXCONNSESSION)
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: 10, // Keep pool size below Supabase limit
    idle_timeout: 20, // Close idle connections promptly
    prepare: false, // Required for Supabase Transaction / Session Pooler
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
