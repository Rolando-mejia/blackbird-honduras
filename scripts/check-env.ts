import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const checks = [
  ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY],
  ["DATABASE_URL", process.env.DATABASE_URL],
  ["DIRECT_DATABASE_URL", process.env.DIRECT_DATABASE_URL],
] as const;

const invalid = checks.filter(([, value]) => {
  if (!value?.trim()) return true;
  return /YOUR_PROJECT_REF|REPLACE_ME|USER:PASSWORD|HOST:/.test(value);
});

if (invalid.length) {
  console.error("Blackbird DEV todavía no está conectado. Faltan variables válidas:");
  invalid.forEach(([key]) => console.error(`- ${key}`));
  process.exit(1);
}

console.log("Blackbird DEV: variables de Supabase/PostgreSQL configuradas.");
