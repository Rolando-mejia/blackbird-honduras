import type { SupabaseClient } from "@supabase/supabase-js";

export type SetupStepKey = "company" | "tax" | "cai" | "employer";

export type SetupStepStatus =
  | "complete"
  | "pending"
  | "not_registered_yet"
  | "not_available_yet"
  | "not_employer_yet";

export type SetupStep = {
  key: SetupStepKey;
  label: string;
  description: string;
  href: string;
  status: SetupStepStatus;
  done: boolean;
  statusLabel: string;
};

function normalizeStatus(value: unknown): SetupStepStatus {
  if (
    value === "complete" ||
    value === "not_registered_yet" ||
    value === "not_available_yet" ||
    value === "not_employer_yet"
  ) {
    return value;
  }

  return "pending";
}

function statusLabel(status: SetupStepStatus) {
  switch (status) {
    case "complete":
      return "Listo";
    case "not_registered_yet":
      return "Sin RTN por ahora";
    case "not_available_yet":
      return "Sin CAI por ahora";
    case "not_employer_yet":
      return "Sin empleados por ahora";
    default:
      return "Pendiente";
  }
}

export async function getOrganizationSetup(
  supabase: SupabaseClient,
  organizationId: string,
) {
  const [settingsResult, taxResult, caiResult, employerResult] =
    await Promise.all([
      supabase
        .from("organization_settings")
        .select("settings")
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase
        .from("hn_tax_profiles")
        .select(
          "id,rtn,legal_name,economic_activity,fiscal_address,is_tax_exempt",
        )
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase
        .from("hn_cai_authorizations")
        .select(
          "id,cai,document_type,establishment,emission_point,document_code,range_start,range_end,current_sequence,authorization_date,deadline_date,is_active",
        )
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hn_employer_profiles")
        .select(
          "id,ihss_employer_number,rap_employer_number,representative_name,payroll_frequency,config",
        )
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ]);

  const settings =
    settingsResult.data?.settings &&
    typeof settingsResult.data.settings === "object"
      ? (settingsResult.data.settings as Record<string, unknown>)
      : {};

  const setupSettings =
    settings.setup && typeof settings.setup === "object"
      ? (settings.setup as Record<string, unknown>)
      : {};

  const companyStatus: SetupStepStatus = "complete";
  const taxStatus = taxResult.data
    ? "complete"
    : normalizeStatus(setupSettings.tax);
  const caiStatus = caiResult.data
    ? "complete"
    : normalizeStatus(setupSettings.cai);
  const employerStatus = employerResult.data
    ? "complete"
    : normalizeStatus(setupSettings.employer);

  const rawSteps: Array<{
    key: SetupStepKey;
    label: string;
    description: string;
    status: SetupStepStatus;
  }> = [
    {
      key: "company",
      label: "Perfil empresarial",
      description: "Nombre comercial y razón social",
      status: companyStatus,
    },
    {
      key: "tax",
      label: "RTN / datos fiscales",
      description: "Información fiscal básica",
      status: taxStatus,
    },
    {
      key: "cai",
      label: "CAI",
      description: "Autorización de facturación, cuando aplique",
      status: caiStatus,
    },
    {
      key: "employer",
      label: "Perfil patronal",
      description: "Datos para RRHH y planilla, cuando aplique",
      status: employerStatus,
    },
  ];

  const steps: SetupStep[] = rawSteps.map((step) => ({
    ...step,
    href: `/configuracion#${step.key}`,
    done: step.status !== "pending",
    statusLabel: statusLabel(step.status),
  }));

  const completedCount = steps.filter((step) => step.done).length;
  const completion = Math.round((completedCount / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done) ?? null;

  return {
    settings,
    taxProfile: taxResult.data,
    caiAuthorization: caiResult.data,
    employerProfile: employerResult.data,
    steps,
    completedCount,
    completion,
    nextStep,
  };
}
