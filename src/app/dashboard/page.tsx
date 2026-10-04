import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/modules/auth/actions";

const moduleCards = [
  ["Ventas", "Configuración inicial", true],
  ["Inventario", "Próximamente", false],
  ["Contabilidad", "Próximamente", false],
  ["Recursos Humanos", "Próximamente", false],
] as const;

const demo = {
  tradeName: "Blackbird Demo S. de R.L.",
  legalName: "Blackbird Demo S. de R.L.",
  organizationStatus: "trial",
  users: 1,
  branches: 1,
  hasRtn: false,
  hasCai: false,
  hasEmployer: false,
  fullName: "Usuario demo",
  isDemo: true,
};

async function getDashboardData() {
  if (!isSupabaseConfigured()) return demo;

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Blackbird membership error", membershipError);
    throw new Error("No pudimos cargar la empresa.");
  }
  if (!membership) redirect("/onboarding");

  const orgId = membership.organization_id as string;
  const [orgResult, branchesResult, membersResult, caiResult, employerResult] = await Promise.all([
    supabase.from("organizations").select("trade_name,legal_name,rtn,status").eq("id", orgId).single(),
    supabase.from("branches").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    supabase.from("hn_cai_authorizations").select("id").eq("organization_id", orgId).eq("is_active", true).limit(1),
    supabase.from("hn_employer_profiles").select("id").eq("organization_id", orgId).limit(1),
  ]);

  if (orgResult.error) {
    console.error("Blackbird organization error", orgResult.error);
    throw new Error("No pudimos cargar la organización.");
  }

  const org = orgResult.data;
  return {
    tradeName: org.trade_name,
    legalName: org.legal_name,
    organizationStatus: org.status,
    users: membersResult.count ?? 0,
    branches: branchesResult.count ?? 0,
    hasRtn: Boolean(org.rtn),
    hasCai: (caiResult.data?.length ?? 0) > 0,
    hasEmployer: (employerResult.data?.length ?? 0) > 0,
    fullName:
      typeof authData.user.user_metadata?.full_name === "string"
        ? authData.user.user_metadata.full_name
        : authData.user.email ?? "Usuario Blackbird",
    isDemo: false,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const pending = [data.hasRtn, data.hasCai, data.hasEmployer].filter((value) => !value).length;

  const cards = [
    ["Empresa", data.tradeName, data.legalName],
    ["Usuarios", String(data.users), data.users === 1 ? "1 miembro" : `${data.users} miembros`],
    ["Sucursales", String(data.branches), data.branches === 1 ? "Principal" : "Configuradas"],
    ["Estado", data.organizationStatus === "trial" ? "Prueba" : "Activa", data.isDemo ? "Entorno demo" : "Blackbird DEV"],
  ];

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-neutral-950 p-6 text-white md:block">
          <div className="text-lg font-semibold">Blackbird <span className="text-neutral-500">HN</span></div>
          <nav className="mt-10 space-y-2 text-sm">
            {["Inicio", "Empresa", "Sucursales", "Usuarios", "Módulos", "Configuración"].map((item, index) => (
              <div key={item} className={`rounded-xl px-3 py-2.5 ${index === 0 ? "bg-white text-black" : "text-neutral-400"}`}>{item}</div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-5 md:p-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Blackbird Alpha 0.4-dev</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hola, {data.fullName.split(" ")[0]}</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">HN · HNL</div>
                {!data.isDemo ? <form action={logout}><button className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm">Salir</button></form> : null}
              </div>
            </div>

            {data.isDemo ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Modo demo: conecta Supabase para usar datos reales.</div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Conectado a Blackbird DEV · datos reales en Supabase.</div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(([label, value, meta]) => (
                <div key={label} className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
                  <p className="mt-4 text-xl font-semibold">{value}</p>
                  <p className="mt-1 truncate text-sm text-neutral-500">{meta}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold">Módulos de la empresa</h2>
                <div className="mt-5 space-y-3">
                  {moduleCards.map(([name, status, active]) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-neutral-100 p-4">
                      <div><p className="font-medium">{name}</p><p className="text-sm text-neutral-500">{status}</p></div>
                      <span className={`rounded-full px-3 py-1 text-xs ${active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{active ? "Activo" : "Bloqueado"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm">
                <p className="text-sm text-neutral-400">Configuración Honduras</p>
                <h2 className="mt-2 text-2xl font-semibold">{pending === 0 ? "Configuración base completa" : `${pending} pasos pendientes`}</h2>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between border-b border-neutral-800 pb-3"><span>Perfil empresarial</span><span className="text-emerald-400">Completo</span></div>
                  <div className="flex justify-between border-b border-neutral-800 pb-3"><span>RTN / fiscal</span><span className={data.hasRtn ? "text-emerald-400" : "text-amber-300"}>{data.hasRtn ? "Completo" : "Pendiente"}</span></div>
                  <div className="flex justify-between border-b border-neutral-800 pb-3"><span>CAI</span><span className={data.hasCai ? "text-emerald-400" : "text-neutral-500"}>{data.hasCai ? "Configurado" : "Pendiente"}</span></div>
                  <div className="flex justify-between"><span>Patrono</span><span className={data.hasEmployer ? "text-emerald-400" : "text-neutral-500"}>{data.hasEmployer ? "Configurado" : "Pendiente"}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
