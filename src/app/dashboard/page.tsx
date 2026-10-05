import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

const starterModules = [
  ["Ventas y POS", "Operación comercial"],
  ["Inventario", "Stock y movimientos"],
  ["CxC / CxP", "Cobros y obligaciones"],
  ["Contabilidad", "Finanzas conectadas"],
  ["RRHH / Planilla", "Equipo y nómina"],
  ["Reportería", "Indicadores del negocio"],
] as const;

export default async function DashboardPage() {
  const ctx = await getActiveContext();
  const orgId = ctx.organization.id;

  const [branchesResult, membersResult, caiResult, employerResult, subscriptionResult] = await Promise.all([
    ctx.supabase.from("branches").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_active", true),
    ctx.supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    ctx.supabase.from("hn_cai_authorizations").select("id").eq("organization_id", orgId).eq("is_active", true).limit(1),
    ctx.supabase.from("hn_employer_profiles").select("id").eq("organization_id", orgId).limit(1),
    ctx.supabase.from("subscriptions").select("plan_id,status,current_period_end").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  let planName = "Starter";
  if (subscriptionResult.data?.plan_id) {
    const { data: plan } = await ctx.supabase.from("plans").select("name").eq("id", subscriptionResult.data.plan_id).maybeSingle();
    if (plan?.name) planName = plan.name;
  }

  const setup = [
    { label: "Perfil empresarial", done: true, href: "/empresa" },
    { label: "RTN / datos fiscales", done: Boolean(ctx.organization.rtn), href: "/empresa" },
    { label: "CAI", done: (caiResult.data?.length ?? 0) > 0, href: "/configuracion" },
    { label: "Perfil patronal", done: (employerResult.data?.length ?? 0) > 0, href: "/configuracion" },
  ];
  const complete = setup.filter((item) => item.done).length;
  const completion = Math.round((complete / setup.length) * 100);

  return (
    <AppShell
      activePath="/dashboard"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Resumen del negocio</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Hola, {ctx.fullName.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-neutral-500">Aquí está el estado de tu empresa en Blackbird.</p>
        </div>
        <div className="rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3 text-sm">
          <span className="text-neutral-400">Plan</span> <strong className="ml-2">{planName}</strong>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Empresa", ctx.organization.trade_name, ctx.organization.rtn ? "RTN configurado" : "RTN pendiente"],
          ["Usuarios", String(membersResult.count ?? 0), "5 incluidos en Starter"],
          ["Sucursales", String(branchesResult.count ?? 0), planName === "Starter" ? "1 incluida" : "Según tu plan"],
          ["Configuración", `${completion}%`, `${complete} de ${setup.length} pasos`],
        ].map(([label,value,meta]) => (
          <div key={label} className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
              <span className="h-2 w-2 rounded-full bg-[var(--bb-accent)]" />
            </div>
            <p className="mt-5 truncate text-2xl font-black tracking-[-0.035em]">{value}</p>
            <p className="mt-1 truncate text-sm text-neutral-500">{meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black tracking-[-0.025em]">Starter: núcleo operativo</p>
              <p className="mt-1 text-sm text-neutral-500">Estamos construyendo los módulos que permitirán operar desde el plan inicial.</p>
            </div>
            <span className="rounded-full bg-[var(--bb-accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--bb-accent-strong)]">Sprint 1</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {starterModules.map(([name,meta], index) => (
              <div key={name} className="rounded-2xl border border-[var(--bb-line)] p-4">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl text-sm font-black ${index === 0 ? "bg-[var(--bb-accent)] text-white" : "bg-[var(--bb-soft)] text-neutral-500"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-neutral-500">{meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/empresa" className="rounded-2xl bg-neutral-950 p-4 text-white">
              <p className="text-sm font-bold">Revisar empresa</p>
              <p className="mt-1 text-xs text-neutral-400">Datos, RTN y estructura</p>
            </Link>
            <Link href="/usuarios" className="rounded-2xl bg-[var(--bb-soft)] p-4">
              <p className="text-sm font-bold">Usuarios</p>
              <p className="mt-1 text-xs text-neutral-500">Equipo y accesos</p>
            </Link>
            <Link href="/roles" className="rounded-2xl bg-[var(--bb-soft)] p-4">
              <p className="text-sm font-bold">Roles</p>
              <p className="mt-1 text-xs text-neutral-500">Permisos y control</p>
            </Link>
          </div>
        </section>

        <section className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Configuración Honduras</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-4xl font-black tracking-[-0.05em]">{completion}%</p>
              <p className="mt-1 text-sm text-neutral-400">preparado</p>
            </div>
            <div className="h-14 w-14 rounded-full border-[7px] border-neutral-800 border-t-[var(--bb-accent)]" />
          </div>

          <div className="mt-7 space-y-3">
            {setup.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                <span className="text-sm font-semibold">{item.label}</span>
                <span className={item.done ? "text-emerald-400" : "text-neutral-500"}>{item.done ? "Listo" : "Pendiente"}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
