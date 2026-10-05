import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function UsuariosPage() {
  const ctx = await getActiveContext();

  const { data: members } = await ctx.supabase
    .from("organization_members")
    .select("id,user_id,role_id,status,joined_at")
    .eq("organization_id", ctx.organization.id)
    .order("created_at");

  const userIds = (members ?? []).map((member) => member.user_id);
  const roleIds = (members ?? []).map((member) => member.role_id).filter(Boolean) as string[];

  const [usersResult, rolesResult] = await Promise.all([
    userIds.length
      ? ctx.supabase.from("app_users").select("id,email,full_name,phone").in("id", userIds)
      : Promise.resolve({ data: [] }),
    roleIds.length
      ? ctx.supabase.from("roles").select("id,name").in("id", roleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const users = new Map((usersResult.data ?? []).map((user) => [user.id, user]));
  const roles = new Map((rolesResult.data ?? []).map((role) => [role.id, role]));

  return (
    <AppShell
      activePath="/usuarios"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Accesos</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Usuarios</h1>
          <p className="mt-2 text-sm text-neutral-500">Personas con acceso a esta empresa.</p>
        </div>
        <div className="rounded-full bg-[var(--bb-ink)] px-4 py-2 text-xs font-bold text-white">
          {(members ?? []).length}/5 usuarios Starter
        </div>
      </div>

      <section className="bb-card mt-8 overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_1.4fr_0.8fr_0.6fr] gap-4 border-b border-[var(--bb-line)] px-5 py-3 text-[11px] font-black uppercase tracking-wide text-neutral-400 sm:grid">
          <span>Usuario</span><span>Correo</span><span>Rol</span><span>Estado</span>
        </div>
        <div className="divide-y divide-[var(--bb-line)]">
          {(members ?? []).map((member) => {
            const user = users.get(member.user_id);
            const role = member.role_id ? roles.get(member.role_id) : null;
            return (
              <div key={member.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1.4fr_0.8fr_0.6fr] sm:items-center">
                <div>
                  <p className="text-sm font-bold">{user?.full_name ?? "Usuario"}</p>
                  <p className="mt-1 text-xs text-neutral-400 sm:hidden">{user?.email}</p>
                </div>
                <p className="hidden truncate text-sm text-neutral-500 sm:block">{user?.email}</p>
                <p className="text-sm font-semibold">{role?.name ?? "Sin rol"}</p>
                <span className={member.status === "active" ? "w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700" : "w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-400"}>
                  {member.status === "active" ? "Activo" : member.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-5 text-sm text-neutral-400">Las invitaciones y asignación de sucursales se habilitarán en el siguiente incremento del Core.</p>
    </AppShell>
  );
}
