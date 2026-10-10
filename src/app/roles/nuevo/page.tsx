import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CollapsibleFormSection } from "@/components/collapsible-form-section";
import { getActiveContext } from "@/lib/blackbird/context";
import { createRoleFromUsersModule } from "@/modules/users/actions";

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

type PermissionRow = {
  id: string;
  key: string;
  module_key: string;
  name: string | null;
  description: string | null;
  sort_order: number;
};

export default async function NuevoRolPage() {
  const ctx = await getActiveContext();

  if (!ctx.role?.is_owner_role) {
    redirect("/roles?error=Solo%20el%20Propietario%20puede%20crear%20roles.");
  }

  const permissionResult = await ctx.supabase
    .from("permissions")
    .select("id,key,module_key,name,description,sort_order")
    .order("sort_order");

  const permissions = (permissionResult.data ?? []) as PermissionRow[];
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
            Crear rol
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Define las responsabilidades y permisos de este perfil.
          </p>
        </div>
        <Link href="/roles" className="rounded-xl bg-[var(--bb-soft)] px-4 py-2 text-sm font-bold">
          Volver
        </Link>
      </div>

      <form action={createRoleFromUsersModule} className="mt-7 space-y-5">
        <CollapsibleFormSection
          eyebrow="Datos"
          title="Información del rol"
          description="Nombre y propósito de este perfil."
          defaultOpen
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Nombre
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
                placeholder="Responsabilidad principal"
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
          </div>
        </CollapsibleFormSection>

        {moduleKeys.map((moduleKey) => (
          <CollapsibleFormSection
            key={moduleKey}
            eyebrow="Permisos"
            title={moduleLabels[moduleKey] ?? moduleKey}
            description="Abre esta sección para seleccionar los permisos de este módulo."
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
          </CollapsibleFormSection>
        ))}

        <button className="rounded-2xl bg-neutral-950 px-6 py-4 text-sm font-black text-white">
          Crear rol
        </button>
      </form>
    </AppShell>
  );
}
