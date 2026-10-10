import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CollapsibleFormSection } from "@/components/collapsible-form-section";
import { getActiveContext } from "@/lib/blackbird/context";
import { getOrganizationSetup } from "@/lib/blackbird/setup";
import {
  saveCaiSetup,
  saveCompanySetup,
  saveEmployerSetup,
  saveTaxSetup,
} from "@/modules/setup/actions";

const inputClass =
  "mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5 text-sm";

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getActiveContext();
  const setup = await getOrganizationSetup(ctx.supabase, ctx.organization.id);

  const { data: subscription } = await ctx.supabase
    .from("subscriptions")
    .select("id,status,plan_id,current_period_start,current_period_end")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let planName = "Starter";
  if (subscription?.plan_id) {
    const { data: plan } = await ctx.supabase
      .from("plans")
      .select("name")
      .eq("id", subscription.plan_id)
      .maybeSingle();
    planName = plan?.name ?? planName;
  }

  const byKey = new Map(setup.steps.map((step) => [step.key, step]));

  return (
    <AppShell
      activePath="/configuracion"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
      organizationId={ctx.organization.id}
      branchId={ctx.branch?.id}
      organizationOptions={ctx.organizationOptions}
      branchOptions={ctx.branchOptions}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Asistente de empresa
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
            Termina tu configuración
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Completa únicamente lo que aplique a tu empresa. Si todavía no tienes RTN, CAI o empleados, puedes indicarlo y continuar usando Blackbird.
          </p>
        </div>
        <div className="rounded-3xl bg-neutral-950 px-5 py-4 text-white">
          <p className="text-xs text-neutral-500">{planName} · progreso</p>
          <p className="mt-1 text-2xl font-black">{setup.completion}%</p>
        </div>
      </div>

      {params.error ? (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {params.error}
        </div>
      ) : null}

      {params.message ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {params.message}
        </div>
      ) : null}

      <section id="appearance" className="mt-7 rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Apariencia
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">
              Tema de Blackbird
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Elige modo claro, oscuro o deja que Blackbird siga automáticamente la configuración de tu dispositivo.
            </p>
          </div>
          <ThemeSwitcher />
        </div>
        <p className="mt-4 text-xs leading-5 text-neutral-400">
          La preferencia se guarda en este dispositivo y se aplica a toda la interfaz.
        </p>
      </section>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {setup.steps.map((step, index) => (
          <Link
            key={step.key}
            href={step.href}
            className={`rounded-2xl border p-4 transition ${
              step.done
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-[var(--bb-line)] bg-white"
            }`}
          >
            <p className="text-xs font-bold text-neutral-400">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm font-black">{step.label}</p>
            <p className={`mt-1 text-xs ${step.done ? "text-emerald-700" : "text-amber-700"}`}>
              {step.statusLabel}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-7 space-y-5">
        <CollapsibleFormSection
          id="company"
          eyebrow="01"
          title="Perfil empresarial"
          description="Datos principales que verá Blackbird en toda la operación."
          status={byKey.get("company")?.statusLabel ?? "Listo"}
          defaultOpen={setup.nextStep?.key === "company"}
          className="scroll-mt-24"
        >
          <form action={saveCompanySetup} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Nombre comercial
              <input
                name="tradeName"
                defaultValue={ctx.organization.trade_name}
                required
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Razón social / nombre legal
              <input
                name="legalName"
                defaultValue={ctx.organization.legal_name}
                required
                className={inputClass}
              />
            </label>
            <button className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white md:col-span-2 md:w-fit">
              Guardar perfil empresarial
            </button>
          </form>
        </CollapsibleFormSection>

        <CollapsibleFormSection
          id="tax"
          eyebrow="02"
          title="RTN y datos fiscales"
          description="Configúralos si ya estás registrado. Si aún no tienes RTN, puedes continuar."
          status={byKey.get("tax")?.statusLabel ?? "Pendiente"}
          defaultOpen={setup.nextStep?.key === "tax"}
          className="scroll-mt-24"
        >
          <form action={saveTaxSetup} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              RTN
              <input
                name="rtn"
                defaultValue={setup.taxProfile?.rtn ?? ctx.organization.rtn ?? ""}
                className={inputClass}
                placeholder="RTN de la empresa"
              />
            </label>
            <label className="text-sm font-semibold">
              Razón social fiscal
              <input
                name="legalName"
                defaultValue={setup.taxProfile?.legal_name ?? ctx.organization.legal_name}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Actividad económica
              <input
                name="economicActivity"
                defaultValue={setup.taxProfile?.economic_activity ?? ""}
                className={inputClass}
                placeholder="Según tu registro, cuando aplique"
              />
            </label>
            <label className="text-sm font-semibold">
              Dirección fiscal
              <input
                name="fiscalAddress"
                defaultValue={setup.taxProfile?.fiscal_address ?? ""}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-[var(--bb-soft)] p-4 text-sm font-semibold md:col-span-2">
              <input
                type="checkbox"
                name="isTaxExempt"
                value="true"
                defaultChecked={Boolean(setup.taxProfile?.is_tax_exempt)}
                className="h-4 w-4"
              />
              La empresa maneja condición de exención/exoneración que debe registrarse.
            </label>
            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
              <button
                name="intent"
                value="save"
                className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white"
              >
                Guardar datos fiscales
              </button>
              <button
                name="intent"
                value="skip"
                formNoValidate
                className="rounded-2xl bg-[var(--bb-soft)] px-5 py-3.5 text-sm font-bold text-neutral-700"
              >
                Todavía no tengo RTN
              </button>
            </div>
          </form>
        </CollapsibleFormSection>

        <CollapsibleFormSection
          id="cai"
          eyebrow="03"
          title="CAI"
          description="Registra la autorización únicamente si ya cuentas con ella."
          status={byKey.get("cai")?.statusLabel ?? "Pendiente"}
          defaultOpen={setup.nextStep?.key === "cai"}
          className="scroll-mt-24"
        >
          <form action={saveCaiSetup} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">
              CAI
              <input
                name="cai"
                defaultValue={setup.caiAuthorization?.cai ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Tipo de documento
              <input
                name="documentType"
                defaultValue={setup.caiAuthorization?.document_type ?? "Factura"}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Código de documento
              <input
                name="documentCode"
                defaultValue={setup.caiAuthorization?.document_code ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Establecimiento
              <input
                name="establishment"
                defaultValue={setup.caiAuthorization?.establishment ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Punto de emisión
              <input
                name="emissionPoint"
                defaultValue={setup.caiAuthorization?.emission_point ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Rango inicial
              <input
                name="rangeStart"
                defaultValue={setup.caiAuthorization?.range_start ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Rango final
              <input
                name="rangeEnd"
                defaultValue={setup.caiAuthorization?.range_end ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Correlativo actual
              <input
                name="currentSequence"
                defaultValue={setup.caiAuthorization?.current_sequence ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Fecha de autorización
              <input
                name="authorizationDate"
                type="date"
                defaultValue={setup.caiAuthorization?.authorization_date ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Fecha límite de emisión
              <input
                name="deadlineDate"
                type="date"
                defaultValue={setup.caiAuthorization?.deadline_date ?? ""}
                className={inputClass}
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
              <button
                name="intent"
                value="save"
                className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white"
              >
                Guardar CAI
              </button>
              <button
                name="intent"
                value="skip"
                formNoValidate
                className="rounded-2xl bg-[var(--bb-soft)] px-5 py-3.5 text-sm font-bold text-neutral-700"
              >
                Todavía no tengo CAI
              </button>
            </div>
          </form>
        </CollapsibleFormSection>

        <CollapsibleFormSection
          id="employer"
          eyebrow="04"
          title="Perfil patronal"
          description="Úsalo cuando la empresa tenga empleados y necesite preparar RRHH y planilla."
          status={byKey.get("employer")?.statusLabel ?? "Pendiente"}
          defaultOpen={setup.nextStep?.key === "employer"}
          className="scroll-mt-24"
        >
          <form action={saveEmployerSetup} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Representante
              <input
                name="representativeName"
                defaultValue={setup.employerProfile?.representative_name ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Frecuencia de planilla
              <select
                name="payrollFrequency"
                defaultValue={setup.employerProfile?.payroll_frequency ?? ""}
                className={inputClass}
              >
                <option value="">Seleccionar</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="custom">Personalizada</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Número patronal IHSS
              <input
                name="ihssEmployerNumber"
                defaultValue={setup.employerProfile?.ihss_employer_number ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Número patronal RAP
              <input
                name="rapEmployerNumber"
                defaultValue={setup.employerProfile?.rap_employer_number ?? ""}
                className={inputClass}
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
              <button
                name="intent"
                value="save"
                className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white"
              >
                Guardar perfil patronal
              </button>
              <button
                name="intent"
                value="skip"
                formNoValidate
                className="rounded-2xl bg-[var(--bb-soft)] px-5 py-3.5 text-sm font-bold text-neutral-700"
              >
                Todavía no tengo empleados
              </button>
            </div>
          </form>
        </CollapsibleFormSection>
      </div>

      <p className="mt-6 text-xs leading-5 text-neutral-400">
        Estos datos pueden editarse después. Marcar un paso como “todavía no” no activa funciones fiscales ni patronales; solamente evita bloquear el avance de configuración.
      </p>
    </AppShell>
  );
}
