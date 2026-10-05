import Link from "next/link";
import { register } from "@/modules/auth/actions";
import { BlackbirdBrand } from "@/components/blackbird-mark";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <BlackbirdBrand />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="relative overflow-hidden rounded-[2rem] bg-[var(--bb-ink)] p-8 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[28px] border-[var(--bb-accent)]" />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-white/50">7 días gratis</p>
            <h1 className="relative mt-4 max-w-md text-4xl font-black leading-tight tracking-[-0.04em]">
              Da el salto de Excel a una empresa centralizada.
            </h1>
            <p className="relative mt-5 max-w-lg text-sm leading-7 text-white/60">
              No necesitas tarjeta para comenzar. Crea tu acceso y Blackbird te guiará paso a paso para configurar tu negocio.
            </p>
            <div className="relative mt-10 grid gap-3 text-sm">
              {["Configura tu empresa", "Carga clientes y productos", "Explora la experiencia Pro durante tu demo"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bb-accent)] text-xs font-black">{index + 1}</span>
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <section className="bb-card p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bb-accent)]">Crear cuenta</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Empieza con tu empresa.</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">Primero creamos tu acceso. Después configuramos tu operación.</p>

            {params.error ? (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
            ) : null}

            <form action={register} className="mt-8 space-y-5">
              <label className="block text-sm font-semibold">
                Nombre completo
                <input name="fullName" autoComplete="name" required className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold">
                Correo
                <input name="email" type="email" autoComplete="email" required className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold">
                Contraseña
                <input name="password" type="password" autoComplete="new-password" minLength={8} required className="bb-input mt-2" />
              </label>
              <button className="w-full rounded-2xl bg-[var(--bb-ink)] px-4 py-3.5 text-sm font-bold text-white">
                Crear cuenta
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-neutral-500">
              Ya tengo cuenta.{" "}
              <Link href="/login" className="font-bold text-[var(--bb-accent-strong)]">Iniciar sesión</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
