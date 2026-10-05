"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getActiveContext } from "@/lib/blackbird/context";

function setupFail(message: string): never {
  redirect(`/configuracion?error=${encodeURIComponent(message)}`);
}

async function saveStep(
  step: "company" | "tax" | "cai" | "employer",
  payload: Record<string, unknown>,
) {
  const ctx = await getActiveContext();

  const { error } = await ctx.supabase.rpc("save_blackbird_setup_step", {
    p_organization_id: ctx.organization.id,
    p_step: step,
    p_payload: payload,
  });

  if (error) {
    console.error(`Blackbird setup ${step} error`, error);
    setupFail("No pudimos guardar este paso. Revisa los datos e inténtalo nuevamente.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/configuracion");
  revalidatePath("/empresa");
}

export async function saveCompanySetup(formData: FormData) {
  const parsed = z
    .object({
      tradeName: z.string().trim().min(2, "Escribe el nombre comercial"),
      legalName: z.string().trim().min(2, "Escribe la razón social"),
    })
    .safeParse({
      tradeName: formData.get("tradeName"),
      legalName: formData.get("legalName"),
    });

  if (!parsed.success) {
    setupFail(parsed.error.issues[0]?.message ?? "Revisa los datos de la empresa.");
  }

  await saveStep("company", {
    trade_name: parsed.data.tradeName,
    legal_name: parsed.data.legalName,
  });

  redirect("/configuracion?message=Perfil%20empresarial%20guardado#tax");
}

export async function saveTaxSetup(formData: FormData) {
  const intent = String(formData.get("intent") ?? "save");

  if (intent === "skip") {
    await saveStep("tax", { skip: true });
    redirect("/configuracion?message=Paso%20fiscal%20marcado%20para%20después#cai");
  }

  const parsed = z
    .object({
      rtn: z.string().trim().min(5, "Escribe el RTN"),
      legalName: z.string().trim().min(2, "Escribe la razón social"),
      economicActivity: z.string().trim().max(500).optional(),
      fiscalAddress: z.string().trim().max(800).optional(),
      isTaxExempt: z.boolean(),
    })
    .safeParse({
      rtn: formData.get("rtn"),
      legalName: formData.get("legalName"),
      economicActivity: String(formData.get("economicActivity") ?? "") || undefined,
      fiscalAddress: String(formData.get("fiscalAddress") ?? "") || undefined,
      isTaxExempt: formData.get("isTaxExempt") === "true",
    });

  if (!parsed.success) {
    setupFail(parsed.error.issues[0]?.message ?? "Revisa los datos fiscales.");
  }

  await saveStep("tax", {
    rtn: parsed.data.rtn,
    legal_name: parsed.data.legalName,
    economic_activity: parsed.data.economicActivity ?? "",
    fiscal_address: parsed.data.fiscalAddress ?? "",
    is_tax_exempt: parsed.data.isTaxExempt,
  });

  redirect("/configuracion?message=Datos%20fiscales%20guardados#cai");
}

export async function saveCaiSetup(formData: FormData) {
  const intent = String(formData.get("intent") ?? "save");

  if (intent === "skip") {
    await saveStep("cai", { skip: true });
    redirect("/configuracion?message=CAI%20marcado%20para%20después#employer");
  }

  const parsed = z
    .object({
      cai: z.string().trim().min(5, "Escribe el CAI"),
      documentType: z.string().trim().min(2, "Escribe el tipo de documento"),
      establishment: z.string().trim().min(1, "Escribe el establecimiento"),
      emissionPoint: z.string().trim().min(1, "Escribe el punto de emisión"),
      documentCode: z.string().trim().min(1, "Escribe el código del documento"),
      rangeStart: z.string().trim().min(1, "Escribe el rango inicial"),
      rangeEnd: z.string().trim().min(1, "Escribe el rango final"),
      currentSequence: z.string().trim().min(1, "Escribe el correlativo actual"),
      authorizationDate: z.string().trim().optional(),
      deadlineDate: z.string().trim().min(8, "Escribe la fecha límite de emisión"),
    })
    .safeParse({
      cai: formData.get("cai"),
      documentType: formData.get("documentType"),
      establishment: formData.get("establishment"),
      emissionPoint: formData.get("emissionPoint"),
      documentCode: formData.get("documentCode"),
      rangeStart: formData.get("rangeStart"),
      rangeEnd: formData.get("rangeEnd"),
      currentSequence: formData.get("currentSequence"),
      authorizationDate: String(formData.get("authorizationDate") ?? "") || undefined,
      deadlineDate: formData.get("deadlineDate"),
    });

  if (!parsed.success) {
    setupFail(parsed.error.issues[0]?.message ?? "Revisa los datos del CAI.");
  }

  await saveStep("cai", {
    cai: parsed.data.cai,
    document_type: parsed.data.documentType,
    establishment: parsed.data.establishment,
    emission_point: parsed.data.emissionPoint,
    document_code: parsed.data.documentCode,
    range_start: parsed.data.rangeStart,
    range_end: parsed.data.rangeEnd,
    current_sequence: parsed.data.currentSequence,
    authorization_date: parsed.data.authorizationDate ?? "",
    deadline_date: parsed.data.deadlineDate,
  });

  redirect("/configuracion?message=CAI%20guardado#employer");
}

export async function saveEmployerSetup(formData: FormData) {
  const intent = String(formData.get("intent") ?? "save");

  if (intent === "skip") {
    await saveStep("employer", { skip: true });
    redirect("/configuracion?message=Perfil%20patronal%20marcado%20para%20después");
  }

  const parsed = z
    .object({
      representativeName: z.string().trim().min(2, "Escribe el representante"),
      payrollFrequency: z.string().trim().min(2, "Selecciona la frecuencia de planilla"),
      ihssEmployerNumber: z.string().trim().max(100).optional(),
      rapEmployerNumber: z.string().trim().max(100).optional(),
    })
    .safeParse({
      representativeName: formData.get("representativeName"),
      payrollFrequency: formData.get("payrollFrequency"),
      ihssEmployerNumber: String(formData.get("ihssEmployerNumber") ?? "") || undefined,
      rapEmployerNumber: String(formData.get("rapEmployerNumber") ?? "") || undefined,
    });

  if (!parsed.success) {
    setupFail(parsed.error.issues[0]?.message ?? "Revisa los datos patronales.");
  }

  await saveStep("employer", {
    representative_name: parsed.data.representativeName,
    payroll_frequency: parsed.data.payrollFrequency,
    ihss_employer_number: parsed.data.ihssEmployerNumber ?? "",
    rap_employer_number: parsed.data.rapEmployerNumber ?? "",
  });

  redirect("/configuracion?message=Configuración%20guardada");
}
