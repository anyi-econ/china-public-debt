import { ReactNode } from "react";

export function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint: string; icon: ReactNode }) {
  return (
    <div className="card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl border border-slateBlue/10 bg-slateBlue/10 p-3 text-slateBlue">{icon}</div>
      </div>
    </div>
  );
}
