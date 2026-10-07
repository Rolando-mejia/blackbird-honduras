import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";
import { can, getRolePermissionKeys } from "@/lib/blackbird/permissions";
import {
  createUserInvitation,
  manageUserInvitation,
  updateOrganizationMember,
} from "@/modules/users/actions";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; invite?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getActiveContext();
  const permissionKeys = await getRolePermissionKeys(ctx.supabase, ctx.role);
  const canInvite = can(permissionKeys, "core.users.invite");
  const canManage = can(permissionKeys, "core.users.manage");

  const [membersResult, rolesResult, branchesResult, subscriptionResult] =
    await Promise.all([
      ctx.supabase
        .from("organization_members")
        .select("id,user_id,role_id,status,joined_at,job_title,all_branches")
        .eq("organization_id", ctx.organization.id)
        .order("created_at"),
      ctx.supabase
        .from("roles")
        .select("id,name,description,is_owner_role,is_active")
        .eq("organization_id", ctx.organization.id)
        .order("is_owner_role", { ascending: false })
        .order("name"),
      ctx.supabase
        .from("branches")
        .select("id,name,is_main,is_virtual,is_active")
        .eq("organization_id", ctx.organization.id)
        .eq("is_active", true)
        .order("is_main", { ascending: false })
        .order("name"),
      ctx.supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("organization_id", ctx.organization.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const members = membersResult.data ?? [];
  const roles = rolesResult.data ?? [];
  const branches = branchesResult.data ?? [];
  const userIds = members.map((member) => member.user_id);

  const [usersResult, accessResult, invitationsResult] = await Promise.all([
    userIds.length
      ? ctx.supabase
          .from("app_users")
          .select("id,email,full_name,phone")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
    members.length
      ? ctx.supabase
          .from("organization_member_branches")
          .select("organization_member_id,branch_id")
          .in("organization_member_id", members.map((member) => member.id))
      : Promise.resolve({ data: [] }),
    canInvite
      ? ctx.supabase
          .from("organization_invitations")
          .select("id,email,full_name,phone,job_title,role_id,all_branches,status,token,expires_at,created_at")
          .eq("organization_id", ctx.organization.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  let userLimit = 5;
  if (subscriptionResult.data?.plan_id) {
    const { data: plan } = await ctx.supabase
      .from("plans")
      .select("limits")
      .eq("id", subscriptionResult.data.plan_id)
      .maybeSingle();

    const rawLimit =
      plan?.limits &&
      typeof plan.limits === "object" &&
      "users" in plan.limits
        ? Number(plan.limits.users)
        : 5;

    if (Number.isFinite(rawLimit) && rawLimit > 0) userLimit = rawLimit;
  }

  const users = new Map(
    (usersResult.data ?? []).map((user) => [user.id, user]),
  );
  const roleMap = new Map(roles.map((role) => [role.id, role]));
  const memberBranches = new Map<string, Set<string>>();

  for (const row of accessResult.data ?? []) {
    const current =
      memberBranches.get(row.organization_member_id) ?? new Set<string>();
    current.add(row.branch_id);
    memberBranches.set(row.organization_member_id, current);
  }

  const invitations = invitationsResult.data ?? [];
  const usedSeats = members.length + invitations.length;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://blackbird-honduras.vercel.app";

  return (
    <AppShell
      activePath="/usuarios"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
      organizationId={ctx.organization.id}
      branchId={ctx.branch?.id}
      organizationOptions={ctx.organizationOptions}
      branchOptions={ctx.branchOptions}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Accesos
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
            Usuarios
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Personas, roles y sucursales autorizadas en esta empresa.
          </p>
        </div>
        <div className="rounded-full bg-[var(--bb-ink)] px-4 py-2 text-xs font-bold text-white">
          {usedSeats}/{userLimit} cupos utilizados
        </div>
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

      {params.invite ? (
        <section className="mt-6 rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm">
          <p className="text-sm font-black">Enlace seguro de invitación</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Mientras conectamos el correo transaccional de Blackbird, puedes
            compartir este enlace directamente con la persona invitada.
          </p>
          <input
            readOnly
            value={`${appUrl}/login?invite=${params.invite}`}
            className="mt-4 w-full rounded-2xl border border-[var(--bb-line)] bg-[var(--bb-soft)] px-4 py-3 text-xs"
          />
        </section>
      ) : null}

      {canInvite ? (
        <details className="mt-6 rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm" open={members.length === 1 && invitations.length === 0}>
          <summary className="cursor-pointer list-none font-black">
            + Invitar usuario
          </summary>
          <form action={createUserInvitation} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Nombre completo
              <input
                name="fullName"
                required
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
            <label className="text-sm font-semibold">
              Correo
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
            <label className="text-sm font-semibold">
              Teléfono
              <input
                name="phone"
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
            <label className="text-sm font-semibold">
              Cargo / puesto
              <input
                name="jobTitle"
                placeholder="Ej. Vendedor, Cajero, Contador"
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Rol
              <select
                name="roleId"
                required
                defaultValue=""
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3"
              >
                <option value="" disabled>Seleccionar rol</option>
                {roles
                  .filter((role) => role.is_active && !role.is_owner_role)
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </select>
            </label>

            <div className="rounded-2xl bg-[var(--bb-soft)] p-4 md:col-span-2">
              <label className="flex items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  name="allBranches"
                  value="true"
                  defaultChecked
                  className="h-4 w-4"
                />
                Acceso a todas las sucursales autorizadas por el plan
              </label>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="branchIds"
                      value={branch.id}
                      defaultChecked={branch.is_main}
                    />
                    {branch.name}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Si desmarcas “todas”, Blackbird usará únicamente las sucursales seleccionadas.
              </p>
            </div>

            <button
              disabled={usedSeats >= userLimit}
              className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white disabled:bg-neutral-300 md:col-span-2 md:w-fit"
            >
              {usedSeats >= userLimit
                ? "Límite de usuarios alcanzado"
                : "Crear invitación"}
            </button>
          </form>
        </details>
      ) : null}

      {canInvite && invitations.length ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Invitaciones pendientes</h2>
            <span className="text-xs text-neutral-400">
              {invitations.length} pendiente{invitations.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {invitations.map((invitation) => {
              const role = roleMap.get(invitation.role_id);
              return (
                <article
                  key={invitation.id}
                  className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black">{invitation.full_name}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {invitation.email}
                      </p>
                      <p className="mt-2 text-xs text-neutral-400">
                        {role?.name ?? "Rol"} · {invitation.job_title || "Sin cargo"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">
                      Invitado
                    </span>
                  </div>

                  <input
                    readOnly
                    value={`${appUrl}/login?invite=${invitation.token}`}
                    className="mt-4 w-full rounded-xl bg-[var(--bb-soft)] px-3 py-2 text-[11px]"
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={manageUserInvitation}>
                      <input type="hidden" name="invitationId" value={invitation.id} />
                      <button
                        name="action"
                        value="regenerate"
                        className="rounded-xl bg-[var(--bb-soft)] px-3 py-2 text-xs font-bold"
                      >
                        Nuevo enlace
                      </button>
                    </form>
                    <form action={manageUserInvitation}>
                      <input type="hidden" name="invitationId" value={invitation.id} />
                      <button
                        name="action"
                        value="revoke"
                        className="rounded-xl px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Revocar
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Equipo actual</h2>
          <span className="text-xs text-neutral-400">{members.length} usuarios</span>
        </div>

        {members.map((member) => {
          const user = users.get(member.user_id);
          const role = member.role_id ? roleMap.get(member.role_id) : null;
          const assignedBranches =
            memberBranches.get(member.id) ?? new Set<string>();
          const protectedOwner = Boolean(role?.is_owner_role);

          return (
            <details
              key={member.id}
              className="rounded-3xl border border-[var(--bb-line)] bg-white p-5 shadow-sm"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black">{user?.full_name ?? "Usuario"}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {user?.email ?? "Sin correo"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">
                      {role?.name ?? "Sin rol"}
                      {member.job_title ? ` · ${member.job_title}` : ""}
                      {" · "}
                      {member.all_branches
                        ? "Todas las sucursales"
                        : `${assignedBranches.size} sucursal(es)`}
                    </p>
                  </div>
                  <span
                    className={
                      member.status === "active"
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700"
                        : "rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase text-neutral-500"
                    }
                  >
                    {member.status === "active" ? "Activo" : "Suspendido"}
                  </span>
                </div>
              </summary>

              {canManage && !protectedOwner ? (
                <form
                  action={updateOrganizationMember}
                  className="mt-5 grid gap-4 border-t border-[var(--bb-line)] pt-5 md:grid-cols-2"
                >
                  <input type="hidden" name="memberId" value={member.id} />
                  <label className="text-sm font-semibold">
                    Cargo
                    <input
                      name="jobTitle"
                      defaultValue={member.job_title ?? ""}
                      className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Estado
                    <select
                      name="status"
                      defaultValue={member.status === "suspended" ? "suspended" : "active"}
                      className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3"
                    >
                      <option value="active">Activo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Rol
                    <select
                      name="roleId"
                      defaultValue={member.role_id ?? ""}
                      className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3"
                    >
                      {roles
                        .filter((candidate) => candidate.is_active)
                        .map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <div className="rounded-2xl bg-[var(--bb-soft)] p-4 md:col-span-2">
                    <label className="flex items-center gap-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        name="allBranches"
                        value="true"
                        defaultChecked={member.all_branches}
                      />
                      Acceso a todas las sucursales
                    </label>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {branches.map((branch) => (
                        <label
                          key={branch.id}
                          className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="branchIds"
                            value={branch.id}
                            defaultChecked={assignedBranches.has(branch.id)}
                          />
                          {branch.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold text-white md:col-span-2 md:w-fit">
                    Guardar acceso
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl bg-[var(--bb-soft)] p-4 text-xs leading-5 text-neutral-500">
                  {protectedOwner
                    ? "El rol Propietario está protegido para evitar cambios accidentales."
                    : "Tu rol puede consultar este usuario, pero no modificar su acceso."}
                </div>
              )}
            </details>
          );
        })}
      </section>
    </AppShell>
  );
}
