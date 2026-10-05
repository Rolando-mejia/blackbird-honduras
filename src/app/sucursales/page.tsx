import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function SucursalesPage() {
  const ctx = await getActiveContext();
  const { data: branches } = await ctx.supabase
    .from("branches")
    .select("id,name,code,address,department,municipality,is_main,is_active")
    .eq("organization_id", ctx.organization.id)
    .order("is_main", { ascending: false })
    .order("name");

  return (
    <AppShell
      activePath="/sucursales"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Core</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Sucursales</h1>
          <p className="mt-2 text-sm text-neutral-500">Ubicaciones operativas de {ctx.organization.trade_name}.</p>
        </div>
        <span className="rounded-full border border-[var(--bb-line)] bg-white px-3 py-2 text-xs font-bold text-neutral-500">
          Starter · 1 incluida
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(branches ?? []).map((branch) => (
          <article key={branch.id} className="bb-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black tracking-[-0.025em]">{branch.name}</p>
                <p className="mt-1 text-xs text-neutral-400">Código {branch.code}</p>
              </div>
              <div className="flex gap-2">
                {branch.is_main ? (
                  <span className="rounded-full bg-[var(--bb-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--bb-accent-strong)]">
                    Principal
                  </span>
                ) : null}
                <span className={branch.is_active ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700" : "rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-400"}>
                  {branch.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-[var(--bb-soft)] p-4 text-sm">
              <p className="font-semibold">{[branch.municipality, branch.department].filter(Boolean).join(", ") || "Ubicación pendiente"}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{branch.address || "Dirección pendiente"}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-[var(--bb-line)] bg-white/60 p-5 text-sm text-neutral-500">
        La creación de sucursales adicionales se habilitará junto con las reglas de plan. Starter conservará una sola sucursal; Business permitirá hasta cinco.
      </div>
    </AppShell>
  );
}
