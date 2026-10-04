"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Correo inválido");
const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

function fail(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/login", "El entorno Supabase DEV todavía no está conectado.");
  }

  const parsed = z.object({email:emailSchema,password:passwordSchema}).safeParse({email:formData.get("email"),password:formData.get("password")});
  if (!parsed.success) fail("/login", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) fail("/login", "No pudimos iniciar sesión con esos datos.");

  redirect("/");
}

export async function register(formData: FormData) {
  if (!isSupabaseConfigured()) fail("/registro", "El entorno Supabase DEV todavía no está conectado.");

  const parsed = z.object({fullName:z.string().trim().min(3,"Escribe tu nombre completo"),email:emailSchema,password:passwordSchema}).safeParse({fullName:formData.get("fullName"),email:formData.get("email"),password:formData.get("password")});
  if (!parsed.success) fail("/registro", parsed.error.issues[0]?.message ?? "Datos inválidos");

  const requestHeaders = await headers();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({email:parsed.data.email,password:parsed.data.password,options:{data:{full_name:parsed.data.fullName},emailRedirectTo:`${origin}/auth/confirm?next=/onboarding`}});
  if (error) fail("/registro", "No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.");
  if (data.session) redirect("/onboarding");
  redirect(`/login?message=${encodeURIComponent("Cuenta creada. Revisa tu correo para confirmar el acceso.")}`);
}

export async function logout() {
  if (isSupabaseConfigured()) { const supabase = await createClient(); await supabase.auth.signOut(); }
  redirect("/login");
}
