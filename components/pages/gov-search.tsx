"use client";

import { useMemo, useState, useCallback } from "react";
import type { GovSearchItem, ContentScope, GovDocType, LeaderRole, PolicySubType } from "@/lib/types";
import {
  GOV_SEARCH_TOPICS,
  GOV_DOC_TYPES,
  GOV_LEADER_ROLES,
  GOV_POLICY_SUB_TYPES,
  GOV_CONTENT_SCOPES,
} from "@/data/gov-search-data";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { uniqueValues } from "@/lib/utils";

/** 颜色映射：各标签类型对应不同色系 */
const DOC_TYPE_COLORS: Record<GovDocType, string> = {
  "领导活动": "#8B0000",
  "政策文件": "#2E7D32",
  "社会新闻": "#1B4965",
  "其他": "#6A4C93",
};

const SCOPE_COLORS: Record<ContentScope, string> = {
  "本地": "#8B6914",
  "上级": "#4A6FA5",
  "外地": "#888888",
  "全国": "#C04000",
};

const ADMIN_LEVEL_LABELS: Record<string, string> = {
  province: "省级",
  city: "地级市",
  county: "区县",
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function GovSearch({ items }: { items: GovSearchItem[] }) {
  /* ── 筛选状态 ── */
  const [query, setQuery] = useState("");
  const [siteRegion, setSiteRegion] = useState("");
  const [contentRegion, setContentRegion] = useState("");
  const [contentScope, setContentScope] = useState("");
  const [docType, setDocType] = useState("");          // 一级类型
  const [leaderRole, setLeaderRole] = useState("");    // 二级 —— 领导活动
  const [policySubType, setPolicySubType] = useState(""); // 二级 —— 政策文件
  const [topic, setTopic] = useState("");
  const [adminLevel, setAdminLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* ── 分页状态 ── */
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── 展开状态 ── */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandMode, setExpandMode] = useState<"default" | "all" | "none">("default");

  /* ── 从数据中提取唯一值 ── */
  const siteRegions = useMemo(() => uniqueValues(items.map((i) => i.siteRegion)), [items]);
  const contentRegions = useMemo(() => uniqueValues(items.map((i) => i.contentRegion)), [items]);
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.topics.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  /* ── 筛选逻辑 ── */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (query) {
        const q = query.toLowerCase();
        const haystack = [
          item.title, item.summary, item.siteName,
          item.siteRegion, item.contentRegion,
          ...item.topics,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (siteRegion && item.siteRegion !== siteRegion) return false;
      if (contentRegion && item.contentRegion !== contentRegion) return false;
      if (contentScope && item.contentScope !== contentScope) return false;
      if (docType && item.docType !== docType) return false;
      if (leaderRole && item.leaderRole !== leaderRole) return false;
      if (policySubType && item.policySubType !== policySubType) return false;
      if (topic && !item.topics.includes(topic)) return false;
      if (adminLevel && item.adminLevel !== adminLevel) return false;
      if (dateFrom && item.publishedAt < dateFrom) return false;
      if (dateTo && item.publishedAt > dateTo) return false;
      return true;
    });
  }, [items, query, siteRegion, contentRegion, contentScope, docType, leaderRole, policySubType, topic, adminLevel, dateFrom, dateTo]);

  /* ── 分页计算 ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  /* ── 展开/收起判断 ── */
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

  /* ── 筛选辅助 ── */
  const hasFilters = query || siteRegion || contentRegion || contentScope || docType || leaderRole || policySubType || topic || adminLevel || dateFrom || dateTo;

  function clearFilters() {
    setQuery(""); setSiteRegion(""); setContentRegion(""); setContentScope("");
    setDocType(""); setLeaderRole(""); setPolicySubType(""); setTopic("");
    setAdminLevel(""); setDateFrom(""); setDateTo("");
  }

  /** 一级类型变更时，清空对应二级 */
  function handleDocTypeChange(val: string) {
    setDocType(val);
    setLeaderRole("");
    setPolicySubType("");
    setCurrentPage(1);
  }

  /** 任何筛选变更时重置页码 */
  function resetPage() { setCurrentPage(1); }

  return (
    <div className="gov-search-container">
      {/* 页面标题 */}
      <div className="gov-search-header">
        <h2 className="section-title">
          政府官网政策与动态检索
          <span className="section-sub">基于真实政府门户网站数据</span>
        </h2>
        <div className="muted" style={{ marginTop: "0.3rem" }}>
          共 {items.length} 条记录 · 覆盖 {siteRegions.length} 个地区
        </div>
      </div>

      {/* 搜索框 */}
      <div className="gov-search-bar">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); resetPage(); }}
          placeholder='请输入关键词，如"人工智能""书记调研""低空经济"'
          className="search-shell gov-search-input"
        />
      </div>

      {/* 筛选区域 */}
      <div className="gov-filter-area">
        {/* 地区筛选 */}
        <div className="gov-filter-row">
          <label className="gov-filter-label">地区筛选</label>
          <SelectFilter value={siteRegion} onChange={(v) => { setSiteRegion(v); resetPage(); }} options={siteRegions} allLabel="全部发布地区" />
          <SelectFilter value={contentRegion} onChange={(v) => { setContentRegion(v); resetPage(); }} options={contentRegions} allLabel="全部内容地区" />
          <SelectFilter value={contentScope} onChange={(v) => { setContentScope(v); resetPage(); }} options={GOV_CONTENT_SCOPES} allLabel="全部内容范围" />
          <SelectFilter value={adminLevel} onChange={(v) => { setAdminLevel(v); resetPage(); }} options={["province", "city", "county"]} allLabel="全部层级" />
        </div>

        {/* 类型筛选 —— 两级结构 */}
        <div className="gov-filter-row">
          <label className="gov-filter-label">类型筛选</label>
          <SelectFilter value={docType} onChange={handleDocTypeChange} options={[...GOV_DOC_TYPES]} allLabel="全部类型" />
          {docType === "领导活动" && (
            <SelectFilter
              value={leaderRole}
              onChange={(v) => { setLeaderRole(v); resetPage(); }}
              options={GOV_LEADER_ROLES.filter((r) => r !== "无")}
              allLabel="全部领导职务"
            />
          )}
          {docType === "政策文件" && (
            <SelectFilter
              value={policySubType}
              onChange={(v) => { setPolicySubType(v); resetPage(); }}
              options={[...GOV_POLICY_SUB_TYPES]}
              allLabel="全部政策类别"
            />
          )}
        </div>

        {/* 主题筛选 */}
        <div className="gov-filter-row">
          <label className="gov-filter-label">主题筛选</label>
          <SelectFilter value={topic} onChange={(v) => { setTopic(v); resetPage(); }} options={allTopics} allLabel="全部主题" />
        </div>

        {/* 时间范围 */}
        <div className="gov-filter-row">
          <label className="gov-filter-label">时间范围</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
            className="filter-shell"
            placeholder="起始日期"
          />
          <span className="gov-filter-sep">至</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
            className="filter-shell"
            placeholder="截止日期"
          />
        </div>

        {hasFilters && (
          <div className="gov-filter-row">
            <button type="button" className="gov-clear-btn" onClick={() => { clearFilters(); resetPage(); }}>
              清除全部筛选
            </button>
          </div>
        )}
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

          {/* 每页条数 */}
          <label className="gov-page-size-label">
            每页
            <select
              className="filter-shell gov-page-size-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} 条</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* 结果列表或空状态 */}
      {filtered.length === 0 ? (
        <EmptyState message={hasFilters ? "当前筛选条件下暂无匹配结果，请调整筛选条件。" : "暂无政府官网检索数据。"} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pageItems.map((item) => {
              const expanded = isExpanded(item.id);
              return (
                <article key={item.id} className={`event-card ${expanded ? "expanded" : ""}`}>
                  <button
                    type="button"
                    className="event-card-header"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <span className="event-date">{item.publishedAt}</span>
                    <span
                      className="event-type-tag"
                      style={{ background: DOC_TYPE_COLORS[item.docType], color: "#fff" }}
                    >
                      {item.docType}
                    </span>
                    <span className="event-title">{item.title}</span>
                    <span className="event-toggle">›</span>
                  </button>

                  <div className="event-card-body">
                    <div className="event-card-content">
                      <div className="event-summary">{item.summary}</div>

                      <div className="event-metrics" style={{ marginTop: "0.6rem" }}>
                        <span className="gov-badge gov-badge-region">{item.siteRegion}</span>
                        {item.contentRegion !== item.siteRegion && (
                          <span className="gov-badge gov-badge-region">{item.contentRegion}</span>
                        )}
                        <span
                          className="gov-badge"
                          style={{
                            background: `${SCOPE_COLORS[item.contentScope]}15`,
                            color: SCOPE_COLORS[item.contentScope],
                            borderColor: `${SCOPE_COLORS[item.contentScope]}40`,
                          }}
                        >
                          {item.contentScope}
                        </span>
                        <span className="gov-badge gov-badge-level">
                          {ADMIN_LEVEL_LABELS[item.adminLevel] || item.adminLevel}
                        </span>
                        {item.leaderRole !== "无" && (
                          <span className="gov-badge gov-badge-leader">{item.leaderRole}</span>
                        )}
                        {item.policySubType && (
                          <span className="gov-badge gov-badge-policy">{item.policySubType}</span>
                        )}
                        {item.topics.map((t, idx) => (
                          <span key={`${t}-${idx}`} className="metric-badge">{t}</span>
                        ))}
                      </div>

                      <div className="gov-source-info">
                        <span>来源：{item.siteName}</span>
                        <span className="gov-source-sep">·</span>
                        <span>发布时间：{item.publishedAt}</span>
                      </div>

                      <div className="event-sources">
                        <span>查看原文：</span>
                        <a href={item.articleUrl || item.url} target="_blank" rel="noreferrer">
                          {item.title} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <nav className="gov-pagination" aria-label="分页导航">
              <button
                type="button"
                className="gov-page-btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
              >
                ‹ 上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="gov-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`gov-page-btn${p === safePage ? " active" : ""}`}
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                type="button"
                className="gov-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
              >
                下一页 ›
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
