"use client";

import { useState } from "react";

/**
 * 通用的"地区 → 链接"层级导航组件。
 *
 * 设计思路与 `website-budget-nav.tsx` / `website-gov-nav.tsx` 保持一致：
 * - 三级下钻：省 → 市 → 区县
 * - 有链接：蓝色边框可点击外链
 * - 无链接：灰色虚线，标记为"待补充"
 * - 顶部三张覆盖率卡片（省 / 市 / 县）
 *
 * 为"地区要闻""地区政策""惠企政策"三类新增导航共用，避免代码重复。
 */

export interface RegionLinkNode {
  name: string;
  url: string;
  leaderCollections?: Array<{
    label: string;
    url: string;
  }>;
  children?: RegionLinkNode[];
}

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

/** 不纳入县级统计的地区（林业局管辖区等） */
const EXCLUDED_COUNTIES = new Set(["加格达奇区", "松岭区", "新林区", "呼中区"]);

/** 统计时排除的省级地区 */
const EXCLUDED_PROVINCES = new Set(["香港特别行政区", "澳门特别行政区", "台湾省"]);

function countGlobalCoverage(nodes: RegionLinkNode[]) {
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
        if (EXCLUDED_COUNTIES.has(county.name)) continue;
        countiesTotal++;
        if (county.url) counties++;
      }
    }
  }
  return { provinces, provincesTotal, cities, citiesTotal, counties, countiesTotal };
}

function countNodeCoverage(node: RegionLinkNode) {
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
      if (EXCLUDED_COUNTIES.has(county.name)) continue;
      countiesTotal++;
      if (county.url) counties++;
    }
  }
  return { cities, citiesTotal, counties, countiesTotal, isMunicipality };
}

function resolveLevel(regions: RegionLinkNode[], path: number[]): {
  label: string;
  items: RegionLinkNode[];
  parent: RegionLinkNode | null;
} {
  if (path.length === 0) {
    return { label: "省级地区", items: regions, parent: null };
  }

  let current: RegionLinkNode[] = regions;
  let node: RegionLinkNode | null = null;

  for (const idx of path) {
    node = current[idx];
    current = node?.children ?? [];
  }

  if (!node) {
    return { label: "省级地区", items: regions, parent: null };
  }

  const isMuni = path.length >= 1 && MUNICIPALITIES.has(regions[path[0]]?.name);
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
  node: RegionLinkNode;
  index: number;
  hasChildren: boolean;
  onDrill: (index: number) => void;
  showCoverage?: boolean;
}) {
  const hasUrl = node.url.length > 0;

  let coverageLabel: string | null = null;
  if (showCoverage && hasChildren) {
    const { cities, citiesTotal, counties, countiesTotal, isMunicipality } = countNodeCoverage(node);
    const parts: string[] = [];
    if (citiesTotal > 0) parts.push(`${isMunicipality ? "区" : "市"} ${cities}/${citiesTotal}`);
    if (countiesTotal > 0) parts.push(`县 ${counties}/${countiesTotal}`);
    coverageLabel = parts.length > 0 ? parts.join(" · ") : null;
  }

  if (hasChildren) {
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

  return (
    <span className="block rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] leading-tight text-[var(--color-muted)]">
      {node.name}
    </span>
  );
}

export interface RegionLinkNavProps {
  regions: RegionLinkNode[];
  /** 面板主标题，如"地区要闻导航" */
  title: string;
  /** 父节点链接标签前缀 + emoji，如"📰 {name} 本地要闻栏目" */
  parentLinkLabel: (name: string) => string;
  /** 覆盖率卡片 note 文案（默认统一提示） */
  coverageNote?: string;
}

export function RegionLinkNav({ regions, title, parentLinkLabel, coverageNote }: RegionLinkNavProps) {
  const [path, setPath] = useState<number[]>([]);
  const { label, items, parent } = resolveLevel(regions, path);
  const coverage = countGlobalCoverage(regions);

  const drillDown = (index: number) => setPath((prev) => [...prev, index]);
  const goBack = () => setPath((prev) => prev.slice(0, -1));

  const provRate = coverage.provincesTotal > 0 ? ((coverage.provinces / coverage.provincesTotal) * 100).toFixed(1) : "0";
  const cityRate = coverage.citiesTotal > 0 ? ((coverage.cities / coverage.citiesTotal) * 100).toFixed(1) : "0";
  const countyRate = coverage.countiesTotal > 0 ? ((coverage.counties / coverage.countiesTotal) * 100).toFixed(1) : "0";
  const note = coverageNote ?? "统计不含港澳台。";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="info-card p-5">
          <p className="data-kicker">省级覆盖率</p>
          <h3 className="data-stat">{provRate}%</h3>
          <p className="data-substat">{coverage.provinces} / {coverage.provincesTotal} 个省区市</p>
          <p className="data-note">{note}</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">市级覆盖率</p>
          <h3 className="data-stat">{cityRate}%</h3>
          <p className="data-substat">{coverage.cities} / {coverage.citiesTotal} 个地市州</p>
          <p className="data-note">{note}</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">县级覆盖率</p>
          <h3 className="data-stat">{countyRate}%</h3>
          <p className="data-substat">{coverage.counties} / {coverage.countiesTotal} 个区县</p>
          <p className="data-note">{note}</p>
        </article>
      </div>

      <article className="info-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="section-title mb-0 border-b-0 pb-0">
            {title}
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

        {parent && (parent.url || (parent.leaderCollections?.length ?? 0) > 0) && (
          <div className="mb-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            {parent.url ? (
              <a
                href={parent.url}
                target="_blank"
                rel="noreferrer"
                className="block text-[0.9rem] font-semibold hover:text-[var(--color-link)]"
              >
                {parentLinkLabel(parent.name)}
              </a>
            ) : (
              <div className="text-[0.9rem] font-semibold text-[var(--color-ink)]">
                {parentLinkLabel(parent.name)}
              </div>
            )}

            {(parent.leaderCollections?.length ?? 0) > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {parent.leaderCollections?.map((item) =>
                  item.url ? (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-[var(--color-border)] bg-white px-3 py-2 text-center text-[0.82rem] font-medium text-[var(--color-link)] transition hover:border-[var(--color-link)]"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span
                      key={item.label}
                      className="rounded border border-dashed border-[var(--color-border)] bg-white px-3 py-2 text-center text-[0.82rem] text-[var(--color-muted)]"
                    >
                      {item.label}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        )}

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
