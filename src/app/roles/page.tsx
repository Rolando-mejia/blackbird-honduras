import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";
import {
  createRoleFromUsersModule,
  duplicateRoleAccess,
  updateRoleAccess,
} from "@/modules/users/actions";

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

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getActiveContext();
  const isOwner = Boolean(ctx.role?.is_owner_role);

  const [{ data: roles = [] }, { data: permissions = [] }] = await Promise.all([
    ctx.supabase
      .from("roles")
      .select("id,name,description,is_system,is_owner_role,is_active,organization_id")
      .eq("organization_id", ctx.organization.id)
      .order("is_owner_role", { ascending: false })
      .order("name"),
    ctx.supabase
      .from("permissions")
      .select("id,key,module_key,name,description,sort_order")
      .order("sort_order")
      .order("name"),
  ]);

  const roleIds = roles.map((role) => role.id);
  const { data: rolePermissionRows = [] } = roleIds.length
    ? await ctx.supabase
        .from("role_permissions")
        .select("role_id,permission_id")
        .in("role_id", roleIds)
    : { data: [] };

  const permissionsByRole = new Map<string, Set<string>>();
  const permissionKeyById = new Map(
    permissions.map((permission) => [permission.id, permission.key]),
  );

  for (const row of rolePermissionRows) {
    const key = permissionKeyById.get(row.permission_id);
    if (!key) continue;
    const current = permissionsByRole.get(row.role_id) ?? new Set<string>();
    current.add(key);
    permissionsByRole.set(row.role_id, current);
  }

  const groupedPermissions = new Map<string, typeof permissions>();
  for (const permission of permissions) {
    const current = groupedPermissions.get(permission.module_key) ?? [];
    current.push(permission);
    groupedPermissions.set(permission.module_key, current);
  }

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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Seguridad
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
            Roles y permisos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Define exactamente qué puede ver y hacer cada tipo de usuario.
          </p>
        </div>
        <span className="rounded-full border border-[var(--bb-line)] bg-white px-4 py-2 text-xs font-bold text-neutral-500">
          {permissions.length} permisos granulares
        </span>
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

      {isOwner ? (
        <details className="mt-6 rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm">
          <summary className="cursor-pointer list-none font-black">
            + Crear rol personalizado
          </summary>

          <form action={createRoleFromUsersModule} className="mt-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Nombre del rol
                <input
                  name="name"
                  required
                  placeholder="Ej. Encargado de tienda"
                  className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                Descripción
                <input
                  name="description"
                  placeholder="Qué responsabilidad tendrá"
                  className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-5 space-y-4">
              {Array.from(groupedPermissions.entries()).map(
                ([moduleKey, modulePermissions]) => (
                  <fieldset
                    key={moduleKey}
                    className="rounded-2xl border border-[var(--bb-line)] p-4"
                  >
                    <legend className="px-2 text-sm font-black">
                      {moduleLabels[moduleKey] ?? moduleKey}
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {modulePermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start gap-3 rounded-xl bg-[var(--bb-soft)] p-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="permissionKeys"
                            value={permission.key}
                            className="mt-1"
                          />
                          <span>
                            <span className="font-bold">
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
                ),
              )}
            </div>

            <button className="mt-5 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white">
              Crear rol
            </button>
          </form>
        </details>
      ) : (
        <div className="mt-6 rounded-3xl bg-[var(--bb-soft)] p-5 text-sm text-neutral-600">
          Solo el Propietario puede cambiar la matriz de roles. Tu rol puede consultar
          la configuración actual.
        </div>
      )}

      <div className="mt-8 space-y-4">
        {roles.map((role) => {
          const assigned = permissionsByRole.get(role.id) ?? new Set<string>();
          const ownerPermissionCount = role.is_owner_role
            ? permissions.length
            : assigned.size;

          return (
            <details
              key={role.id}
              className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm"
              open={role.is_owner_role}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black">{role.name}</h2>
                      {role.is_owner_role ? (
                        <span className="rounded-full bg-[var(--bb-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--bb-accent-strong)]">
                          Protegido
                        </span>
                      ) : (
                        <span
                          className={
                            role.is_active
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700"
                              : "rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-500"
                          }
                        >
                          {role.is_active ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {role.description || "Rol configurable de la empresa."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-400">
                    {ownerPermissionCount} permisos
                  </span>
                </div>
              </summary>

              {role.is_owner_role ? (
                <div className="mt-5 rounded-2xl bg-neutral-950 p-5 text-white">
                  <p className="text-sm font-black">
                    Propietario tiene control total
                  </p>
                  <p className="mt-2 text-xs leading-5 text-neutral-400">
                    Este rol no puede inactivarse ni perder permisos desde el editor.
                    Así evitamos que una empresa quede sin un administrador principal.
                  </p>
                </div>
              ) : (
                <div className="mt-5 border-t border-[var(--bb-line)] pt-5">
                  {isOwner ? (
                    <>
                      <form action={updateRoleAccess}>
                        <input type="hidden" name="roleId" value={role.id} />
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

                        <div className="mt-5 space-y-4">
                          {Array.from(groupedPermissions.entries()).map(
                            ([moduleKey, modulePermissions]) => (
                              <fieldset
                                key={moduleKey}
                                className="rounded-2xl border border-[var(--bb-line)] p-4"
                              >
                                <legend className="px-2 text-sm font-black">
                                  {moduleLabels[moduleKey] ?? moduleKey}
                                </legend>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {modulePermissions.map((permission) => (
                                    <label
                                      key={permission.id}
                                      className="flex items-start gap-3 rounded-xl bg-[var(--bb-soft)] p-3 text-sm"
                                    >
                                      <input
                                        type="checkbox"
                                        name="permissionKeys"
                                        value={permission.key}
                                        defaultChecked={assigned.has(permission.key)}
                                        className="mt-1"
                                      />
                                      <span>
                                        <span className="font-bold">
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
                            ),
                          )}
                        </div>

                        <button className="mt-5 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white">
                          Guardar permisos
                        </button>
                      </form>

                      <form
                        action={duplicateRoleAccess}
                        className="mt-4 flex flex-col gap-2 rounded-2xl border border-dashed border-neutral-300 p-4 sm:flex-row"
                      >
                        <input type="hidden" name="roleId" value={role.id} />
                        <input
                          name="newName"
                          required
                          placeholder={`Copia de ${role.name}`}
                          className="flex-1 rounded-xl border border-[var(--bb-line)] px-4 py-3 text-sm"
                        />
                        <button className="rounded-xl bg-[var(--bb-soft)] px-4 py-3 text-sm font-bold">
                          Duplicar rol
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions
                        .filter((permission) => assigned.has(permission.key))
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="rounded-xl bg-[var(--bb-soft)] p-3"
                          >
                            <p className="text-sm font-bold">
                              {permission.name ?? permission.key}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                              {moduleLabels[permission.module_key] ??
                                permission.module_key}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </AppShell>
  );
}
