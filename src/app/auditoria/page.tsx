import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function AuditoriaPage() {
  const ctx = await getActiveContext();

  const { data: logs } = await ctx.supabase
    .from("audit_logs")
    .select("id,user_id,action,entity_type,entity_id,metadata,occurred_at")
    .eq("organization_id", ctx.organization.id)
    .order("occurred_at", { ascending: false })
    .limit(50);

  const userIds = Array.from(new Set((logs ?? []).map((log) => log.user_id).filter(Boolean))) as string[];
  const usersResult = userIds.length
    ? await ctx.supabase.from("app_users").select("id,full_name,email").in("id", userIds)
    : { data: [] };

  const users = new Map((usersResult.data ?? []).map((user) => [user.id, user]));

  return (
    <AppShell
      activePath="/auditoria"
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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Trazabilidad</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Auditoría</h1>
        <p className="mt-2 text-sm text-neutral-500">La bitácora es inmutable: se consulta y exporta, nunca se edita ni elimina.</p>
      </div>

      <section className="bb-card mt-8 overflow-hidden">
        <div className="border-b border-[var(--bb-line)] px-5 py-4">
          <p className="text-sm font-black">Últimos eventos</p>
          <p className="mt-1 text-xs text-neutral-400">Mostrando hasta 50 registros.</p>
        </div>

        <div className="divide-y divide-[var(--bb-line)]">
          {(logs ?? []).length ? (logs ?? []).map((log) => {
            const user = log.user_id ? users.get(log.user_id) : null;
            return (
              <div key={log.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_0.8fr] md:items-center">
                <div>
                  <p className="text-sm font-bold">{log.action}</p>
                  <p className="mt-1 text-xs text-neutral-400">{log.entity_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.full_name ?? "Sistema"}</p>
                  <p className="mt-1 text-xs text-neutral-400">{user?.email ?? "Evento automático"}</p>
                </div>
                <time className="text-xs text-neutral-500 md:text-right">
                  {new Date(log.occurred_at).toLocaleString("es-HN")}
                </time>
              </div>
            );
          }) : (
            <div className="px-5 py-10 text-center text-sm text-neutral-400">Todavía no hay eventos para mostrar.</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
