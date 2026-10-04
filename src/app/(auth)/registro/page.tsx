import Link from "next/link";
import { register } from "@/modules/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-5 text-neutral-950">
      <section className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-sm md:p-10">
        <Link href="/" className="text-sm font-semibold text-neutral-500">Blackbird Honduras</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Crear cuenta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Empieza con tu empresa.</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Primero creamos tu acceso. Después configuramos la empresa y Honduras.</p>

        {params.error ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
        ) : null}

        <form action={register} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            Nombre completo
            <input name="fullName" autoComplete="name" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500" />
          </label>
          <label className="block text-sm font-medium">
            Correo
            <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500" />
          </label>
          <label className="block text-sm font-medium">
            Contraseña
            <input name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500" />
          </label>
          <button className="w-full rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white">Crear cuenta</button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Ya tengo cuenta. <Link href="/login" className="font-semibold text-neutral-950">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}
