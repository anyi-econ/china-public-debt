import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "muted";
}) {
  const toneClass = {
    default: "border-[var(--line)] bg-white/50 text-[var(--ink-soft)]",
    accent: "border-[rgba(157,107,63,0.24)] bg-[var(--accent-soft)] text-[var(--accent)]",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    muted: "border-[var(--line)] bg-white/35 text-[var(--ink-soft)]"
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}
