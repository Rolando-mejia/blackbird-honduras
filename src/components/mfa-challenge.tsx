"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TotpFactor = {
  id: string;
  friendly_name?: string | null;
  status?: string;
};

export function MfaChallenge({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        setError("No pudimos cargar tu autenticación de dos factores.");
        setLoading(false);
        return;
      }

      const verified = ((data?.totp ?? []) as TotpFactor[]).filter(
        (factor) => factor.status === "verified",
      );

      setFactors(verified);
      setFactorId(verified[0]?.id ?? "");

      if (!verified.length) {
        setError("No encontramos un Authenticator activo para esta cuenta.");
      }

      setLoading(false);
    })();
  }, []);

  async function verify() {
    if (!factorId || code.trim().length !== 6) {
      setError("Escribe el código de 6 dígitos de tu Authenticator.");
      return;
    }

    setVerifying(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });

    if (error) {
      setError("El código no es válido o ya venció. Espera el siguiente e inténtalo otra vez.");
      setVerifying(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-[var(--bb-soft)] p-4 text-sm text-neutral-500">
        Preparando verificación…
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {factors.length > 1 ? (
        <label className="block text-sm font-semibold">
          Authenticator
          <select
            value={factorId}
            onChange={(event) => setFactorId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-3.5"
          >
            {factors.map((factor, index) => (
              <option key={factor.id} value={factor.id}>
                {factor.friendly_name || `Authenticator ${index + 1}`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="mt-5 block text-sm font-semibold">
        Código de 6 dígitos
        <input
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="mt-2 w-full rounded-2xl border border-[var(--bb-line)] bg-white px-4 py-4 text-center text-2xl font-black tracking-[0.35em]"
        />
      </label>

      <button
        type="button"
        onClick={verify}
        disabled={verifying || !factorId}
        className="mt-5 w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-black text-white disabled:bg-neutral-400"
      >
        {verifying ? "Verificando…" : "Verificar y entrar"}
      </button>
    </div>
  );
}
