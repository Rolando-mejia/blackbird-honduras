import Link from "next/link";
import { logout } from "@/modules/auth/actions";
import { BlackbirdBrand } from "@/components/blackbird-mark";
import {
  switchBranch,
  switchOrganization,
} from "@/modules/context/actions";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "⌂" },
  { href: "/empresa", label: "Empresa", icon: "◫" },
  { href: "/sucursales", label: "Sucursales", icon: "◇" },
  { href: "/usuarios", label: "Usuarios", icon: "◎" },
  { href: "/roles", label: "Roles", icon: "✓" },
  { href: "/modulos", label: "Módulos", icon: "▦" },
  { href: "/auditoria", label: "Auditoría", icon: "≡" },
  { href: "/configuracion", label: "Configuración", icon: "⚙" },
  { href: "/seguridad", label: "Seguridad", icon: "◉" },
] as const;

export function AppShell({
  children,
  activePath,
  fullName,
  organizationName,
  branchName,
  roleName,
  organizationId,
  branchId,
  organizationOptions = [],
  branchOptions = [],
}: {
  children: React.ReactNode;
  activePath: string;
  fullName: string;
  organizationName: string;
  branchName?: string | null;
  roleName?: string | null;
  organizationId?: string;
  branchId?: string | null;
  organizationOptions?: Array<{ id: string; name: string }>;
  branchOptions?: Array<{ id: string; name: string; isMain: boolean; isVirtual: boolean }>;
}) {
  const firstName = fullName.split(" ")[0];

  const nav = (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.href === activePath;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-[var(--bb-accent-soft)] text-[var(--bb-accent-strong)]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"}`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-xl text-xs ${active ? "bg-white text-[var(--bb-accent)]" : "bg-neutral-100 text-neutral-500"}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-[var(--bb-canvas)] text-[var(--bb-ink)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--bb-line)] bg-white p-5 lg:flex lg:flex-col">
          <div className="px-2 py-2"><BlackbirdBrand /></div>

          <div className="mt-6 rounded-2xl border border-[var(--bb-line)] bg-[var(--bb-soft)] p-3">
            {organizationOptions.length > 1 && organizationId ? (
              <form action={switchOrganization}>
                <input type="hidden" name="returnTo" value={activePath} />
                <select
                  name="organizationId"
                  defaultValue={organizationId}
                  onChange={undefined}
                  className="w-full rounded-xl border border-[var(--bb-line)] bg-white px-3 py-2 text-sm font-bold"
                >
                  {organizationOptions.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
                <button className="mt-2 w-full rounded-xl bg-neutral-950 px-3 py-2 text-xs font-bold text-white">
                  Cambiar empresa
                </button>
              </form>
            ) : (
              <p className="truncate text-sm font-bold">{organizationName}</p>
            )}

            {branchOptions.length > 1 && branchId ? (
              <form action={switchBranch} className="mt-3">
                <input type="hidden" name="returnTo" value={activePath} />
                <select
                  name="branchId"
                  defaultValue={branchId}
                  className="w-full rounded-xl border border-[var(--bb-line)] bg-white px-3 py-2 text-xs font-semibold"
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <button className="mt-2 w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-neutral-700">
                  Cambiar sucursal
                </button>
              </form>
            ) : (
              <p className="mt-1 truncate text-xs text-neutral-500">
                {branchName ?? "Sucursal principal"} · {roleName ?? "Usuario"}
              </p>
            )}
          </div>

          <div className="mt-6 flex-1">{nav}</div>

          <div className="border-t border-[var(--bb-line)] pt-4">
            <p className="px-3 text-xs text-neutral-400">Sesión de {firstName}</p>
            <form action={logout} className="mt-2">
              <button className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-600 hover:bg-neutral-100">
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[var(--bb-line)] bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <BlackbirdBrand compact />
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-xs font-bold">{organizationName}</p>
                  <p className="truncate text-[11px] text-neutral-500">{branchName ?? "Sucursal principal"}</p>
                </div>
              </div>

              <div className="hidden min-w-0 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Contexto activo</p>
                <p className="truncate text-sm font-bold">{organizationName} · {branchName ?? "Sucursal principal"}</p>
              </div>

              <details className="relative lg:hidden">
                <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-2xl border border-[var(--bb-line)] bg-white text-lg [&::-webkit-details-marker]:hidden">☰</summary>
                <div className="absolute right-0 mt-3 w-[min(82vw,320px)] rounded-3xl border border-[var(--bb-line)] bg-white p-3 shadow-2xl">
                  <div className="mb-3 rounded-2xl bg-[var(--bb-soft)] p-3">
                    <p className="truncate text-sm font-bold">{organizationName}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">{branchName ?? "Sucursal principal"} · {roleName ?? "Usuario"}</p>
                  </div>
                  {nav}
                  <form action={logout} className="mt-3 border-t border-[var(--bb-line)] pt-3">
                    <button className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-600">Cerrar sesión</button>
                  </form>
                </div>
              </details>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="rounded-full border border-[var(--bb-line)] bg-white px-3 py-2 text-xs font-semibold text-neutral-600">HN · HNL</span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--bb-ink)] text-xs font-bold text-white">{firstName.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
