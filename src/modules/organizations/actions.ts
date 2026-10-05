"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z
  .object({
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
    isOnline: z.boolean(),
    department: z.string().trim().optional(),
    municipality: z.string().trim().optional(),
    address: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isOnline) return;

    if (!data.department || data.department.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["department"],
        message: "Selecciona el departamento de tu local principal",
      });
    }

    if (!data.municipality || data.municipality.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["municipality"],
        message: "Escribe el municipio de tu local principal",
      });
    }

    if (!data.address || data.address.length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Escribe la dirección de tu local principal",
      });
    }
  });

function onboardingError(message: string): never {
  redirect(`/onboarding?error=${encodeURIComponent(message)}`);
}

export async function createOrganization(formData: FormData) {
  if (!isSupabaseConfigured()) {
    onboardingError("Blackbird DEV todavía no está conectado a Supabase.");
  }

  const isOnline = formData.get("isOnline") === "true";

  const parsed = onboardingSchema.safeParse({
    tradeName: formData.get("tradeName"),
    legalName: formData.get("legalName"),
    rtn: formData.get("rtn") || undefined,
    type: formData.get("type"),
    isOnline,
    department: formData.get("department") || undefined,
    municipality: formData.get("municipality") || undefined,
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
    p_department: parsed.data.isOnline ? "" : parsed.data.department ?? "",
    p_municipality: parsed.data.isOnline ? "" : parsed.data.municipality ?? "",
    p_address: parsed.data.isOnline ? "" : parsed.data.address ?? "",
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
