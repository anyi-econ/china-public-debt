"use client";

import { useMemo, useState } from "react";
import { DebtDataItem } from "@/lib/types";
import { AnnualIssuanceDataset } from "@/lib/types";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { MultiLineChart } from "@/components/charts/multi-line-chart";

export function DebtOverview({ items, annualIssuance, annualBalance }: { items: DebtDataItem[]; annualIssuance: AnnualIssuanceDataset; annualBalance: AnnualIssuanceDataset }) {
  const regionOptions = useMemo(() => annualIssuance.regions?.map((region) => region.name) ?? ["全国"], [annualIssuance.regions]);
  const [selectedRegion, setSelectedRegion] = useState("全国");
  const issuance = items.filter((item) => item.metricType === "issuance");
  const balances = items.filter((item) => item.metricType === "balance");
  const latestBalance = balances[0];
  const monthlyTotal = issuance.reduce((sum, item) => sum + item.value, 0);
  const specialBondTotal = issuance.filter((item) => item.bondType.includes("专项")).reduce((sum, item) => sum + item.value, 0);
  const totalSeries = annualIssuance.series.find((series) => series.key === "total") ?? annualIssuance.series[0];
  const generalSeries = annualIssuance.series.find((series) => series.key === "general");
  const specialSeries = annualIssuance.series.find((series) => series.key === "special");
  const latestAnnual = totalSeries?.values.at(-1);
  const previousAnnual = totalSeries?.values.at(-2);
  const latestSpecial = specialSeries?.values.at(-1);
  const latestGeneral = generalSeries?.values.at(-1);
  const annualGrowth = latestAnnual && previousAnnual ? ((latestAnnual.value - previousAnnual.value) / previousAnnual.value) * 100 : 0;
  const specialShare = latestAnnual && latestSpecial ? (latestSpecial.value / latestAnnual.value) * 100 : 0;

  const resolveSeries = (dataset: AnnualIssuanceDataset, regionName: string) => {
    if (regionName === "全国") {
      return dataset.series;
    }

    return dataset.regions?.find((region) => region.name === regionName)?.series ?? dataset.series;
  };

  const issuanceSeriesList = resolveSeries(annualIssuance, selectedRegion).map((series, index) => ({
    series,
    color: ["#8B0000", "#1B4965", "#8B6914"][index % 3],
  }));

  const balanceSeriesList = resolveSeries(annualBalance, selectedRegion).map((series, index) => ({
    series,
    color: ["#8B0000", "#1B4965", "#8B6914"][index % 3],
  }));

  const byMonth = Array.from(
    issuance.reduce((map, item) => {
      const month = item.date.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + item.value);
      return map;
    }, new Map<string, number>())
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([label, value]) => ({ label, value }));

  const byType = Array.from(
    issuance.reduce((map, item) => {
      map.set(item.bondType, (map.get(item.bondType) ?? 0) + item.value);
      return map;
    }, new Map<string, number>())
  ).map(([label, value], index) => ({
    label,
    value,
    tone: (index % 2 ? "secondary" : "primary") as "primary" | "secondary"
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="info-card p-5">
          <p className="data-kicker">年度发行规模</p>
          <h3 className="data-stat">{latestAnnual?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestAnnual?.year ?? "--"} 年</p>
          <p className="data-note">来源：{annualIssuance.source.name} 年度数据页，指标 ID {totalSeries?.metricId ?? "--"}。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">专项债占比</p>
          <h3 className="data-stat">{specialShare.toFixed(1)}%</h3>
          <p className="data-substat">
            {latestSpecial?.value.toLocaleString("zh-CN") ?? "--"} / {latestAnnual?.value.toLocaleString("zh-CN") ?? "--"} 亿元
          </p>
          <p className="data-note">用于观察近年稳增长工具中专项债的重要性变化。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">月度余额节点</p>
          <h3 className="data-stat">{latestBalance?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestBalance?.date ?? "--"}</p>
          <p className="data-note">补充口径来自财政部债务管理司月度统计页。</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ebe6df] bg-[#fcfbf8] px-5 py-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-[#8b8175]">Chart Filter</div>
          <div className="mt-1 text-sm text-[#4f473f]">发行额趋势与债务余额趋势共享同一个地区筛选。</div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#6f665d]">
          <span>地区</span>
          <select
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
            className="rounded-full border border-[#d8d0c6] bg-white px-3 py-1.5 text-sm text-[#2a2622] outline-none transition focus:border-[#8B0000]"
          >
            {regionOptions.map((regionName) => (
              <option key={regionName} value={regionName}>
                {regionName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="info-card p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title">地方债务余额趋势</h3>
            <span className="text-sm text-[#6f665d]">当前地区：{selectedRegion}</span>
          </div>
          <MultiLineChart seriesList={balanceSeriesList} unit="亿元" />
        </article>
        <article className="info-card p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title">地方债券发行额趋势</h3>
            <span className="text-sm text-[#6f665d]">当前地区：{selectedRegion}</span>
          </div>
          <MultiLineChart seriesList={issuanceSeriesList} unit="亿元" />
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="info-card p-4">
          <h3 className="section-title">官方数据入口</h3>
          <div className="space-y-3">
            {annualIssuance.links.map((link) => (
              <div key={link.url} className="list-row pb-3 last:border-b-0 last:pb-0">
                <div className="event-title">{link.title}</div>
                <div className="event-summary mt-1">{link.description}</div>
                <div className="event-sources">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    打开官方页面 ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="info-card p-4">
          <h3 className="section-title">月度补充观察</h3>
          <SimpleBarChart data={byMonth} unit="亿元" />
          <div className="event-summary mt-4">
            当前月度样本中专项债发行合计 {specialBondTotal.toLocaleString("zh-CN")} 亿元，可与年度发行口径结合使用，追踪专项债节奏和余额变化。
          </div>
        </article>
      </div>

      <article className="info-card p-4">
        <h3 className="section-title">月度结构化记录</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="event-summary">
              当前记录主要来自财政部债务管理司月度统计页，保留具体统计页面链接，便于老师直接跳回原始口径核验。
            </div>
          </div>
          <div>
            <SimpleBarChart data={byType} unit="亿元" />
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <article key={item.id} className="event-card expanded">
            <div className="event-card-header cursor-default">
              <span className="event-date">{item.date.slice(5)}</span>
              <span className="event-type-tag" style={{ background: "#1B4965", color: "#fff" }}>
                {item.metricType === "issuance" ? "发行" : "余额"}
              </span>
              <span className="event-title">
                {item.bondType}：{item.value.toLocaleString("zh-CN")} {item.unit}
              </span>
            </div>
            <div className="event-card-body" style={{ maxHeight: "400px" }}>
              <div className="event-card-content">
                <div className="event-summary">{item.notes ?? item.source}</div>
                <div className="event-metrics">
                  <span className="metric-badge">{item.level === "local" ? "地方" : "中央"}</span>
                  <span className="metric-badge">{item.source}</span>
                </div>
                {item.url ? (
                  <div className="event-sources">
                    <a href={item.url} target="_blank" rel="noreferrer">
                      财政部原始统计页 ↗
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
