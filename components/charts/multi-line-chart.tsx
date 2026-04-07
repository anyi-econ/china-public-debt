import type { AnnualMetricSeries } from "@/lib/types";

const COLORS = ["#8B0000", "#1B4965", "#8B6914"];

export function MultiLineChart({
  seriesList,
  unit,
}: {
  seriesList: { series: AnnualMetricSeries; color?: string }[];
  unit: string;
}) {
  if (!seriesList.length || !seriesList[0].series.values.length) {
    return <div className="text-sm text-[#777]">暂无可展示数据</div>;
  }

  const width = 720;
  const height = 340;
  const padding = { top: 24, right: 20, bottom: 50, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = seriesList.flatMap((s) => s.series.values.map((v) => v.value));
  const max = Math.max(...allValues);
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;

  const labels = seriesList[0].series.values.map((v) => `${v.year}`);

  const toX = (i: number) => padding.left + (chartWidth * i) / Math.max(labels.length - 1, 1);
  const toY = (v: number) => padding.top + ((max - v) / range) * chartHeight;

  const ticks = Array.from({ length: 5 }, (_, i) => min + (range * i) / 4);

  const lines = seriesList.map((s, si) => {
    const color = s.color ?? COLORS[si % COLORS.length];
    const pts = s.series.values.map((v, i) => ({ x: toX(i), y: toY(v.value), value: v.value }));
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return { color, pts, path, label: s.series.label, key: s.series.key };
  });

  const latestYear = seriesList[0].series.values.at(-1)?.year;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[340px] w-full overflow-visible">
        {/* grid */}
        {ticks.map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#ebe6df" strokeDasharray="4 4" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8b8175">
                {tick >= 10000 ? `${(tick / 10000).toFixed(1)}万` : tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* x-axis labels */}
        {labels.map((label, i) => (
          <text key={label} x={toX(i)} y={height - 12} textAnchor="middle" fontSize="11" fill="#7c746a">
            {label}
          </text>
        ))}

        {/* lines */}
        {lines.map((line) => (
          <g key={line.key}>
            <path d={line.path} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {line.pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === line.pts.length - 1 ? 5 : 3}
                fill={i === line.pts.length - 1 ? line.color : "#fff"}
                stroke={line.color}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#ebe6df] pt-3">
        {lines.map((line) => {
          const latest = line.pts.at(-1);
          return (
            <span key={line.key} className="flex items-center gap-1.5 text-sm text-[#444]">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: line.color }} />
              {line.label}
              {latest ? <span className="text-xs text-[#888]">（{latest.value.toLocaleString("zh-CN")} {unit}）</span> : null}
            </span>
          );
        })}
        {latestYear ? <span className="ml-auto text-xs text-[#8b8175]">截至 {latestYear} 年</span> : null}
      </div>
    </div>
  );
}
