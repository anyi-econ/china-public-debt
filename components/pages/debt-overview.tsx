"use client";

import { useMemo, useState } from "react";
import { AnnualIssuanceDataset } from "@/lib/types";
import { MultiLineChart } from "@/components/charts/multi-line-chart";

export function DebtOverview({ annualIssuance, annualBalance }: { annualIssuance: AnnualIssuanceDataset; annualBalance: AnnualIssuanceDataset }) {
  const regionOptions = useMemo(() => annualIssuance.regions?.map((region) => region.name) ?? ["全国"], [annualIssuance.regions]);
  const [selectedRegion, setSelectedRegion] = useState("全国");

  const resolveSeries = (dataset: AnnualIssuanceDataset, regionName: string) => {
    if (regionName === "全国") {
      return dataset.series;
    }

    return dataset.regions?.find((region) => region.name === regionName)?.series ?? dataset.series;
  };

  const issuanceSeries = resolveSeries(annualIssuance, selectedRegion);
  const balanceSeries = resolveSeries(annualBalance, selectedRegion);

  const totalIssuanceSeries = issuanceSeries.find((series) => series.key === "total") ?? issuanceSeries[0];
  const specialIssuanceSeries = issuanceSeries.find((series) => series.key === "special");
  const totalBalanceSeries = balanceSeries.find((series) => series.key === "total") ?? balanceSeries[0];

  const latestIssuance = totalIssuanceSeries?.values.at(-1);
  const previousIssuance = totalIssuanceSeries?.values.at(-2);
  const latestSpecialIssuance = specialIssuanceSeries?.values.at(-1);
  const latestBalance = totalBalanceSeries?.values.at(-1);
  const previousBalance = totalBalanceSeries?.values.at(-2);

  const issuanceGrowth = latestIssuance && previousIssuance ? ((latestIssuance.value - previousIssuance.value) / previousIssuance.value) * 100 : 0;
  const balanceGrowth = latestBalance && previousBalance ? ((latestBalance.value - previousBalance.value) / previousBalance.value) * 100 : 0;
  const specialShare = latestIssuance && latestSpecialIssuance ? (latestSpecialIssuance.value / latestIssuance.value) * 100 : 0;

  const issuanceSeriesList = issuanceSeries.map((series, index) => ({
    series,
    color: ["#8B0000", "#1B4965", "#8B6914"][index % 3],
  }));

  const balanceSeriesList = balanceSeries.map((series, index) => ({
    series,
    color: ["#8B0000", "#1B4965", "#8B6914"][index % 3],
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="info-card p-5">
          <p className="data-kicker">年度发行规模</p>
          <h3 className="data-stat">{latestIssuance?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestIssuance?.year ?? "--"} 年 · 同比 {issuanceGrowth.toFixed(1)}%</p>
          <p className="data-note">{selectedRegion}口径，来源：{annualIssuance.source.name}，指标 ID {totalIssuanceSeries?.metricId ?? "--"}。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">债务余额规模</p>
          <h3 className="data-stat">{latestBalance?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestBalance?.year ?? "--"} 年 · 同比 {balanceGrowth.toFixed(1)}%</p>
          <p className="data-note">跟随地区筛选联动，直接对应下方余额趋势图的最新年度点位。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">专项债发行占比</p>
          <h3 className="data-stat">{specialShare.toFixed(1)}%</h3>
          <p className="data-substat">
            {latestSpecialIssuance?.value.toLocaleString("zh-CN") ?? "--"} / {latestIssuance?.value.toLocaleString("zh-CN") ?? "--"} 亿元
          </p>
          <p className="data-note">用于观察{selectedRegion === "全国" ? "全国" : selectedRegion}近年新增债务工具中专项债的权重变化。</p>
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
    </div>
  );
}
