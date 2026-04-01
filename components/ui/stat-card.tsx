import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-h-[180px] flex-col justify-between border-t border-[var(--line-strong)] pt-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{label}</p>
        <div className="rounded-full border border-[var(--line)] p-3 text-[var(--accent)]">{icon}</div>
      </div>
      <div className="mt-6">
        <p className="display-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">{value}</p>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{hint}</p>
      </div>
    </div>
  );
}
