import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "muted";
}) {
  const toneClass = {
    default: "border-line bg-mist text-slate-600",
    accent: "border-slateBlue/20 bg-slateBlue/10 text-slateBlue",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    muted: "border-slate-200 bg-slate-50 text-slate-500"
  }[tone];

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${toneClass}`}>{children}</span>;
}
