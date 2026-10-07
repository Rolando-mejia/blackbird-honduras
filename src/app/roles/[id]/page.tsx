import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";
import {
  duplicateRoleAccess,
  updateRoleAccess,
} from "@/modules/users/actions";

type PermissionRow = {
  id: string;
  key: string;
  module_key: string;
  name: string | null;
  description: string | null;
  sort_order: number;
};

const moduleLabels: Record<string, string> = {
  core: "Core",
  crm: "Clientes / CRM",
  sales: "Ventas",
  inventory: "Inventario",
  purchasing: "Compras",
  finance: "Finanzas",
  accounting: "Contabilidad",
  hr: "RRHH",
  reports: "Reportería",
};

export default async function EditarRolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getActiveContext();

  if (!ctx.role?.is_owner_role) {
    redirect("/roles?error=Solo%20el%20Propietario%20puede%20editar%20roles.");
  }

  const [roleResult, permissionResult, assignedResult] = await Promise.all([
    ctx.supabase
      .from("roles")
      .select("id,name,description,is_owner_role,is_active,organization_id")
      .eq("id", id)
      .eq("organization_id", ctx.organization.id)
      .maybeSingle(),
    ctx.supabase
      .from("permissions")
      .select("id,key,module_key,name,description,sort_order")
      .order("sort_order"),
    ctx.supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", id),
  ]);

  const role = roleResult.data;

  if (!role) notFound();
  if (role.is_owner_role) redirect("/roles");

  const permissions = (permissionResult.data ?? []) as PermissionRow[];
  const assignedIds = new Set(
    (assignedResult.data ?? []).map((row) => String(row.permission_id)),
  );
  const moduleKeys: string[] = Array.from(
    new Set(permissions.map((permission) => permission.module_key)),
  );

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Seguridad
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
            {role.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ajusta permisos, nombre y estado del rol.
          </p>
        </div>
        <Link
          href="/roles"
          className="rounded-xl bg-[var(--bb-soft)] px-4 py-2 text-sm font-bold"
        >
          Volver
        </Link>
      </div>

      <form action={updateRoleAccess} className="mt-7 space-y-5">
        <input type="hidden" name="roleId" value={role.id} />

        <section className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Nombre
              <input
                name="name"
                required
                defaultValue={role.name}
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
            <label className="text-sm font-semibold">
              Descripción
              <input
                name="description"
                defaultValue={role.description ?? ""}
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--bb-soft)] p-4 text-sm font-bold">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={role.is_active}
            />
            Rol activo
          </label>
        </section>

        {moduleKeys.map((moduleKey) => (
          <fieldset
            key={moduleKey}
            className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm"
          >
            <legend className="px-2 text-base font-black">
              {moduleLabels[moduleKey] ?? moduleKey}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {permissions
                .filter((permission) => permission.module_key === moduleKey)
                .map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 rounded-2xl bg-[var(--bb-soft)] p-4"
                  >
                    <input
                      type="checkbox"
                      name="permissionKeys"
                      value={permission.key}
                      defaultChecked={assignedIds.has(permission.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-bold">
                        {permission.name ?? permission.key}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-neutral-500">
                        {permission.description}
                      </span>
                    </span>
                  </label>
                ))}
            </div>
          </fieldset>
        ))}

        <button className="rounded-2xl bg-neutral-950 px-6 py-4 text-sm font-black text-white">
          Guardar cambios
        </button>
      </form>

      <section className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white p-5">
        <p className="font-black">Duplicar rol</p>
        <p className="mt-1 text-sm text-neutral-500">
          Crea una copia con los mismos permisos para personalizarla después.
        </p>
        <form action={duplicateRoleAccess} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="roleId" value={role.id} />
          <input
            name="newName"
            required
            placeholder={`Copia de ${role.name}`}
            className="flex-1 rounded-xl border border-[var(--bb-line)] px-4 py-3 text-sm"
          />
          <button className="rounded-xl bg-[var(--bb-soft)] px-4 py-3 text-sm font-bold">
            Duplicar
          </button>
        </form>
      </section>
    </AppShell>
  );
}
