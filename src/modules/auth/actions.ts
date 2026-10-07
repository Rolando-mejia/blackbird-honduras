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

function registrationResult(
  key: "message" | "error",
  message: string,
  invite?: string,
): never {
  const params = new URLSearchParams({ [key]: message });
  if (invite) params.set("invite", invite);
  redirect(`/registro?${params.toString()}`);
}

function appOrigin(requestHeaders: Awaited<ReturnType<typeof headers>>) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    requestHeaders.get("origin") ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/login", "El entorno Supabase DEV todavía no está conectado.");
  }

  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      invite: z.string().trim().optional(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      invite: String(formData.get("invite") ?? "") || undefined,
    });

  if (!parsed.success) {
    fail("/login", parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    fail("/login", "No pudimos iniciar sesión con esos datos.");
  }

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const nextPath = parsed.data.invite
    ? `/onboarding?invite=${encodeURIComponent(parsed.data.invite)}`
    : "/dashboard";

  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect(`/mfa?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/recuperar-contrasena", "Blackbird todavía no está conectado a Supabase.");
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    fail("/recuperar-contrasena", "Escribe un correo válido.");
  }

  const requestHeaders = await headers();
  const origin = appOrigin(requestHeaders);
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/restablecer-contrasena")}`,
  });

  if (error?.code === "over_email_send_rate_limit") {
    fail(
      "/recuperar-contrasena",
      "El servicio de correo alcanzó un límite temporal. Espera un poco y vuelve a intentarlo.",
    );
  }

  if (error) {
    console.error("Blackbird password recovery request error", error);
  }

  redirect(
    "/recuperar-contrasena?message=" +
      encodeURIComponent(
        "Si el correo pertenece a una cuenta de Blackbird, recibirás un enlace para cambiar tu contraseña.",
      ),
  );
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/restablecer-contrasena", "Blackbird todavía no está conectado a Supabase.");
  }

  const parsed = z
    .object({
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((value) => value.password === value.confirmPassword, {
      message: "Las contraseñas no coinciden.",
      path: ["confirmPassword"],
    })
    .safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

  if (!parsed.success) {
    fail(
      "/restablecer-contrasena",
      parsed.error.issues[0]?.message ?? "Revisa la contraseña.",
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    fail(
      "/recuperar-contrasena",
      "El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Blackbird password update error", error);
    fail(
      "/restablecer-contrasena",
      "No pudimos cambiar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.",
    );
  }

  await supabase.auth.signOut();

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Contraseña actualizada. Inicia sesión nuevamente con tu nueva contraseña.",
      ),
  );
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
      invite: z.string().trim().optional(),
    })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      invite: String(formData.get("invite") ?? "") || undefined,
    });

  if (!parsed.success) {
    registrationResult(
      "error",
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      String(formData.get("invite") ?? "") || undefined,
    );
  }

  const requestHeaders = await headers();
  const origin = appOrigin(requestHeaders);

  const nextPath = parsed.data.invite
    ? `/onboarding?invite=${encodeURIComponent(parsed.data.invite)}`
    : "/onboarding";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      registrationResult(
        "error",
        "No pudimos enviar el correo de verificación en este momento. El servicio de correo alcanzó un límite temporal y la cuenta no fue creada. Espera un poco y vuelve a intentarlo.",
        parsed.data.invite,
      );
    }

    registrationResult(
      "error",
      "No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.",
      parsed.data.invite,
    );
  }

  if (data.session) {
    redirect(nextPath);
  }

  registrationResult(
    "message",
    "Si este correo corresponde a una cuenta nueva, te enviaremos un enlace para verificarla. Si ya tenías una cuenta verificada en Blackbird, puedes iniciar sesión directamente.",
    parsed.data.invite,
  );
}

export async function acceptInvitation(formData: FormData) {
  if (!isSupabaseConfigured()) {
    fail("/login", "Blackbird DEV todavía no está conectado.");
  }

  const token = String(formData.get("token") ?? "");
  if (!token) {
    fail("/login", "La invitación no es válida.");
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?invite=" + encodeURIComponent(token));
  }

  const { data, error } = await supabase.rpc(
    "accept_blackbird_user_invitation",
    { p_token: token },
  );

  if (error) {
    console.error("Blackbird invitation acceptance error", error);
    const message = error.message.includes("EMAIL_MISMATCH")
      ? "Esta invitación corresponde a otro correo."
      : "La invitación ya no es válida o ha vencido.";
    redirect("/login?error=" + encodeURIComponent(message));
  }

  const { cookies } = await import("next/headers");
  const store = await cookies();

  if (data) {
    store.set("bb_active_org", String(data), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    store.delete("bb_active_branch");
  }

  redirect("/dashboard");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
