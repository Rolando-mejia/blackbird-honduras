import Link from "next/link";
import { login } from "@/modules/auth/actions";
import { BlackbirdBrand, BlackbirdMark } from "@/components/blackbird-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-[var(--bb-canvas)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[var(--bb-ink)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[34px] border-[var(--bb-accent)] opacity-90" />
        <BlackbirdBrand className="relative z-10 text-white" />

        <div className="relative z-10 max-w-xl">
          <BlackbirdMark className="mb-8 h-28 w-40 text-white" />
          <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.045em]">
            Todo tu negocio,
            <span className="block text-[var(--bb-accent)]">en un solo lugar.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">
            Centraliza tu operación y trabaja desde donde estés, con una experiencia diseñada para crecer contigo.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/40">Blackbird · Honduras</p>
      </section>

      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <BlackbirdBrand />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bb-accent)]">Bienvenido</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">Iniciar sesión</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500">Accede a tu empresa desde cualquier dispositivo.</p>

          {params.error ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
          ) : null}
          {params.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.message}</div>
          ) : null}

          <form action={login} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Correo
              <input name="email" type="email" autoComplete="email" required className="bb-input mt-2" />
            </label>
            <label className="block text-sm font-semibold">
              Contraseña
              <input name="password" type="password" autoComplete="current-password" minLength={8} required className="bb-input mt-2" />
            </label>
            <button className="w-full rounded-2xl bg-[var(--bb-ink)] px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-90">
              Entrar a Blackbird
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-bold text-[var(--bb-accent-strong)]">Crear empresa</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
