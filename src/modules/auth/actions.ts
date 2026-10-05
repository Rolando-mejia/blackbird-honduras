"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Correo inválido");
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function registrationSuccess(message: string): never {
  redirect(`/registro?message=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/login", "El entorno Supabase DEV todavía no está conectado.");
  }

  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    fail("/login", parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    fail("/login", "No pudimos iniciar sesión con esos datos.");
  }

  redirect("/");
}

export async function register(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/registro", "El entorno Supabase DEV todavía no está conectado.");
  }

  const parsed = z
    .object({
      fullName: z.string().trim().min(3, "Escribe tu nombre completo"),
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    fail("/registro", parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const requestHeaders = await headers();
  const rawOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    requestHeaders.get("origin") ??
    "http://localhost:3000";
  const origin = rawOrigin.replace(/\/+$/, "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      registrationSuccess(
        "Si este correo corresponde a una cuenta nueva o pendiente de verificación, recibirás un enlace para confirmarla. Si ya habías verificado tu cuenta, puedes iniciar sesión directamente.",
      );
    }

    fail(
      "/registro",
      "No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.",
    );
  }

  if (data.session) {
    redirect("/onboarding");
  }

  registrationSuccess(
    "Si este correo corresponde a una cuenta nueva, te enviaremos un enlace para verificarla. Si ya tenías una cuenta verificada en Blackbird, puedes iniciar sesión directamente.",
  );
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
