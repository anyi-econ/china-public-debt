import { ReactNode } from "react";

export function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint: string; icon: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-line/80 bg-white/75 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slateBlue">{icon}</div>
      </div>
    </div>
  );
}
