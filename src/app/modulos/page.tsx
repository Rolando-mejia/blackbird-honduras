import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function ModulosPage() {
  const ctx = await getActiveContext();

  const [modulesResult, featuresResult] = await Promise.all([
    ctx.supabase
      .from("modules")
      .select("id,key,name,description,category,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    ctx.supabase
      .from("organization_features")
      .select("module_id,enabled,source")
      .eq("organization_id", ctx.organization.id),
  ]);

  const featureMap = new Map((featuresResult.data ?? []).map((feature) => [feature.module_id, feature]));

  return (
    <AppShell
      activePath="/modulos"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
      organizationId={ctx.organization.id}
      branchId={ctx.branch?.id}
      organizationOptions={ctx.organizationOptions}
      branchOptions={ctx.branchOptions}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Starter</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Módulos</h1>
        <p className="mt-2 text-sm text-neutral-500">Blackbird mostrará solo lo que tenga sentido para tu operación.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(modulesResult.data ?? []).map((module) => {
          const feature = featureMap.get(module.id);
          const enabled = Boolean(feature?.enabled);

          return (
            <article key={module.id} className="bb-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--bb-accent-soft)] font-black text-[var(--bb-accent-strong)]">
                  {module.name.slice(0, 1)}
                </div>
                <span className={enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700" : "rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-400"}>
                  {enabled ? "Activo" : "Standby"}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-black">{module.name}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-neutral-500">{module.description || "Módulo de Blackbird."}</p>
              <p className="mt-5 text-[10px] font-black uppercase tracking-wide text-neutral-400">{module.category || "Operación"}</p>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
