"use client";

import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const options: Array<{
  value: ThemePreference;
  label: string;
  icon: string;
}> = [
  { value: "light", label: "Claro", icon: "☀" },
  { value: "dark", label: "Oscuro", icon: "◐" },
  { value: "system", label: "Sistema", icon: "◒" },
];

function resolveTheme(preference: ThemePreference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;

  window.localStorage.setItem("blackbird-theme", preference);

  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute(
        "content",
        resolved === "dark" ? "#0c0d0f" : "#f6f6f4",
      ),
    );
}

export function ThemeSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [preference, setPreference] =
    useState<ThemePreference>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("blackbird-theme");
    const initial: ThemePreference =
      saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";

    setPreference(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      const current = window.localStorage.getItem("blackbird-theme");
      if (!current || current === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  function selectTheme(next: ThemePreference) {
    setPreference(next);
    applyTheme(next);
  }

  return (
    <div
      className={`bb-theme-switcher ${compact ? "bb-theme-switcher-compact" : ""} ${className}`}
      role="group"
      aria-label="Tema de Blackbird"
    >
      {options.map((option) => {
        const active = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => selectTheme(option.value)}
            className={`bb-theme-option ${active ? "is-active" : ""}`}
            aria-pressed={active}
            title={`Usar modo ${option.label.toLowerCase()}`}
          >
            <span aria-hidden="true">{option.icon}</span>
            {!compact ? <span>{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function AuthThemeSwitcher() {
  return (
    <div className="fixed right-4 top-4 z-[80] sm:right-6 sm:top-6">
      <ThemeSwitcher compact />
    </div>
  );
}
