"use client";

import { useMemo, useState } from "react";
import type { CelmaPolicyCategoryLevel1, CelmaPolicyCategoryLevel2, CelmaPolicyDynamicItem } from "@/lib/types";
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

export function PoliciesClient({ items }: { items: CelmaPolicyDynamicItem[] }) {
  const [query, setQuery] = useState("");
  const [categoryLevel1, setCategoryLevel1] = useState("");
  const [categoryLevel2, setCategoryLevel2] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.source, item.summary ?? "", item.snippet ?? "", item.category_level1, item.category_level2 ?? ""]
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

      return true;
    });
  }, [items, query, categoryLevel1, categoryLevel2]);

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
    setCurrentPage(1);
  }

  function handleLevel1Change(value: string) {
    setCategoryLevel1(value);
    if (value !== "债券市场动态") {
      setCategoryLevel2("");
    }
    resetPage();
  }

  const hasFilters = query || categoryLevel1 || categoryLevel2;

  if (filtered.length === 0) {
    return (
      <div className="gov-search-container">
        <div className="gov-search-header">
          <h2 className="section-title">
            债券政策动态
            <span className="section-sub">限定抓取 CELMA 三个栏目，支持两层类型筛选</span>
          </h2>
          <div className="muted" style={{ marginTop: "0.3rem" }}>
            共 {items.length} 条记录 · 当前无匹配结果
          </div>
        </div>

        <div className="gov-search-bar">
          <SearchFilter value={query} onChange={(value) => { setQuery(value); resetPage(); }} placeholder="搜索标题、来源或栏目关键词" />
        </div>

        <div className="gov-filter-area">
          <div className="gov-filter-row">
            <label className="gov-filter-label">类型筛选</label>
            <SelectFilter value={categoryLevel1} onChange={handleLevel1Change} options={[...LEVEL1_OPTIONS]} allLabel="全部一级类型" />
            {categoryLevel1 === "债券市场动态" ? (
              <SelectFilter value={categoryLevel2} onChange={(value) => { setCategoryLevel2(value); resetPage(); }} options={[...LEVEL2_OPTIONS]} allLabel="全部二级类型" />
            ) : null}
          </div>
          {hasFilters ? (
            <div className="gov-filter-row">
              <button type="button" className="gov-clear-btn" onClick={clearFilters}>
                清除全部筛选
              </button>
            </div>
          ) : null}
        </div>

        <EmptyState message="当前筛选条件下暂无债券政策动态。" />
      </div>
    );
  }

  return (
    <div className="gov-search-container">
      <div className="gov-search-header">
        <h2 className="section-title">
          债券政策动态
          <span className="section-sub">来源限定为中国地方政府债券信息公开平台 CELMA</span>
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
          ) : null}
        </div>
        {hasFilters ? (
          <div className="gov-filter-row">
            <button type="button" className="gov-clear-btn" onClick={clearFilters}>
              清除全部筛选
            </button>
          </div>
        ) : null}
      </div>

      <div className="gov-result-toolbar">
        <span className="gov-result-count">找到 {filtered.length} 条结果{hasFilters ? "（已筛选）" : ""}</span>
        <div className="gov-toolbar-right">
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

      <div className="flex flex-col gap-3">
        {pageItems.map((item) => (
          <article key={item.id} className="event-card expanded">
            <div className="event-card-header cursor-default">
              <span className="event-date">{item.date ?? "--"}</span>
              <span className="event-type-tag" style={{ background: CATEGORY_COLORS[item.category_level1], color: "#fff" }}>
                {item.category_level1}
              </span>
              <span className="event-title">{item.title}</span>
            </div>

            <div className="event-card-body" style={{ maxHeight: "320px" }}>
              <div className="event-card-content">
                <div className="event-summary">{item.summary ?? item.snippet ?? "当前抓取保留列表页元数据，正文摘要暂未展开。"}</div>
                <div className="event-metrics">
                  <span className="metric-badge">{item.source}</span>
                  {item.category_level2 ? <span className="gov-badge gov-badge-policy">{item.category_level2}</span> : null}
                </div>
                <div className="event-sources">
                  <span>原文：</span>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    打开原文 ↗
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
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
    </div>
  );
}
