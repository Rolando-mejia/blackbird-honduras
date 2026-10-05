import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function RolesPage() {
  const ctx = await getActiveContext();

  const { data: roles } = await ctx.supabase
    .from("roles")
    .select("id,name,description,is_system,organization_id")
    .or("organization_id.eq." + ctx.organization.id + ",organization_id.is.null")
    .order("is_system", { ascending: false })
    .order("name");

  const { data: permissions } = await ctx.supabase
    .from("permissions")
    .select("id,key,module_key,description")
    .order("module_key")
    .order("key");

  return (
    <AppShell
      activePath="/roles"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Seguridad</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Roles y permisos</h1>
        <p className="mt-2 text-sm text-neutral-500">Control granular siguiendo el principio de mínimo privilegio.</p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bb-card p-5">
          <p className="text-sm font-black">Roles disponibles</p>
          <div className="mt-4 space-y-3">
            {(roles ?? []).map((role) => (
              <div key={role.id} className="rounded-2xl border border-[var(--bb-line)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{role.name}</p>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-500">
                    {role.is_system ? "Sistema" : "Empresa"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{role.description || "Rol configurable para la organización."}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bb-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black">Matriz de permisos</p>
              <p className="mt-1 text-xs text-neutral-500">{(permissions ?? []).length} permisos registrados en el Core.</p>
            </div>
            <span className="rounded-full bg-[var(--bb-accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--bb-accent-strong)]">Granular</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(permissions ?? []).slice(0, 12).map((permission) => (
              <div key={permission.id} className="rounded-2xl bg-[var(--bb-soft)] p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">{permission.module_key}</p>
                <p className="mt-1 text-sm font-bold">{permission.key}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{permission.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-neutral-400">El editor visual para asignar permisos por rol se implementará en el siguiente incremento.</p>
        </section>
      </div>
    </AppShell>
  );
}
