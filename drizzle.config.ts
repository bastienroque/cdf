import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Drizzle is used for typed queries and Drizzle Studio only.
  // Schema changes are Supabase CLI migrations in supabase/migrations.
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
