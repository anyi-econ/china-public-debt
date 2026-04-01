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
        const color = item.tone === "secondary" ? "#b9c1cf" : "#8B0000";
        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-5 text-sm">
              <span className="text-[#777]">{item.label}</span>
              <span className="font-medium text-[#1a1a1a]">
                {item.value.toLocaleString("zh-CN")} {unit}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#f0ede8]">
              <div className="h-full rounded-full" style={{ width, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
