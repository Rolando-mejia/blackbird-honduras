import Link from "next/link";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import { AuthThemeSwitcher } from "@/components/theme-switcher";
import { requestPasswordReset } from "@/modules/auth/actions";

export default async function RecuperarContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-4 sm:p-6">
      <AuthThemeSwitcher />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-xl items-center">
        <section className="w-full rounded-[2rem] border border-[var(--bb-line)] bg-white p-6 shadow-sm sm:p-9">
          <BlackbirdBrand />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Seguridad de cuenta
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Recupera tu contraseña
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Escribe el correo de tu cuenta. Si existe en Blackbird, enviaremos un enlace seguro para definir una nueva contraseña.
          </p>

          {params.error ? (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {params.error}
            </div>
          ) : null}

          {params.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              <p className="font-bold">Revisa tu correo</p>
              <p className="mt-1 leading-6">{params.message}</p>
            </div>
          ) : null}

          {!params.message ? (
            <form action={requestPasswordReset} className="mt-7">
              <label className="block text-sm font-semibold">
                Correo
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={params.email ?? ""}
                  className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5"
                />
              </label>
              <button className="mt-5 w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-black text-white">
                Enviar enlace de recuperación
              </button>
            </form>
          ) : null}

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-bold text-neutral-600"
          >
            Volver a iniciar sesión
          </Link>
        </section>
      </div>
    </main>
  );
}
