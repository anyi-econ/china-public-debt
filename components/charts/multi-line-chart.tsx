interface MultiLineChartSeries {
  label: string;
  color: string;
  values: { label: string; value: number }[];
}

export function MultiLineChart({
  series,
  unit,
}: {
  series: MultiLineChartSeries[];
  unit: string;
}) {
  const allValues = series.flatMap((s) => s.values.map((v) => v.value));
  if (!allValues.length) {
    return <div className="text-sm text-[#777]">暂无可展示数据</div>;
  }

  const width = 720;
  const height = 340;
  const padding = { top: 24, right: 20, bottom: 42, left: 64 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const max = Math.max(...allValues);
  const min = Math.min(0, ...allValues);
  const range = Math.max(max - min, max * 0.1, 1);

  const labels = series[0]?.values.map((v) => v.label) ?? [];
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => min + (range * i) / (tickCount - 1));

  const toX = (index: number) =>
    padding.left + (chartWidth * index) / Math.max(labels.length - 1, 1);
  const toY = (value: number) =>
    padding.top + ((max - value) / range) * chartHeight;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-[#555]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[340px] w-full overflow-visible">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.label} id={`fill-${s.label}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {ticks.map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#ebe6df"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8b8175">
                {tick >= 10000 ? `${(tick / 10000).toFixed(1)}万` : tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, index) => (
          <text
            key={label}
            x={toX(index)}
            y={height - 14}
            textAnchor="middle"
            fontSize="11"
            fill="#7c746a"
          >
            {label}
          </text>
        ))}

        {/* Lines + areas */}
        {series.map((s) => {
          const points = s.values.map((v, i) => ({ x: toX(i), y: toY(v.value), ...v }));
          const linePath = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");
          const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding.left} ${height - padding.bottom} L ${points[0]?.x ?? padding.left} ${height - padding.bottom} Z`;

          return (
            <g key={s.label}>
              <path d={areaPath} fill={`url(#fill-${s.label})`} opacity="0.6" />
              <path
                d={linePath}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <circle
                  key={p.label}
                  cx={p.x}
                  cy={p.y}
                  r={i === points.length - 1 ? 5 : 3.5}
                  fill={i === points.length - 1 ? s.color : "#fff"}
                  stroke={s.color}
                  strokeWidth="2"
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Latest values summary */}
      <div className="flex flex-wrap gap-4 border-t border-[#ebe6df] pt-3">
        {series.map((s) => {
          const latest = s.values.at(-1);
          return latest ? (
            <div key={s.label} className="text-sm">
              <span className="font-medium text-[#1a1a1a]">
                {s.label}：{latest.value.toLocaleString("zh-CN")} {unit}
              </span>
              <span className="ml-1 text-[#999]">({latest.label}年)</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
