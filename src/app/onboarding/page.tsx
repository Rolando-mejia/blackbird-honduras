import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createOrganization } from "@/modules/organizations/actions";
import { BlackbirdBrand } from "@/components/blackbird-mark";

const departments = [
  "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso",
  "Francisco Morazán", "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz",
  "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro",
];

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
    <main className="min-h-screen bg-[var(--bb-canvas)] p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <BlackbirdBrand />

        <div className="mt-10 grid gap-7 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="relative overflow-hidden rounded-[2rem] bg-[var(--bb-ink)] p-8 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[28px] border-[var(--bb-accent)]" />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-white/50">Configuración inicial</p>
            <h1 className="relative mt-4 text-4xl font-black tracking-[-0.04em]">Construyamos tu espacio de trabajo.</h1>
            <p className="relative mt-5 text-sm leading-7 text-white/60">
              Comenzamos con la empresa y la sucursal principal. Después Blackbird te sugerirá una configuración según tu rubro.
            </p>

            <div className="relative mt-10 space-y-3 text-sm">
              {[
                ["01", "Empresa", "Datos generales y fiscales básicos"],
                ["02", "Sucursal principal", "Tu primera ubicación operativa"],
                ["03", "Rubro y módulos", "Recomendaciones adaptadas"],
                ["04", "Honduras fiscal", "RTN, CAI e impuestos"],
              ].map(([number, title, detail], index) => (
                <div key={title} className={`rounded-2xl p-4 ${index === 0 ? "bg-white text-[var(--bb-ink)]" : "bg-white/5"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-black ${index === 0 ? "text-[var(--bb-accent)]" : "text-white/30"}`}>{number}</span>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className={`mt-1 text-xs ${index === 0 ? "text-neutral-500" : "text-white/40"}`}>{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="bb-card p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">Paso 1 de 4</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Datos de tu empresa</h2>
              </div>
              <span className="hidden rounded-full bg-[var(--bb-accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--bb-accent-strong)] sm:inline">
                Demo Pro · 7 días
              </span>
            </div>

            {params.error ? (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
            ) : null}

            <form action={createOrganization} className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold md:col-span-2">
                Nombre comercial
                <input name="tradeName" required className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold md:col-span-2">
                Razón social / nombre legal
                <input name="legalName" required className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold">
                RTN <span className="font-normal text-neutral-400">(opcional por ahora)</span>
                <input name="rtn" maxLength={20} className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold">
                Tipo de organización
                <select name="type" defaultValue="company" className="bb-input mt-2">
                  <option value="company">Sociedad</option>
                  <option value="sole_trader">Comerciante individual</option>
                  <option value="independent_professional">Profesional independiente</option>
                  <option value="ngo">ONG / asociación</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Departamento
                <select name="department" defaultValue="Francisco Morazán" className="bb-input mt-2">
                  {departments.map((department) => <option key={department}>{department}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Municipio
                <input name="municipality" required className="bb-input mt-2" />
              </label>
              <label className="block text-sm font-semibold md:col-span-2">
                Dirección de la sucursal principal
                <textarea name="address" rows={3} className="bb-input mt-2 resize-none" />
              </label>
              <button className="rounded-2xl bg-[var(--bb-ink)] px-5 py-3.5 text-sm font-bold text-white md:col-span-2">
                Crear empresa y continuar
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
