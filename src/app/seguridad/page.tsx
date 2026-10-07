import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MfaAuthenticatorSetup } from "@/components/mfa-authenticator-setup";
import { getActiveContext } from "@/lib/blackbird/context";

export default async function SeguridadPage() {
  const ctx = await getActiveContext();
  const { data: aal } =
    await ctx.supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const email = ctx.user.email ?? "";

  return (
    <AppShell
      activePath="/seguridad"
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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
          Cuenta
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
          Seguridad
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Administra tu contraseña y la autenticación de dos factores de tu cuenta personal.
        </p>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-[var(--bb-line)] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
            Contraseña
          </p>
          <h2 className="mt-3 text-xl font-black tracking-[-0.03em]">
            Cambiar contraseña por correo
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Enviaremos un enlace seguro a <strong>{email}</strong> para que definas una nueva contraseña.
          </p>
          <Link
            href={`/recuperar-contrasena?email=${encodeURIComponent(email)}`}
            className="mt-5 inline-flex rounded-2xl bg-[var(--bb-soft)] px-5 py-3.5 text-sm font-bold text-neutral-800"
          >
            Enviar enlace de cambio
          </Link>
        </section>

        <section className="rounded-3xl border border-[var(--bb-line)] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
                2FA · TOTP
              </p>
              <h2 className="mt-3 text-xl font-black tracking-[-0.03em]">
                App Authenticator
              </h2>
            </div>
            <span
              className={
                aal?.nextLevel === "aal2"
                  ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  : "rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-500"
              }
            >
              {aal?.nextLevel === "aal2" ? "Disponible" : "No configurado"}
            </span>
          </div>

          <div className="mt-5">
            <MfaAuthenticatorSetup />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-3xl bg-neutral-950 p-6 text-white">
        <p className="text-sm font-black">¿Qué aplicaciones funcionan?</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
          El código QR usa el estándar TOTP. Puedes elegir Google Authenticator,
          Microsoft Authenticator, Authy, 1Password, Bitwarden u otra aplicación
          compatible. Blackbird no obliga a usar una marca específica.
        </p>
      </section>
    </AppShell>
  );
}
