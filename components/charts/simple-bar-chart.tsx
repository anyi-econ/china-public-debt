interface ChartDatum {
  label: string;
  value: number;
  tone?: "primary" | "secondary";
}

export function SimpleBarChart({ data, unit }: { data: ChartDatum[]; unit: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-5">
      {data.map((item) => {
        const width = `${(item.value / max) * 100}%`;
        const color = item.tone === "secondary" ? "bg-white/55" : "bg-[var(--accent)]";
        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-5 text-sm">
              <span className="text-[var(--ink-soft)]">{item.label}</span>
              <span className="font-medium text-[var(--ink)]">
                {item.value.toLocaleString("zh-CN")} {unit}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/12">
              <div className={`h-full rounded-full ${color}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
