import Link from "next/link";
import { login } from "@/modules/auth/actions";
import { BlackbirdBrand, BlackbirdMark } from "@/components/blackbird-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; invite?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--bb-line)] bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border-[42px] border-[var(--bb-accent)] opacity-90" />
          <BlackbirdBrand className="relative z-10 text-white" />
          <div className="relative z-10 max-w-md">
            <BlackbirdMark className="mb-8 h-24 w-32 text-white" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Blackbird Honduras</p>
            <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.05em]">
              Tu negocio,
              <br />
              en un solo lugar.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-neutral-400">
              Centraliza tu operación y trabaja desde donde estés, sin depender de archivos dispersos.
            </p>
          </div>
          <p className="relative z-10 text-xs text-neutral-600">DEV · Honduras</p>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><BlackbirdBrand /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bb-accent)]">Bienvenido</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em]">Iniciar sesión</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">Accede a tu empresa desde un solo lugar.</p>

            {params.error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{params.error}</div> : null}
            {params.message ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{params.message}</div> : null}

            <form action={login} className="mt-8 space-y-5">
              <label className="block text-sm font-semibold">
                Correo
                <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5" />
              </label>
              <label className="block text-sm font-semibold">
                Contraseña
                <input name="password" type="password" autoComplete="current-password" minLength={8} required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5" />
              </label>
              <button className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-neutral-800">Entrar a Blackbird</button>
            </form>

            <div className="mt-7 rounded-2xl bg-[var(--bb-soft)] p-4 text-center text-sm text-neutral-600">
              ¿Aún no tienes cuenta? <Link href="/registro" className="font-bold text-neutral-950">Crear empresa</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
