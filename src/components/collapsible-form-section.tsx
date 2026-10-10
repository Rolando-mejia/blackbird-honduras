import type { ReactNode } from "react";

export function CollapsibleFormSection({
  title,
  description,
  eyebrow,
  status,
  defaultOpen = false,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  status?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={`bb-collapse rounded-3xl border border-[var(--bb-line)] bg-white shadow-sm ${className}`}
      open={defaultOpen}
    >
      <summary className="bb-collapse-summary cursor-pointer list-none px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--bb-accent)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 text-base font-black tracking-[-0.02em] sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {status ? (
              <span className="hidden rounded-full bg-[var(--bb-soft)] px-3 py-1.5 text-[11px] font-bold text-neutral-500 sm:inline">
                {status}
              </span>
            ) : null}
            <span className="bb-collapse-chevron grid h-9 w-9 place-items-center rounded-xl bg-[var(--bb-soft)] text-sm font-black text-neutral-500">
              ↓
            </span>
          </div>
        </div>
      </summary>

      <div className="bb-collapse-content border-t border-[var(--bb-line)] px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </div>
    </details>
  );
}
