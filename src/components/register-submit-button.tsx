"use client";

import { useFormStatus } from "react-dom";

export function RegisterSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
    >
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </button>
  );
}
