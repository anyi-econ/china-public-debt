interface ChartDatum {
  label: string;
  value: number;
  tone?: "primary" | "secondary";
}

export function SimpleBarChart({ data, unit }: { data: ChartDatum[]; unit: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const width = `${(item.value / max) * 100}%`;
        const color = item.tone === "secondary" ? "bg-accent/70" : "bg-slateBlue";
        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-medium text-ink">{item.value.toLocaleString("zh-CN")} {unit}</span>
            </div>
            <div className="h-3 rounded-full bg-mist">
              <div className={`h-3 rounded-full ${color}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
