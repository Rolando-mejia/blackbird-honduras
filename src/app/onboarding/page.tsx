import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createOrganization } from "@/modules/organizations/actions";

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
    <main className="min-h-screen bg-neutral-100 p-5 md:p-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-[2rem] bg-neutral-950 p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Blackbird Setup</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Configuremos tu primera empresa.</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-400">Esta información crea el tenant, la sucursal principal y tu rol de propietario. La configuración fiscal y CAI vendrá en el siguiente paso.</p>
          <div className="mt-10 space-y-4 text-sm">
            <div className="rounded-2xl bg-white/5 p-4"><span className="text-neutral-500">01</span><p className="mt-1 font-medium">Empresa</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><span className="text-neutral-500">02</span><p className="mt-1 font-medium">Sucursal principal</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><span className="text-neutral-500">03</span><p className="mt-1 font-medium">Honduras fiscal</p></div>
          </div>
        </aside>

        <section className="rounded-[2rem] bg-white p-7 shadow-sm md:p-9">
          <p className="text-sm font-semibold">Datos de la organización</p>
          {params.error ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div> : null}

          <form action={createOrganization} className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium md:col-span-2">Nombre comercial<input name="tradeName" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium md:col-span-2">Razón social / nombre legal<input name="legalName" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium">RTN <span className="font-normal text-neutral-400">(opcional por ahora)</span><input name="rtn" maxLength={20} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium">Tipo de organización<select name="type" defaultValue="company" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3"><option value="company">Sociedad</option><option value="sole_trader">Comerciante individual</option><option value="independent_professional">Profesional independiente</option><option value="ngo">ONG / asociación</option><option value="other">Otro</option></select></label>
            <label className="block text-sm font-medium">Departamento<select name="department" defaultValue="Francisco Morazán" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3">{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
            <label className="block text-sm font-medium">Municipio<input name="municipality" required className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium md:col-span-2">Dirección de la sucursal principal<textarea name="address" rows={3} className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3" /></label>
            <button className="rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white md:col-span-2">Crear empresa y abrir Blackbird</button>
          </form>
        </section>
      </div>
    </main>
  );
}
