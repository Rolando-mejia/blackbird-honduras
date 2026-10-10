import { redirect } from "next/navigation";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import { AuthThemeSwitcher } from "@/components/theme-switcher";
import { MfaChallenge } from "@/components/mfa-challenge";
import { createClient } from "@/lib/supabase/server";

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const nextPath = safeNext(params.next);

  if (aal?.currentLevel === "aal2") {
    redirect(nextPath);
  }

  if (aal?.nextLevel !== "aal2") {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-4 sm:p-6">
      <AuthThemeSwitcher />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-xl items-center">
        <section className="w-full rounded-[2rem] border border-[var(--bb-line)] bg-white p-6 shadow-sm sm:p-9">
          <BlackbirdBrand />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
            Verificación en dos pasos
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Confirma que eres tú
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Abre la aplicación Authenticator que configuraste para Blackbird e ingresa el código actual.
          </p>

          <div className="mt-7">
            <MfaChallenge nextPath={nextPath} />
          </div>
        </section>
      </div>
    </main>
  );
}
