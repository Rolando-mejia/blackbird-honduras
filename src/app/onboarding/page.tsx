import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createOrganization } from "@/modules/organizations/actions";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import { BusinessLocationFields } from "@/components/business-location-fields";

const departments = [
  "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso",
  "Francisco Morazán", "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz",
  "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro",
] as const;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden rounded-[2rem] bg-neutral-950 p-7 text-white sm:p-9">
          <div className="absolute -right-28 -top-28 h-64 w-64 rounded-full border-[34px] border-[var(--bb-accent)]" />
          <BlackbirdBrand className="relative z-10 text-white" />
          <div className="relative z-10 mt-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Configuración inicial</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">Configuremos tu primera empresa.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
              Empieza por lo esencial. Blackbird se adapta tanto a negocios con local físico como a operaciones completamente en línea.
            </p>
          </div>
          <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["01", "Empresa", "Identidad y datos base"],
              ["02", "Ubicación", "Local físico o negocio en línea"],
              ["03", "Honduras", "Fiscal y patronal después"],
            ].map(([number,title,meta]) => (
              <div key={number} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-xs font-bold text-[var(--bb-accent)]">{number}</span>
                <p className="mt-1 font-bold">{title}</p>
                <p className="mt-1 text-xs text-neutral-500">{meta}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-[var(--bb-line)] bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Paso 1 de 3</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Datos de la organización</h2>
            </div>
            <span className="rounded-full bg-[var(--bb-accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--bb-accent-strong)]">Blackbird DEV</span>
          </div>

          {params.error ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{params.error}</div> : null}

          <form action={createOrganization} className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold md:col-span-2">
              Nombre comercial
              <input name="tradeName" required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
            </label>

            <label className="block text-sm font-semibold md:col-span-2">
              Razón social / nombre legal
              <input name="legalName" required className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
            </label>

            <label className="block text-sm font-semibold">
              RTN <span className="font-normal text-neutral-400">(opcional)</span>
              <input name="rtn" maxLength={20} className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5" />
            </label>

            <label className="block text-sm font-semibold">
              Tipo de organización
              <select name="type" defaultValue="company" className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5">
                <option value="company">Sociedad</option>
                <option value="sole_trader">Comerciante individual</option>
                <option value="independent_professional">Profesional independiente</option>
                <option value="ngo">ONG / asociación</option>
                <option value="other">Otro</option>
              </select>
            </label>

            <BusinessLocationFields departments={departments} />

            <button className="rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white hover:bg-neutral-800 md:col-span-2">
              Crear empresa y abrir Blackbird
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
