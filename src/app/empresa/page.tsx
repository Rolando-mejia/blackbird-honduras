import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function EmpresaPage() {
  const ctx = await getActiveContext();
  const org = ctx.organization;

  const typeLabels: Record<string, string> = {
    company: "Sociedad",
    sole_trader: "Comerciante individual",
    independent_professional: "Profesional independiente",
    ngo: "ONG / asociación",
    other: "Otro",
  };

  return (
    <AppShell
      activePath="/empresa"
      fullName={ctx.fullName}
      organizationName={org.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Core</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Empresa</h1>
        <p className="mt-2 text-sm text-neutral-500">Información principal y contexto legal de tu organización.</p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bb-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black">{org.trade_name}</p>
              <p className="mt-1 text-xs text-neutral-500">{org.legal_name}</p>
            </div>
            <span className="rounded-full bg-[var(--bb-accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--bb-accent-strong)]">
              {org.status === "trial" ? "Demo" : "Activa"}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Tipo", typeLabels[org.type] ?? org.type],
              ["RTN", org.rtn || "Pendiente"],
              ["País", org.country_code],
              ["Moneda", org.currency_code],
              ["Zona horaria", org.timezone],
              ["Sucursal principal", ctx.branch?.name ?? "Pendiente"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--bb-soft)] p-4">
                <dt className="text-xs font-semibold text-neutral-400">{label}</dt>
                <dd className="mt-2 text-sm font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.5rem] bg-[var(--bb-ink)] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Identidad</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.035em]">Tu marca en cada documento.</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Reportes, facturas y documentos usarán la identidad de tu empresa. El editor de logo, datos de contacto y formatos se habilitará dentro de Configuración.
          </p>
          <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm">
            <p className="font-bold">Próximo paso</p>
            <p className="mt-1 text-xs text-white/45">Editar información empresarial y branding.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
