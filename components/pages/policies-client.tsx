"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CelmaMajorEventTopic, CelmaPolicyCategoryLevel1, CelmaPolicyCategoryLevel2, CelmaPolicyDynamicItem } from "@/lib/types";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";

const LEVEL1_OPTIONS: CelmaPolicyCategoryLevel1[] = ["债券市场动态", "政策法规", "政策解读"];
const LEVEL2_OPTIONS: CelmaPolicyCategoryLevel2[] = ["重大事项", "预决算公开"];
const PAGE_SIZE_OPTIONS = [20, 50, 100];

const CATEGORY_COLORS: Record<CelmaPolicyCategoryLevel1, string> = {
  "债券市场动态": "#8B0000",
  "政策法规": "#2E7D32",
  "政策解读": "#1B4965",
};

const TOPIC_COLORS: Record<CelmaMajorEventTopic, string> = {
  "资金用途调整": "#8B0000",
  "跟踪评级": "#1B4965",
  "发行与披露": "#8B6914",
  "项目变更": "#6A4C93",
  "偿还与置换": "#C04000",
  "信息披露与更正": "#2E7D32",
  "债务限额": "#0D47A1",
  "隐性债务": "#B71C1C",
  "预决算与财政数据": "#4E342E",
  "人事变动": "#37474F",
  "其他": "#5F6B76",
};

