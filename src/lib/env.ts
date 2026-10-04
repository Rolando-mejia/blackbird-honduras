const placeholderTokens = ["YOUR_PROJECT_REF", "REPLACE_ME", "USER:PASSWORD", "HOST:"];

function isUsable(value: string | undefined) {
  if (!value?.trim()) return false;
  return !placeholderTokens.some((token) => value.includes(token));
}

export function isSupabaseConfigured() {
  return (
    isUsable(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    isUsable(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!isUsable(url) || !isUsable(publishableKey)) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url: url!, publishableKey: publishableKey! };
}

export function isDatabaseConfigured() {
  return isUsable(process.env.DATABASE_URL);
}

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!isUsable(url)) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  return url!;
}
