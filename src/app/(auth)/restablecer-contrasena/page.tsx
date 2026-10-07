import { redirect } from "next/navigation";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "@/modules/auth/actions";

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(
      "/recuperar-contrasena?error=" +
        encodeURIComponent(
          "El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.",
        ),
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-xl items-center">
        <section className="w-full rounded-[2rem] border border-[var(--bb-line)] bg-white p-6 shadow-sm sm:p-9">
          <BlackbirdBrand />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Nueva contraseña
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Define una nueva contraseña
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Tu nueva contraseña tendrá efecto inmediatamente. Después volverás a iniciar sesión.
          </p>

          {params.error ? (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {params.error}
            </div>
          ) : null}

          <form action={updatePassword} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold">
              Nueva contraseña
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5"
              />
            </label>
            <label className="block text-sm font-semibold">
              Confirmar contraseña
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5"
              />
            </label>
            <button className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-black text-white">
              Cambiar contraseña
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
