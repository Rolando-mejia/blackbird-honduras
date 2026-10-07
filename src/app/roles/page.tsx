import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function RolesPage() {
  const ctx = await getActiveContext();
  const isOwner = Boolean(ctx.role?.is_owner_role);

  const { data: roles } = await ctx.supabase
    .from("roles")
    .select("id,name,description,is_system,is_owner_role,is_active,organization_id")
    .eq("organization_id", ctx.organization.id)
    .order("is_owner_role", { ascending: false })
    .order("name");

  const { data: permissions } = await ctx.supabase
    .from("permissions")
    .select("id,key,module_key,name,description,sort_order")
    .order("sort_order")
    .order("name");

  return (
    <AppShell
      activePath="/roles"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
      organizationId={ctx.organization.id}
      branchId={ctx.branch?.id}
      organizationOptions={ctx.organizationOptions}
      branchOptions={ctx.branchOptions}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Seguridad</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Roles y permisos</h1>
          <p className="mt-2 text-sm text-neutral-500">Control granular siguiendo el principio de mínimo privilegio.</p>
        </div>
        {isOwner ? (
          <Link href="/roles/nuevo" className="rounded-2xl bg-neutral-950 px-5 py-3 text-center text-sm font-bold text-white">
            + Crear rol
          </Link>
        ) : null}
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
                    {role.is_owner_role ? "Protegido" : role.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{role.description || "Rol configurable para la organización."}</p>
                {isOwner && !role.is_owner_role ? (
                  <Link href={`/roles/${role.id}`} className="mt-3 inline-flex rounded-xl bg-[var(--bb-soft)] px-3 py-2 text-xs font-bold">
                    Editar rol y permisos
                  </Link>
                ) : null}
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
            {(permissions ?? []).map((permission) => (
              <div key={permission.id} className="rounded-2xl bg-[var(--bb-soft)] p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">{permission.module_key}</p>
                <p className="mt-1 text-sm font-bold">{permission.name ?? permission.key}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{permission.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-neutral-400">Los permisos ya están activos en la base de seguridad y se agrupan por módulo para mantener la configuración comprensible.</p>
        </section>
      </div>
    </AppShell>
  );
}
