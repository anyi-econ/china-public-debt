"use client";

import { useState } from "react";
import { FISCAL_REGIONS, type FiscalRegionNode } from "@/data/fiscal-budget-links";

const MUNICIPALITIES = new Set(["北京市", "天津市", "上海市", "重庆市"]);

/** 省直辖县级行政单位（不统计为地级市，统计为县级） */
const PROVINCE_DIRECT_COUNTIES = new Set([
  "济源示范区",
  "仙桃市", "潜江市", "天门市", "神农架林区",
  "五指山市", "文昌市", "琼海市", "万宁市", "东方市",
  "定安县", "屯昌县", "澄迈县", "临高县",
  "白沙黎族自治县", "昌江黎族自治县", "乐东黎族自治县",
  "陵水黎族自治县", "保亭黎族苗族自治县", "琼中黎族苗族自治县",
]);

/** 非地级市的容器节点（不统计为地级市，其子节点统计为县级） */
const NON_CITY_CONTAINERS = new Set(["新疆生产建设兵团"]);

/** 统计时排除的省级地区 */
const EXCLUDED_PROVINCES = new Set(["香港特别行政区", "澳门特别行政区", "台湾省"]);

/** 统计全局覆盖率 */
function countGlobalCoverage(nodes: FiscalRegionNode[]): { provinces: number; provincesTotal: number; cities: number; citiesTotal: number; counties: number; countiesTotal: number } {
  let provinces = 0, provincesTotal = 0, cities = 0, citiesTotal = 0, counties = 0, countiesTotal = 0;
  for (const prov of nodes) {
    if (EXCLUDED_PROVINCES.has(prov.name)) continue;
    provincesTotal++;
    if (prov.url) provinces++;
    const isMuni = MUNICIPALITIES.has(prov.name);
    for (const city of prov.children ?? []) {
      if (isMuni || PROVINCE_DIRECT_COUNTIES.has(city.name)) {
        countiesTotal++;
        if (city.url) counties++;
      } else if (NON_CITY_CONTAINERS.has(city.name)) {
        for (const county of city.children ?? []) {
          countiesTotal++;
          if (county.url) counties++;
        }
        continue;
      } else {
        citiesTotal++;
        if (city.url) cities++;
      }
      for (const county of city.children ?? []) {
        countiesTotal++;
        if (county.url) counties++;
      }
    }
  }
  return { provinces, provincesTotal, cities, citiesTotal, counties, countiesTotal };
}

/** 统计节点下"有链接"的市/县数量 */
function countCoverage(node: FiscalRegionNode): { cities: number; citiesTotal: number; counties: number; countiesTotal: number; isMunicipality: boolean } {
  const children = node.children ?? [];
  const isMunicipality = MUNICIPALITIES.has(node.name);
  let cities = 0, citiesTotal = 0, counties = 0, countiesTotal = 0;
  for (const city of children) {
    if (isMunicipality || PROVINCE_DIRECT_COUNTIES.has(city.name)) {
      countiesTotal++;
      if (city.url) counties++;
    } else if (NON_CITY_CONTAINERS.has(city.name)) {
      for (const county of city.children ?? []) {
        countiesTotal++;
        if (county.url) counties++;
      }
      continue;
    } else {
      citiesTotal++;
      if (city.url) cities++;
    }
    for (const county of city.children ?? []) {
      countiesTotal++;
      if (county.url) counties++;
    }
  }
  return { cities, citiesTotal, counties, countiesTotal, isMunicipality };
}

/** 根据导航路径获取当前层级的标题和列表 */
function resolveLevel(path: number[]): {
  label: string;
  items: FiscalRegionNode[];
  parent: FiscalRegionNode | null;
} {
  if (path.length === 0) {
    return { label: "省级地区", items: FISCAL_REGIONS, parent: null };
  }

  let current: FiscalRegionNode[] = FISCAL_REGIONS;
  let node: FiscalRegionNode | null = null;

  for (const idx of path) {
    node = current[idx];
    current = node?.children ?? [];
  }

  if (!node) {
    return { label: "省级地区", items: FISCAL_REGIONS, parent: null };
  }

  const isMuni = path.length >= 1 && MUNICIPALITIES.has(FISCAL_REGIONS[path[0]]?.name);
  const levelName =
    path.length === 1
      ? isMuni ? "区 / 县" : "地级市 / 州"
      : path.length === 2 ? "区 / 县 / 市" : "下级地区";

  return {
    label: `${node.name} · ${levelName}`,
    items: node.children ?? [],
    parent: node,
  };
}

