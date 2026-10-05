"use client";

import { useState } from "react";

export function BusinessLocationFields({
  departments,
}: {
  departments: readonly string[];
}) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="md:col-span-2">
      <div className="rounded-3xl border border-[var(--bb-line)] bg-[var(--bb-soft)] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold">¿Tu negocio opera solo en línea?</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Actívalo si no tienes una tienda, consultorio, oficina o local físico.
            </p>
          </div>

          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              name="isOnline"
              value="true"
              checked={isOnline}
              onChange={(event) => setIsOnline(event.target.checked)}
              className="peer sr-only"
            />
            <span className="h-7 w-12 rounded-full bg-neutral-300 transition peer-checked:bg-[var(--bb-accent)]" />
            <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isOnline ? "bg-white text-neutral-400" : "bg-neutral-950 text-white"}`}>
            Ubicación física
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isOnline ? "bg-[var(--bb-accent-soft)] text-[var(--bb-accent-strong)]" : "bg-white text-neutral-400"}`}>
            En línea
          </span>
        </div>
      </div>

      {isOnline ? (
        <div className="mt-4 rounded-2xl border border-[var(--bb-line)] bg-white p-4">
          <p className="text-sm font-bold">Operación en línea</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            No te pediremos una dirección física. Blackbird creará una ubicación virtual principal para mantener organizada tu operación.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Departamento
            <select
              name="department"
              defaultValue="Francisco Morazán"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5"
            >
              {departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Municipio
            <input
              name="municipality"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-3.5"
            />
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Dirección del local principal
            <textarea
              name="address"
              rows={3}
              required
              placeholder="Barrio, colonia, avenida, calle o referencia"
              className="mt-2 w-full resize-none rounded-2xl border border-[var(--bb-line)] px-4 py-3.5"
            />
          </label>
        </div>
      )}
    </div>
  );
}
