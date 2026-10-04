import { defineConfig } from "drizzle-kit";

// This config is intentionally database-independent so schema migrations can
// be generated offline. Database credentials live in drizzle.migrate.config.ts.
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  strict: true,
  verbose: true,
});
