import Link from "next/link";
import { register } from "@/modules/auth/actions";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import { RegisterSubmitButton } from "@/components/register-submit-button";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; invite?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-neutral-950 p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[var(--bb-accent)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border-[46px] border-white/20" />
          <BlackbirdBrand className="relative z-10 text-white" />
          <div className="relative z-10 max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">7 días para conocer Blackbird</p>
            <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.05em]">Empieza a ordenar tu empresa.</h1>
            <p className="mt-5 text-base leading-7 text-white/80">Primero creamos tu acceso. Después Blackbird te guía para configurar la empresa.</p>
          </div>
          <p className="relative z-10 text-xs text-white/60">Sin tarjeta para comenzar</p>
        </aside>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-lg">
            <div className="mb-8 lg:hidden"><BlackbirdBrand /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bb-accent)]">Crear cuenta</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em]">Empieza con tu empresa.</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">Tu configuración y datos quedarán listos para seguir trabajando después de la prueba.</p>

            {params.error ? (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                {params.error}
              </div>
            ) : null}

            {params.message ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <p className="font-bold">Cuenta registrada</p>
                <p className="mt-1 leading-6">{params.message}</p>
              </div>
            ) : null}

            {!params.message ? (
              <form action={register} className="mt-7 space-y-4">
                <label className="block text-sm font-semibold">
                  Nombre completo
                  <input name="fullName" autoComplete="name" required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
                </label>
                <label className="block text-sm font-semibold">
                  Correo
                  <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
                </label>
                <label className="block text-sm font-semibold">
                  Contraseña
                  <input name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
                </label>
                <RegisterSubmitButton />
              </form>
            ) : (
              <div className="mt-7">
                <Link
                  href="/login"
                  className="block w-full rounded-2xl bg-neutral-950 px-4 py-4 text-center text-sm font-bold text-white hover:bg-neutral-800"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-neutral-500">
              Ya tengo cuenta. <Link href="/login" className="font-bold text-neutral-950">Iniciar sesión</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
