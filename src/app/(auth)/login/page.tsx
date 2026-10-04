import Link from "next/link";
import { login } from "@/modules/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-5">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-sm md:p-9">
        <Link href="/" className="text-sm font-semibold text-neutral-500">Blackbird Honduras</Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Accede a tu empresa desde un solo lugar.</p>

        {params.error ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
        ) : null}
        {params.message ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.message}</div>
        ) : null}

        <form action={login} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            Correo
            <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500" />
          </label>
          <label className="block text-sm font-medium">
            Contraseña
            <input name="password" type="password" autoComplete="current-password" minLength={8} required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-500" />
          </label>
          <button className="w-full rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white">Entrar a Blackbird</button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-neutral-950">Crear empresa</Link>
        </p>
      </section>
    </main>
  );
}
