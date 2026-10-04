import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

const modules = [
  ["Ventas y POS", "Starter", "Configuración siguiente"],
  ["Inventario", "Starter", "Configuración siguiente"],
  ["Contabilidad", "Starter", "Configuración siguiente"],
  ["RRHH y Planilla", "Starter", "Configuración siguiente"],
] as const;

export default async function DashboardPage() {
  const ctx = await getActiveContext();
  const orgId = ctx.organization.id as string;

  const [branchesResult, membersResult, caiResult, employerResult, auditResult] = await Promise.all([
    ctx.supabase.from("branches").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_active", true),
    ctx.supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    ctx.supabase.from("hn_cai_authorizations").select("id").eq("organization_id", orgId).eq("is_active", true).limit(1),
    ctx.supabase.from("hn_employer_profiles").select("id").eq("organization_id", orgId).limit(1),
    ctx.supabase.from("audit_logs").select("id,action,entity_type,occurred_at").eq("organization_id", orgId).order("occurred_at", { ascending: false }).limit(5),
  ]);

  const hasRtn = Boolean(ctx.organization.rtn);
  const hasCai = (caiResult.data?.length ?? 0) > 0;
  const hasEmployer = (employerResult.data?.length ?? 0) > 0;
  const readiness = [hasRtn, hasCai, hasEmployer].filter(Boolean).length;
  const firstName = ctx.fullName.split(" ")[0];

  const cards = [
    ["Usuarios", String(membersResult.count ?? 0), "5 incluidos en Starter"],
    ["Sucursales", String(branchesResult.count ?? 0), "1 incluida en Starter"],
    ["Configuración", `${readiness}/3`, "Honduras base"],
    ["Plan", "Starter", ctx.organization.status === "trial" ? "Demo Pro activa" : "Suscripción"],
  ] as const;

  return (
    <AppShell
      activePath="/dashboard"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <section className="flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Resumen de hoy</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Hola, {firstName}.</h1>
            <p className="mt-2 text-sm text-neutral-500">Aquí comienza el centro de control de {ctx.organization.trade_name}.</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-[var(--bb-line)] bg-white px-3 py-2 text-xs font-bold text-neutral-500">Honduras</span>
            <span className="rounded-full bg-[var(--bb-accent-soft)] px-3 py-2 text-xs font-bold text-[var(--bb-accent-strong)]">Alpha Core</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, meta]) => (
            <div key={label} className="bb-card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-500">{label}</p>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--bb-accent)]" />
              </div>
              <p className="mt-6 text-3xl font-black tracking-[-0.04em]">{value}</p>
              <p className="mt-1 text-xs text-neutral-400">{meta}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="bb-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black">Starter: base operativa</p>
                <p className="mt-1 text-xs text-neutral-500">Construiremos cada módulo sobre este Core.</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-500">4 áreas</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {modules.map(([name, plan, detail]) => (
                <div key={name} className="rounded-2xl border border-[var(--bb-line)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{name}</span>
                    <span className="rounded-full bg-[var(--bb-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--bb-accent-strong)]">{plan}</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] bg-[var(--bb-ink)] p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Honduras</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.035em]">Configuración fiscal</h2>
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["Perfil empresarial", true],
                ["RTN", hasRtn],
                ["CAI", hasCai],
                ["Perfil patronal", hasEmployer],
              ].map(([label, done]) => (
                <div key={String(label)} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                  <span className="text-white/70">{label}</span>
                  <span className={done ? "font-bold text-emerald-400" : "font-bold text-white/30"}>{done ? "Listo" : "Pendiente"}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bb-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black">Actividad reciente</p>
              <p className="mt-1 text-xs text-neutral-500">Primer vistazo a la bitácora inmutable.</p>
            </div>
            <a href="/auditoria" className="text-xs font-bold text-[var(--bb-accent-strong)]">Ver auditoría</a>
          </div>
          <div className="mt-5 divide-y divide-[var(--bb-line)]">
            {(auditResult.data ?? []).length ? (auditResult.data ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{item.action}</p>
                  <p className="mt-1 text-xs text-neutral-400">{item.entity_type}</p>
                </div>
                <time className="text-xs text-neutral-400">{new Date(item.occurred_at).toLocaleDateString("es-HN")}</time>
              </div>
            )) : (
              <div className="py-6 text-sm text-neutral-400">La actividad de tu empresa aparecerá aquí.</div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
