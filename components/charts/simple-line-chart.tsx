interface LineChartDatum {
  label: string;
  value: number;
}

export function SimpleLineChart({
  data,
  unit,
  color = "#8B0000"
}: {
  data: LineChartDatum[];
  unit: string;
  color?: string;
}) {
  if (!data.length) {
    return <div className="text-sm text-[#777]">暂无可展示数据</div>;
  }

  const width = 720;
  const height = 320;
  const padding = { top: 20, right: 20, bottom: 42, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, max * 0.1, 1);
  const ticks = Array.from({ length: 4 }, (_, index) => min + (range * index) / 3);

  const points = data.map((item, index) => {
    const x = padding.left + (chartWidth * index) / Math.max(data.length - 1, 1);
    const y = padding.top + ((max - item.value) / range) * chartHeight;
    return { ...item, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding.left} ${height - padding.bottom} L ${points[0]?.x ?? padding.left} ${height - padding.bottom} Z`;
  const latestPoint = points.at(-1);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full overflow-visible">
        {ticks.map((tick) => {
          const y = padding.top + ((max - tick) / range) * chartHeight;
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#ebe6df" strokeDasharray="4 4" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8b8175">
                {tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#lineFill)" opacity="0.75" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={index === points.length - 1 ? 5.5 : 4} fill={index === points.length - 1 ? color : "#fff"} stroke={color} strokeWidth="2" />
            <text x={point.x} y={height - 18} textAnchor="middle" fontSize="11" fill="#7c746a">
              {point.label}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
      </svg>

      {latestPoint ? (
        <div className="flex items-end justify-between gap-4 border-t border-[#ebe6df] pt-3">
          <div>
            <p className="font-medium text-[#1a1a1a]">
              {latestPoint.label} 年：{latestPoint.value.toLocaleString("zh-CN")} {unit}
            </p>
            <p className="mt-1 text-sm text-[#777]">折线图展示历年全国地方政府债券发行规模变化趋势。</p>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.18em] text-[#8b8175]">Official annual series</div>
        </div>
      ) : null}
    </div>
  );
}