export function PoliciesClient({ items }: { items: CelmaPolicyDynamicItem[] }) {
  const [query, setQuery] = useState("");
  const [categoryLevel1, setCategoryLevel1] = useState("");
  const [categoryLevel2, setCategoryLevel2] = useState("");
  const [region, setRegion] = useState("");
  const [topic, setTopic] = useState("");
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

  const typeScopedItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryLevel1 && item.category_level1 !== categoryLevel1) {
        return false;
      }

      if (categoryLevel1 === "债券市场动态" && categoryLevel2 && item.category_level2 !== categoryLevel2) {
        return false;
      }

      return true;
    });
  }, [items, categoryLevel1, categoryLevel2]);

  const regionOptions = useMemo(
    () => [...new Set(typeScopedItems.map((item) => item.region_normalized).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "zh-CN")),
    [typeScopedItems]
  );

  const topicOptions = useMemo(
    () => [...new Set(typeScopedItems.filter((item) => item.category_level2 === "重大事项").map((item) => item.topic).filter((value): value is CelmaMajorEventTopic => Boolean(value)))],
    [typeScopedItems]
  );

  useEffect(() => {
    if (region && !regionOptions.includes(region)) {
      setRegion("");
    }
  }, [region, regionOptions]);

  useEffect(() => {
    if (topic && !topicOptions.includes(topic as CelmaMajorEventTopic)) {
      setTopic("");
    }
  }, [topic, topicOptions]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.source,
        item.summary ?? "",
        item.snippet ?? "",
        item.category_level1,
        item.category_level2 ?? "",
        item.region_normalized ?? "",
        item.topic ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }

      if (categoryLevel1 && item.category_level1 !== categoryLevel1) {
        return false;
      }

      if (categoryLevel1 === "债券市场动态" && categoryLevel2 && item.category_level2 !== categoryLevel2) {
        return false;
      }

      if (region && item.region_normalized !== region) {
        return false;
      }

      if (topic && item.topic !== topic) {
        return false;
      }

      if (dateFrom && (!item.date || item.date < dateFrom)) {
        return false;
      }

      if (dateTo && (!item.date || item.date > dateTo)) {
        return false;
      }

      return true;
    });
  }, [items, query, categoryLevel1, categoryLevel2, region, topic, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);

  function resetPage() {
    setCurrentPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCategoryLevel1("");
    setCategoryLevel2("");
    setRegion("");
    setTopic("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  function handleLevel1Change(value: string) {
    setCategoryLevel1(value);
    if (value !== "债券市场动态") {
      setCategoryLevel2("");
    }
    resetPage();
  }

  const hasFilters = query || categoryLevel1 || categoryLevel2 || region || topic || dateFrom || dateTo;

  return (
    <div className="gov-search-container">
      <div className="gov-search-header">
        <h2 className="section-title">
          债券政策动态
          <span className="section-sub">限定抓取 CELMA 三个栏目，支持两层类型筛选</span>
        </h2>
        <div className="muted" style={{ marginTop: "0.3rem" }}>
          共 {items.length} 条记录 · 一级分类 3 项，其中债券市场动态仅保留重大事项与预决算公开
        </div>
      </div>

      <div className="gov-search-bar">
        <SearchFilter value={query} onChange={(value) => { setQuery(value); resetPage(); }} placeholder="搜索标题、来源或栏目关键词" />
      </div>

      <div className="gov-filter-area">
        <div className="gov-filter-row">
          <label className="gov-filter-label">一级类型</label>
          <SelectFilter value={categoryLevel1} onChange={handleLevel1Change} options={[...LEVEL1_OPTIONS]} allLabel="全部一级类型" />
          {categoryLevel1 === "债券市场动态" ? (
            <SelectFilter value={categoryLevel2} onChange={(value) => { setCategoryLevel2(value); resetPage(); }} options={[...LEVEL2_OPTIONS]} allLabel="全部二级类型" />
          ) : <SelectFilter value="" onChange={() => {}} options={[]} allLabel="全部二级类型" />}
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">地区筛选</label>
          <SelectFilter value={region} onChange={(value) => { setRegion(value); resetPage(); }} options={regionOptions} allLabel="全部地区" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">主题筛选</label>
          <SelectFilter value={topic} onChange={(value) => { setTopic(value); resetPage(); }} options={topicOptions} allLabel="全部主题" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">时间范围</label>
          <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); resetPage(); }} className="filter-shell" placeholder="起始日期" />
          <span className="gov-filter-sep">至</span>
          <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); resetPage(); }} className="filter-shell" placeholder="截止日期" />
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
          {/* 全部展开 / 全部收起 */}
          {filtered.length > 0 && (
            <span className="gov-expand-toggle">
              <button
                type="button"
                className={`gov-toggle-btn${expandMode === "all" ? " active" : ""}`}
                onClick={() => setExpandMode("all")}
              >
                全部展开
              </button>
              <span className="gov-filter-sep">/</span>
              <button
                type="button"
                className={`gov-toggle-btn${expandMode === "none" ? " active" : ""}`}
                onClick={() => setExpandMode("none")}
              >
                全部收起
              </button>
            </span>
          )}
          <label className="gov-page-size-label">
            每页
            <select
              className="filter-shell gov-page-size-select"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} 条</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* 结果列表或空状态 */}
      {filtered.length === 0 ? (
        <EmptyState message={hasFilters ? "当前筛选条件下暂无匹配结果，请调整筛选条件。" : "暂无债券政策动态数据。"} />
      ) : (
        <>
      <div className="flex flex-col gap-3">
        {pageItems.map((item) => {
          const expanded = isExpanded(item.id);
          return (
          <article key={item.id} className={`event-card${expanded ? " expanded" : ""}`}>
            <button
              type="button"
              className="event-card-header"
              onClick={() => toggleExpand(item.id)}
            >
              <span className="event-date">{item.date ?? "--"}</span>
              <span className="event-type-tag" style={{ background: CATEGORY_COLORS[item.category_level1], color: "#fff" }}>
                {item.category_level1}
              </span>
              <span className="event-title">{item.title}</span>
              <span className="event-toggle">›</span>
            </button>

            <div className="event-card-body">
              <div className="event-card-content">
                <div className="event-summary">{item.summary ?? item.snippet ?? "当前抓取保留列表页元数据，正文摘要暂未展开。"}</div>
                <div className="event-metrics">
                  <span className="metric-badge">{item.source}</span>
                  {item.category_level2 ? <span className="gov-badge gov-badge-policy">{item.category_level2}</span> : null}
                  {item.region_normalized ? <span className="gov-badge gov-badge-region">{item.region_normalized}</span> : null}
                  {item.topic ? (
                    <span
                      className="gov-badge"
                      style={{
                        background: `${TOPIC_COLORS[item.topic]}15`,
                        color: TOPIC_COLORS[item.topic],
                        borderColor: `${TOPIC_COLORS[item.topic]}40`,
                      }}
                    >
                      {item.topic}
                    </span>
                  ) : null}
                  {item.attachment_count > 0 ? <span className="metric-badge">附件 {item.attachment_count}</span> : null}
                </div>
                {item.local_attachment_folder ? <div className="gov-source-info">本地附件目录：{item.local_attachment_folder}</div> : null}
                <div className="event-sources">
                  <span>原文：</span>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    打开原文 ↗
                  </a>
                </div>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <nav className="gov-pagination" aria-label="分页导航">
          <button type="button" className="gov-page-btn" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
            ‹ 上一页
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 2)
            .reduce<(number | "...")[]>((pages, page, index, source) => {
              if (index > 0 && page - source[index - 1] > 1) {
                pages.push("...");
              }
              pages.push(page);
              return pages;
            }, [])
            .map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="gov-page-ellipsis">…</span>
              ) : (
                <button key={page} type="button" className={`gov-page-btn${page === safePage ? " active" : ""}`} onClick={() => setCurrentPage(page as number)}>
                  {page}
                </button>
              )
            )}
          <button type="button" className="gov-page-btn" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
            下一页 ›
          </button>
        </nav>
      ) : null}
        </>
      )}
    </div>
  );
}
