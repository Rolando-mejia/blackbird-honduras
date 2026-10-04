"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  tradeName: z.string().trim().min(2, "Escribe el nombre comercial"),
  legalName: z.string().trim().min(2, "Escribe la razón social o nombre legal"),
  rtn: z.string().trim().max(20).optional(),
  type: z.enum([
    "sole_trader",
    "company",
    "independent_professional",
    "ngo",
    "other",
  ]),
  department: z
    .string()
    .trim()
    .min(2, "Selecciona o escribe el departamento"),
  municipality: z.string().trim().min(2, "Escribe el municipio"),
  address: z.string().trim().max(500).optional(),
});

function onboardingError(message: string): never {
  redirect(`/onboarding?error=${encodeURIComponent(message)}`);
}

export async function createOrganization(formData: FormData) {
  if (!isSupabaseConfigured()) {
    onboardingError("Blackbird DEV todavía no está conectado a Supabase.");
  }

  const parsed = onboardingSchema.safeParse({
    tradeName: formData.get("tradeName"),
    legalName: formData.get("legalName"),
    rtn: formData.get("rtn") || undefined,
    type: formData.get("type"),
    department: formData.get("department"),
    municipality: formData.get("municipality"),
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    onboardingError(
      parsed.error.issues[0]?.message ?? "Revisa los datos de la empresa.",
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?error=Inicia%20sesión%20para%20crear%20una%20empresa.");
  }

  const { error } = await supabase.rpc("create_blackbird_organization", {
    p_trade_name: parsed.data.tradeName,
    p_legal_name: parsed.data.legalName,
    p_rtn: parsed.data.rtn ?? "",
    p_type: parsed.data.type,
    p_department: parsed.data.department,
    p_municipality: parsed.data.municipality,
    p_address: parsed.data.address ?? "",
  });

  if (error) {
    if (error.message.includes("USER_ALREADY_HAS_ORGANIZATION")) {
      redirect("/dashboard");
    }

    console.error("Blackbird onboarding error", error);
    onboardingError("No pudimos crear la empresa. Inténtalo nuevamente.");
  }

  redirect("/dashboard");
}