function RegionItem({
  node,
  index,
  hasChildren,
  onDrill,
  showCoverage,
}: {
  node: FiscalRegionNode;
  index: number;
  hasChildren: boolean;
  onDrill: (index: number) => void;
  showCoverage?: boolean;
}) {
  const hasUrl = node.url.length > 0;

  // 覆盖率标注（仅省级）
  let coverageLabel: string | null = null;
  if (showCoverage && hasChildren) {
    const { cities, citiesTotal, counties, countiesTotal, isMunicipality } = countCoverage(node);
    const parts: string[] = [];
    if (citiesTotal > 0) parts.push(`${isMunicipality ? "区" : "市"} ${cities}/${citiesTotal}`);
    if (countiesTotal > 0) parts.push(`县 ${counties}/${countiesTotal}`);
    coverageLabel = parts.length > 0 ? parts.join(" · ") : null;
  }

  if (hasChildren) {
    // 可下钻的地区按钮
    return (
      <button
        type="button"
        className={
          "rounded border bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition " +
          (hasUrl
            ? "border-[var(--color-border)] hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
            : "border-dashed border-[var(--color-border)] text-[var(--color-muted)]")
        }
        onClick={() => onDrill(index)}
      >
        {node.name}
        {coverageLabel && (
          <span className="mt-1 block text-[0.7rem] font-normal text-[var(--color-muted)]">
            {coverageLabel}
          </span>
        )}
      </button>
    );
  }

  if (hasUrl) {
    // 叶子节点有链接
    return (
      <a
        href={node.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
      >
        {node.name}
      </a>
    );
  }

  // 叶子节点无链接，灰色显示
  return (
    <span className="block rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] leading-tight text-[var(--color-muted)]">
      {node.name}
    </span>
  );
}

export function FiscalBudgetNav() {
  // 导航路径：空数组 = 省列表，[0] = 第0个省的地市列表，[0, 2] = 第0省第2市的区县列表
  const [path, setPath] = useState<number[]>([]);

  const { label, items, parent } = resolveLevel(path);
  const coverage = countGlobalCoverage(FISCAL_REGIONS);

  const drillDown = (index: number) => setPath((prev) => [...prev, index]);
  const goBack = () => setPath((prev) => prev.slice(0, -1));

  const provRate = coverage.provincesTotal > 0 ? ((coverage.provinces / coverage.provincesTotal) * 100).toFixed(1) : "0";
  const cityRate = coverage.citiesTotal > 0 ? ((coverage.cities / coverage.citiesTotal) * 100).toFixed(1) : "0";
  const countyRate = coverage.countiesTotal > 0 ? ((coverage.counties / coverage.countiesTotal) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* 覆盖率指标卡片 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="info-card p-5">
          <p className="data-kicker">省级覆盖率</p>
          <h3 className="data-stat">{provRate}%</h3>
          <p className="data-substat">{coverage.provinces} / {coverage.provincesTotal} 个省级地区</p>
          <p className="data-note">已收录的省级财政预决算公开入口。</p>
          <p className="text-[0.7rem] text-[var(--color-muted)]">统计不含港澳台</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">市级覆盖率</p>
          <h3 className="data-stat">{cityRate}%</h3>
          <p className="data-substat">{coverage.cities} / {coverage.citiesTotal} 个地级市</p>
          <p className="data-note">已收录的地级市财政预决算公开入口。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">县级覆盖率</p>
          <h3 className="data-stat">{countyRate}%</h3>
          <p className="data-substat">{coverage.counties} / {coverage.countiesTotal} 个县级地区</p>
          <p className="data-note">已收录的县级财政预决算公开入口。</p>
        </article>
      </div>

    <article className="info-card p-4">
      {/* 标题行 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="section-title mb-0 border-b-0 pb-0">
          财政预决算导航
          <span className="section-sub">{label}</span>
        </h3>
        {path.length > 0 && (
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-3 py-1 text-[0.82rem] text-[var(--color-link)] hover:bg-[var(--color-surface)]"
            onClick={goBack}
          >
            ← 返回上级
          </button>
        )}
      </div>

      {/* 当前层级父节点链接 */}
      {parent && parent.url && (
        <a
          href={parent.url}
          target="_blank"
          rel="noreferrer"
          className="mb-3 block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.9rem] font-semibold hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
        >
          📄 {parent.name} 预决算公开页
        </a>
      )}

      {/* 地区网格 */}
      {items.length > 0 ? (
        <div className="grid grid-cols-5 gap-2">
          {items.map((node, i) => (
            <RegionItem
              key={node.name}
              node={node}
              index={i}
              hasChildren={(node.children?.length ?? 0) > 0}
              onDrill={drillDown}
              showCoverage={path.length === 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-6 text-center text-[0.86rem] text-[var(--color-muted)]">
          暂无下级地区数据
        </div>
      )}
    </article>
    </div>
  );
}
