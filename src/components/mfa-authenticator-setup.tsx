"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Factor = {
  id: string;
  friendly_name?: string | null;
  status?: string;
};

type Enrollment = {
  id: string;
  qrCode: string;
  secret: string;
};

function normalizeQr(value: string) {
  if (value.startsWith("data:")) return value;
  if (value.trim().startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
  }
  return value;
}

export function MfaAuthenticatorSetup() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadFactors() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      setError("No pudimos consultar los factores de seguridad.");
      setLoading(false);
      return;
    }

    setFactors(((data?.totp ?? []) as Factor[]).filter((factor) => factor.status === "verified"));
    setLoading(false);
  }

  useEffect(() => {
    void loadFactors();
  }, []);

  async function beginEnrollment() {
    setBusy(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { data: listed } = await supabase.auth.mfa.listFactors();
    const unverified = ((listed?.totp ?? []) as Factor[]).filter(
      (factor) => factor.status !== "verified",
    );

    for (const factor of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Blackbird Authenticator",
    });

    if (error || !data?.totp) {
      setError("No pudimos iniciar la configuración de Authenticator.");
      setBusy(false);
      return;
    }

    setEnrollment({
      id: data.id,
      qrCode: normalizeQr(data.totp.qr_code),
      secret: data.totp.secret,
    });
    setBusy(false);
  }

  async function verifyEnrollment() {
    if (!enrollment || code.trim().length !== 6) {
      setError("Escribe el código de 6 dígitos que aparece en tu Authenticator.");
      return;
    }

    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.id,
      code: code.trim(),
    });

    if (error) {
      setError("El código no coincide. Espera un nuevo código e inténtalo otra vez.");
      setBusy(false);
      return;
    }

    setEnrollment(null);
    setCode("");
    setMessage("Autenticación de dos factores activada correctamente.");
    await loadFactors();
    router.refresh();
    setBusy(false);
  }

  async function disableFactor(factorId: string) {
    setBusy(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      setError(
        "No pudimos desactivar este Authenticator. Por seguridad, vuelve a iniciar sesión y verifica tu código 2FA antes de intentarlo.",
      );
      setBusy(false);
      return;
    }

    await supabase.auth.refreshSession();
    setMessage("Authenticator desactivado.");
    await loadFactors();
    router.refresh();
    setBusy(false);
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando seguridad…</p>;
  }

  return (
    <div>
      {error ? (
        <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      {factors.length ? (
        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div
              key={factor.id}
              className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-black text-emerald-900">
                  2FA activo
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {factor.friendly_name || `Authenticator ${index + 1}`}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => disableFactor(factor.id)}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
              >
                Desactivar
              </button>
            </div>
          ))}
          <p className="text-xs leading-5 text-neutral-500">
            Al iniciar sesión, Blackbird solicitará el código temporal generado por tu aplicación Authenticator.
          </p>
        </div>
      ) : enrollment ? (
        <div>
          <div className="rounded-3xl bg-[var(--bb-soft)] p-5">
            <p className="text-sm font-black">1. Escanea el código QR</p>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Puedes usar Google Authenticator, Microsoft Authenticator, Authy, 1Password u otra app compatible con TOTP.
            </p>
            <div className="mt-5 flex justify-center rounded-2xl bg-white p-5">
              <img
                src={enrollment.qrCode}
                alt="Código QR para configurar Blackbird en una app Authenticator"
                className="h-56 w-56"
              />
            </div>
            <p className="mt-4 text-xs font-semibold text-neutral-500">
              Si no puedes escanearlo, ingresa esta clave manualmente:
            </p>
            <code className="mt-2 block break-all rounded-xl bg-white p-3 text-xs font-bold">
              {enrollment.secret}
            </code>
          </div>

          <div className="mt-5">
            <p className="text-sm font-black">2. Confirma el código</p>
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="mt-3 w-full rounded-2xl border border-[var(--bb-line)] px-4 py-4 text-center text-2xl font-black tracking-[0.35em]"
            />
            <button
              type="button"
              disabled={busy}
              onClick={verifyEnrollment}
              className="mt-4 w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm font-black text-white disabled:bg-neutral-400"
            >
              {busy ? "Verificando…" : "Activar 2FA"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm leading-6 text-neutral-500">
            Protege tu cuenta con un código de 6 dígitos que cambia cada pocos segundos. El QR es estándar TOTP, así que tú eliges qué aplicación Authenticator usar.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={beginEnrollment}
            className="mt-5 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-black text-white disabled:bg-neutral-400"
          >
            {busy ? "Preparando…" : "Configurar Authenticator"}
          </button>
        </div>
      )}
    </div>
  );
}
