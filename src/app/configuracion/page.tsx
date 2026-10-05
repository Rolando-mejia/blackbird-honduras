import { AppShell } from "@/components/app-shell";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function ConfiguracionPage() {
  const ctx = await getActiveContext();

  const { data: subscription } = await ctx.supabase
    .from("subscriptions")
    .select("id,status,plan_id,current_period_start,current_period_end")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let planName = "Starter";

  if (subscription?.plan_id) {
    const { data: plan } = await ctx.supabase
      .from("plans")
      .select("name")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    planName = plan?.name ?? planName;
  }

  return (
    <AppShell
      activePath="/configuracion"
      fullName={ctx.fullName}
      organizationName={ctx.organization.trade_name}
      branchName={ctx.branch?.name}
      roleName={ctx.role?.name}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Preferencias</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">Configuración</h1>
        <p className="mt-2 text-sm text-neutral-500">Ajustes generales de empresa, seguridad y experiencia.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Plan y suscripción</p>
          <p className="mt-3 text-lg font-black">{planName}</p>
          <p className="mt-1 text-xs text-neutral-500">{subscription?.status ?? "trial"}</p>
        </section>

        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Moneda y país</p>
          <p className="mt-3 text-lg font-black">{ctx.organization.currency_code} · {ctx.organization.country_code}</p>
          <p className="mt-1 text-xs text-neutral-500">Configuración regional</p>
        </section>

        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Seguridad</p>
          <p className="mt-3 text-lg font-black">2FA y sesiones</p>
          <p className="mt-1 text-xs text-neutral-500">Próximo incremento</p>
        </section>

        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Branding</p>
          <p className="mt-3 text-lg font-black">Logo y documentos</p>
          <p className="mt-1 text-xs text-neutral-500">Próximo incremento</p>
        </section>

        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Notificaciones</p>
          <p className="mt-3 text-lg font-black">Correo · WhatsApp · Push</p>
          <p className="mt-1 text-xs text-neutral-500">Planificado</p>
        </section>

        <section className="bb-card p-5">
          <p className="text-xs font-semibold text-neutral-400">Offline</p>
          <p className="mt-3 text-lg font-black">PWA y sincronización</p>
          <p className="mt-1 text-xs text-neutral-500">Planificado</p>
        </section>
      </div>
    </AppShell>
  );
}
