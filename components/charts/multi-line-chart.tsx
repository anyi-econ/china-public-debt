"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { AnnualMetricSeries } from "@/lib/types";

const COLORS = ["#8B0000", "#1B4965", "#8B6914"];

function buildPath(points: Array<{ x: number; y: number; defined: boolean }>) {
  let path = "";
  let started = false;

  for (const point of points) {
    if (!point.defined) {
      started = false;
      continue;
    }

    path += `${started ? " L" : "M"} ${point.x} ${point.y}`;
    started = true;
  }

  return path.trim();
}

function formatAxisValue(value: number) {
  return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value.toFixed(0);
}

export function MultiLineChart({
  seriesList,
  unit,
}: {
  seriesList: { series: AnnualMetricSeries; color?: string }[];
  unit: string;
}) {
  if (!seriesList.length || !seriesList.some((item) => item.series.values.length)) {
    return <div className="text-sm text-[#777]">暂无可展示数据</div>;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSeriesKey, setActiveSeriesKey] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const gradientPrefix = useId().replace(/:/g, "");

  const width = 720;
  const height = 340;
  const padding = { top: 24, right: 20, bottom: 50, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const labels = useMemo(
    () =>
      Array.from(new Set(seriesList.flatMap((item) => item.series.values.map((value) => `${value.year}`)))).sort(
        (a, b) => Number(a) - Number(b)
      ),
    [seriesList]
  );

  const allValues = seriesList.flatMap((item) => item.series.values.map((value) => value.value));
  const max = Math.max(...allValues);
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;
  const ticks = Array.from({ length: 5 }, (_, index) => min + (range * index) / 4);

  const toX = (index: number) => padding.left + (chartWidth * index) / Math.max(labels.length - 1, 1);
  const toY = (value: number) => padding.top + ((max - value) / range) * chartHeight;

  const lines = seriesList.map((item, index) => {
    const color = item.color ?? COLORS[index % COLORS.length];
    const valueMap = new Map(item.series.values.map((value) => [`${value.year}`, value.value]));
    const points = labels.map((label, labelIndex) => {
      const value = valueMap.get(label);

      return {
        x: toX(labelIndex),
        y: value == null ? 0 : toY(value),
        label,
        value,
        defined: value != null,
      };
    });

    return {
      color,
      key: item.series.key,
      label: item.series.label,
      points,
      path: buildPath(points),
      latestPoint: [...points].reverse().find((point) => point.defined && point.value != null),
    };
  });

  const latestYear = labels.at(-1) ?? null;
  const snapshotYear = activeYear ?? latestYear;
  const snapshot = snapshotYear
    ? lines.flatMap((line) => {
        const point = line.points.find((item) => item.label === snapshotYear && item.defined && item.value != null);

        return point && point.value != null
          ? [{ key: line.key, label: line.label, color: line.color, value: point.value }]
          : [];
      })
    : [];

  const orderedSnapshot = activeSeriesKey
    ? [...snapshot].sort((left, right) => Number(right.key === activeSeriesKey) - Number(left.key === activeSeriesKey))
    : snapshot;

  const showTooltip = snapshotYear != null && tooltip.visible;
  const activeX = activeYear ? lines[0]?.points.find((point) => point.label === activeYear)?.x ?? null : null;
  const activePoint =
    activeYear && activeSeriesKey
      ? lines
          .find((line) => line.key === activeSeriesKey)
          ?.points.find((point) => point.label === activeYear && point.defined && point.value != null) ?? null
      : null;

  function updateTooltipPosition(event: React.MouseEvent<SVGElement | SVGRectElement | SVGCircleElement | SVGPathElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const nextX = Math.min(Math.max(event.clientX - rect.left + 14, 16), rect.width - 220);
    const nextY = Math.max(event.clientY - rect.top - 18, 16);
    setTooltip({ x: nextX, y: nextY, visible: true });
  }

  function clearHover() {
    setActiveSeriesKey(null);
    setActiveYear(null);
    setTooltip((current) => ({ ...current, visible: false }));
  }

  return (
    <div ref={containerRef} className="relative space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[340px] w-full overflow-visible" onMouseLeave={clearHover}>
        {ticks.map((tick) => {
          const y = toY(tick);

          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#ebe6df" strokeDasharray="4 4" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8b8175">
                {formatAxisValue(tick)}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) => (
          <text key={label} x={toX(index)} y={height - 12} textAnchor="middle" fontSize="11" fill="#7c746a">
            {label}
          </text>
        ))}

        {labels.map((label, index) => {
          const left = index === 0 ? padding.left : (toX(index - 1) + toX(index)) / 2;
          const right = index === labels.length - 1 ? width - padding.right : (toX(index) + toX(index + 1)) / 2;

          return (
            <rect
              key={`hover-band-${label}`}
              x={left}
              y={padding.top}
              width={Math.max(right - left, 1)}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={(event) => {
                setActiveYear(label);
                updateTooltipPosition(event);
              }}
              onMouseMove={(event) => {
                setActiveYear(label);
                updateTooltipPosition(event);
              }}
            />
          );
        })}

        {activeX != null ? (
          <line
            x1={activeX}
            y1={padding.top}
            x2={activeX}
            y2={height - padding.bottom}
            stroke="#8B0000"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            opacity="0.6"
          />
        ) : null}

        {activePoint ? (
          <>
            <line
              x1={padding.left}
              y1={activePoint.y}
              x2={width - padding.right}
              y2={activePoint.y}
              stroke={lines.find((line) => line.key === activeSeriesKey)?.color ?? "#8B0000"}
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.45"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="10" fill="none" stroke={lines.find((line) => line.key === activeSeriesKey)?.color ?? "#8B0000"} strokeWidth="2" opacity="0.35" />
          </>
        ) : null}

        {lines.map((line) => {
          const isSeriesActive = activeSeriesKey === line.key;
          const isDimmed = activeSeriesKey != null && !isSeriesActive;
          const fillId = `${gradientPrefix}-${line.key}`;

          return (
            <g key={line.key}>
              <defs>
                <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={line.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={line.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d={line.path}
                fill="none"
                stroke={line.color}
                strokeWidth={isSeriesActive ? "4" : "2.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isDimmed ? "0.28" : "1"}
                style={{ cursor: "pointer", transition: "all 120ms ease" }}
                onMouseEnter={(event) => {
                  setActiveSeriesKey(line.key);
                  updateTooltipPosition(event);
                }}
                onMouseMove={(event) => {
                  setActiveSeriesKey(line.key);
                  updateTooltipPosition(event);
                }}
              />
              {line.points.map((point) => {
                if (!point.defined || point.value == null) {
                  return null;
                }

                const isPointActive = activeSeriesKey === line.key && activeYear === point.label;
                const isLatestPoint = point.label === latestYear;

                return (
                  <circle
                    key={`${line.key}-${point.label}`}
                    cx={point.x}
                    cy={point.y}
                    r={isPointActive ? 7 : isLatestPoint ? 5 : 3.5}
                    fill={isPointActive || isLatestPoint ? line.color : "#fff"}
                    stroke={line.color}
                    strokeWidth="2"
                    opacity={isDimmed && !isPointActive ? "0.35" : "1"}
                    style={{ cursor: "pointer", transition: "all 120ms ease" }}
                    onMouseEnter={(event) => {
                      setActiveSeriesKey(line.key);
                      setActiveYear(point.label);
                      updateTooltipPosition(event);
                    }}
                    onMouseMove={(event) => {
                      setActiveSeriesKey(line.key);
                      setActiveYear(point.label);
                      updateTooltipPosition(event);
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#ebe6df] pt-3">
        {lines.map((line) => {
          const isSeriesActive = activeSeriesKey === line.key;

          return (
            <button
              key={line.key}
              type="button"
              className="flex items-center gap-1.5 text-left text-sm text-[#444]"
              style={{ opacity: activeSeriesKey && !isSeriesActive ? 0.45 : 1 }}
              onMouseEnter={() => setActiveSeriesKey(line.key)}
              onMouseLeave={() => setActiveSeriesKey(null)}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  background: line.color,
                  boxShadow: isSeriesActive ? `0 0 0 4px ${line.color}22` : "none",
                }}
              />
              {line.label}
              {line.latestPoint?.value != null ? (
                <span className="text-xs text-[#888]">（{line.latestPoint.value.toLocaleString("zh-CN")} {unit}）</span>
              ) : null}
            </button>
          );
        })}
        {snapshotYear ? <span className="ml-auto text-xs text-[#8b8175]">{activeYear ? `悬停 ${snapshotYear} 年` : `截至 ${snapshotYear} 年`}</span> : null}
      </div>

      {showTooltip ? (
        <div
          className="pointer-events-none absolute z-10 min-w-[200px] rounded-2xl border border-[#d8d0c6] bg-[rgba(255,251,245,0.96)] px-4 py-3 shadow-[0_16px_40px_rgba(39,27,18,0.14)] backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translateY(-100%)" }}
        >
          <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#8b8175]">Hover snapshot</div>
          <div className="mb-2 text-sm font-medium text-[#1f1f1f]">{snapshotYear} 年</div>
          <div className="space-y-1.5 text-sm text-[#444]">
            {orderedSnapshot.map((item) => (
              <div key={item.key} className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                <span>{item.label}</span>
                <span className="ml-auto font-medium text-[#1f1f1f]">{item.value.toLocaleString("zh-CN")} {unit}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
