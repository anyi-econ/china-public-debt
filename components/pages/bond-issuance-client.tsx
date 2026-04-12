"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CelmaBondIssuanceCategory, CelmaBondIssuanceItem } from "@/lib/types";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORY_OPTIONS: CelmaBondIssuanceCategory[] = ["发行安排", "发行前公告", "发行结果"];
const PAGE_SIZE_OPTIONS = [20, 50, 100];

const CATEGORY_COLORS: Record<CelmaBondIssuanceCategory, string> = {
  "发行安排": "#1B4965",
  "发行前公告": "#8B0000",
  "发行结果": "#2E7D32",
};

export function BondIssuanceClient({ items }: { items: CelmaBondIssuanceItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── 展开状态 ── */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandMode, setExpandMode] = useState<"default" | "all" | "none">("default");

  const isExpanded = useCallback(
    (id: string) => {
      if (expandMode === "all") return true;
      if (expandMode === "none") return false;
      return expandedIds.has(id);
    },
    [expandMode, expandedIds],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandMode("default");
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  /* ── 根据栏目筛选后可用的地区选项 ── */
  const scopedItems = useMemo(() => {
    if (!category) return items;
    return items.filter((item) => item.category === category);
  }, [items, category]);

  const regionOptions = useMemo(
    () =>
      [...new Set(scopedItems.map((item) => item.region).filter((v): v is string => Boolean(v)))].sort((a, b) =>
        a.localeCompare(b, "zh-CN"),
      ),
    [scopedItems],
  );

  useEffect(() => {
    if (region && !regionOptions.includes(region)) {
      setRegion("");
    }
  }, [region, regionOptions]);

  /* ── 全量筛选 ── */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.source, item.category, item.region ?? ""].join(" ").toLowerCase();

      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (category && item.category !== category) return false;
      if (region && item.region !== region) return false;
      if (dateFrom && (!item.date || item.date < dateFrom)) return false;
      if (dateTo && (!item.date || item.date > dateTo)) return false;

      return true;
    });
  }, [items, query, category, region, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);

  function resetPage() {
    setCurrentPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setRegion("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  const hasFilters = query || category || region || dateFrom || dateTo;

  return (
    <div className="gov-search-container">
      <div className="gov-search-header">
        <h2 className="section-title">
          债券发行动态
          <span className="section-sub">抓取 CELMA 发行安排、发行前公告、发行结果三个栏目</span>
        </h2>
        <div className="muted" style={{ marginTop: "0.3rem" }}>
          共 {items.length} 条记录 · 栏目 {CATEGORY_OPTIONS.length} 个
        </div>
      </div>

      <div className="gov-search-bar">
        <SearchFilter value={query} onChange={(v) => { setQuery(v); resetPage(); }} placeholder="搜索标题、来源或地区关键词" />
      </div>

      <div className="gov-filter-area">
        <div className="gov-filter-row">
          <label className="gov-filter-label">栏目筛选</label>
          <SelectFilter value={category} onChange={(v) => { setCategory(v); resetPage(); }} options={[...CATEGORY_OPTIONS]} allLabel="全部栏目" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">地区筛选</label>
          <SelectFilter value={region} onChange={(v) => { setRegion(v); resetPage(); }} options={regionOptions} allLabel="全部地区" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">时间范围</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); resetPage(); }} className="filter-shell" placeholder="起始日期" />
          <span className="gov-filter-sep">至</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); resetPage(); }} className="filter-shell" placeholder="截止日期" />
        </div>
        {hasFilters ? (
          <div className="gov-filter-row">
            <button type="button" className="gov-clear-btn" onClick={clearFilters}>
              清除全部筛选
            </button>
          </div>
        ) : null}
      </div>

      {/* 结果计数 + 每页条数 + 全局展开/收起 */}
      <div className="gov-result-toolbar">
        <span className="gov-result-count">
          {filtered.length === 0
            ? "无匹配结果"
            : `找到 ${filtered.length} 条结果${hasFilters ? "（已筛选）" : ""}`}
        </span>
        <div className="gov-toolbar-right">
          {filtered.length > 0 && (
            <span className="gov-expand-toggle">
              <button type="button" className={`gov-toggle-btn${expandMode === "all" ? " active" : ""}`} onClick={() => setExpandMode("all")}>全部展开</button>
              <span className="gov-filter-sep">/</span>
              <button type="button" className={`gov-toggle-btn${expandMode === "none" ? " active" : ""}`} onClick={() => setExpandMode("none")}>全部收起</button>
            </span>
          )}
          <label className="gov-page-size-label">
            每页
            <select className="filter-shell gov-page-size-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} 条</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* 结果列表 */}
      {filtered.length === 0 ? (
        <EmptyState message={hasFilters ? "当前筛选条件下暂无匹配结果，请调整筛选条件。" : "暂无债券发行动态数据。"} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pageItems.map((item) => {
              const expanded = isExpanded(item.id);
              return (
                <article key={item.id} className={`event-card${expanded ? " expanded" : ""}`}>
                  <button type="button" className="event-card-header" onClick={() => toggleExpand(item.id)}>
                    <span className="event-date">{item.date ?? "--"}</span>
                    <span className="event-type-tag" style={{ background: CATEGORY_COLORS[item.category], color: "#fff" }}>{item.category}</span>
                    <span className="event-title">{item.title}</span>
                    <span className="event-toggle">›</span>
                  </button>

                  <div className="event-card-body">
                    <div className="event-card-content">
                      <div className="event-metrics">
                        <span className="metric-badge">{item.source}</span>
                        {item.region ? <span className="gov-badge gov-badge-region">{item.region}</span> : null}
                        <span className="gov-badge gov-badge-policy">{item.category}</span>
                        {item.attachment_count > 0 ? <span className="metric-badge">附件 {item.attachment_count}</span> : null}
                      </div>
                      <div className="event-sources">
                        <span>原文：</span>
                        <a href={item.url} target="_blank" rel="noreferrer">打开原文 ↗</a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <nav className="gov-pagination" aria-label="分页导航">
              <button type="button" className="gov-page-btn" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>‹ 上一页</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce<(number | "...")[]>((acc, p, i, src) => {
                  if (i > 0 && p - src[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="gov-page-ellipsis">…</span>
                  ) : (
                    <button key={p} type="button" className={`gov-page-btn${p === safePage ? " active" : ""}`} onClick={() => setCurrentPage(p as number)}>{p}</button>
                  ),
                )}
              <button type="button" className="gov-page-btn" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>下一页 ›</button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
