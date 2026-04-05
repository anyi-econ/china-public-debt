"use client";

import { useMemo, useState } from "react";
import type { GovSearchItem, ContentScope, GovDocType, LeaderRole } from "@/lib/types";
import {
  GOV_SEARCH_TOPICS,
  GOV_DOC_TYPES,
  GOV_LEADER_ROLES,
  GOV_CONTENT_SCOPES,
} from "@/data/gov-search-data";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { uniqueValues } from "@/lib/utils";

/** 颜色映射：各标签类型对应不同色系 */
const DOC_TYPE_COLORS: Record<GovDocType, string> = {
  "领导活动": "#8B0000",
  "其他新闻": "#1B4965",
  "产业政策文件": "#2E7D32",
  "其他政策文件": "#6A4C93",
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

export function GovSearch({ items }: { items: GovSearchItem[] }) {
  // 筛选状态
  const [query, setQuery] = useState("");
  const [siteRegion, setSiteRegion] = useState("");
  const [contentRegion, setContentRegion] = useState("");
  const [contentScope, setContentScope] = useState("");
  const [docType, setDocType] = useState("");
  const [leaderRole, setLeaderRole] = useState("");
  const [topic, setTopic] = useState("");
  const [adminLevel, setAdminLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // 展开状态
  const [expandedId, setExpandedId] = useState("");

  // 从数据中提取唯一值用于筛选器
  const siteRegions = useMemo(() => uniqueValues(items.map((i) => i.siteRegion)), [items]);
  const contentRegions = useMemo(() => uniqueValues(items.map((i) => i.contentRegion)), [items]);
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.topics.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);
  const siteNames = useMemo(() => uniqueValues(items.map((i) => i.siteName)), [items]);

  // 筛选逻辑
  const filtered = useMemo(() => {
    return items.filter((item) => {
      // 关键词搜索：搜标题、摘要、站点名、地区、主题
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
      if (topic && !item.topics.includes(topic)) return false;
      if (adminLevel && item.adminLevel !== adminLevel) return false;
      if (dateFrom && item.publishedAt < dateFrom) return false;
      if (dateTo && item.publishedAt > dateTo) return false;
      return true;
    });
  }, [items, query, siteRegion, contentRegion, contentScope, docType, leaderRole, topic, adminLevel, dateFrom, dateTo]);

  const hasFilters = query || siteRegion || contentRegion || contentScope || docType || leaderRole || topic || adminLevel || dateFrom || dateTo;

  function clearFilters() {
    setQuery(""); setSiteRegion(""); setContentRegion(""); setContentScope("");
    setDocType(""); setLeaderRole(""); setTopic(""); setAdminLevel("");
    setDateFrom(""); setDateTo("");
  }

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
          onChange={(e) => setQuery(e.target.value)}
          placeholder='请输入关键词，如"人工智能""书记调研""低空经济"'
          className="search-shell gov-search-input"
        />
      </div>

      {/* 筛选区域 */}
      <div className="gov-filter-area">
        <div className="gov-filter-row">
          <label className="gov-filter-label">地区筛选</label>
          <SelectFilter value={siteRegion} onChange={setSiteRegion} options={siteRegions} allLabel="全部发布地区" />
          <SelectFilter value={contentRegion} onChange={setContentRegion} options={contentRegions} allLabel="全部内容地区" />
          <SelectFilter value={contentScope} onChange={setContentScope} options={GOV_CONTENT_SCOPES} allLabel="全部内容范围" />
          <SelectFilter value={adminLevel} onChange={setAdminLevel} options={["province", "city", "county"]} allLabel="全部层级" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">类型筛选</label>
          <SelectFilter value={docType} onChange={setDocType} options={[...GOV_DOC_TYPES]} allLabel="全部类型" />
          <SelectFilter value={leaderRole} onChange={setLeaderRole} options={[...GOV_LEADER_ROLES]} allLabel="全部领导身份" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">主题筛选</label>
          <SelectFilter value={topic} onChange={setTopic} options={allTopics} allLabel="全部主题" />
        </div>
        <div className="gov-filter-row">
          <label className="gov-filter-label">时间范围</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="filter-shell"
            placeholder="起始日期"
          />
          <span className="gov-filter-sep">至</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="filter-shell"
            placeholder="截止日期"
          />
        </div>
        {hasFilters && (
          <div className="gov-filter-row">
            <button type="button" className="gov-clear-btn" onClick={clearFilters}>
              清除全部筛选
            </button>
          </div>
        )}
      </div>

      {/* 结果计数 */}
      <div className="gov-result-count">
        {filtered.length === 0 ? (
          <span>无匹配结果</span>
        ) : (
          <span>找到 {filtered.length} 条结果{hasFilters ? "（已筛选）" : ""}</span>
        )}
      </div>

      {/* 结果列表或空状态 */}
      {filtered.length === 0 ? (
        <EmptyState message={hasFilters ? "当前筛选条件下暂无匹配结果，请调整筛选条件。" : "暂无政府官网检索数据。"} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <article key={item.id} className={`event-card ${expanded ? "expanded" : ""}`}>
                <button
                  type="button"
                  className="event-card-header"
                  onClick={() => setExpandedId(expanded ? "" : item.id)}
                >
                  <span className="event-date">{item.publishedAt.slice(5)}</span>
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
                    {/* 摘要 */}
                    <div className="event-summary">{item.summary}</div>

                    {/* 标签区 */}
                    <div className="event-metrics" style={{ marginTop: "0.6rem" }}>
                      {/* 发布地区 */}
                      <span className="gov-badge gov-badge-region">{item.siteRegion}</span>
                      {/* 内容地区 */}
                      {item.contentRegion !== item.siteRegion && (
                        <span className="gov-badge gov-badge-region">{item.contentRegion}</span>
                      )}
                      {/* 内容范围 */}
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
                      {/* 层级 */}
                      <span className="gov-badge gov-badge-level">
                        {ADMIN_LEVEL_LABELS[item.adminLevel] || item.adminLevel}
                      </span>
                      {/* 领导身份 */}
                      {item.leaderRole !== "无" && (
                        <span className="gov-badge gov-badge-leader">{item.leaderRole}</span>
                      )}
                      {/* 主题标签 */}
                      {item.topics.map((t) => (
                        <span key={t} className="metric-badge">{t}</span>
                      ))}
                    </div>

                    {/* 来源信息 */}
                    <div className="gov-source-info">
                      <span>来源：{item.siteName}</span>
                      <span className="gov-source-sep">·</span>
                      <span>发布时间：{item.publishedAt}</span>
                    </div>

                    {/* 原文链接 */}
                    <div className="event-sources">
                      <span>访问官网：</span>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.siteName} ↗
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
