"use client";

import { useMemo, useState } from "react";
import { NewsItem } from "@/lib/types";
import { uniqueValues } from "@/lib/utils";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";

export function NewsClient({ items }: { items: NewsItem[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [month, setMonth] = useState("");
  const [openId, setOpenId] = useState(items[0]?.id ?? "");

  const sources = useMemo(() => uniqueValues(items.map((item) => item.source)), [items]);
  const months = useMemo(() => uniqueValues(items.map((item) => item.date.slice(0, 7))).reverse(), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.source, item.summary, ...item.tags].join(" ").toLowerCase();
      return (!query || haystack.includes(query.toLowerCase())) && (!source || item.source === source) && (!month || item.date.startsWith(month));
    });
  }, [items, query, source, month]);

  if (filtered.length === 0) {
    return (
      <>
        <div className="lit-toolbar">
          <div className="lit-filters">
            <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、来源、标签或摘要" />
            <SelectFilter value={source} onChange={setSource} options={sources} allLabel="全部来源" />
            <SelectFilter value={month} onChange={setMonth} options={months} allLabel="全部时间" />
          </div>
        </div>
        <EmptyState message="当前暂无符合条件的新闻与讨论数据。" />
      </>
    );
  }

  return (
    <>
      <div className="lit-toolbar">
        <div className="lit-filters">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、来源、标签或摘要" />
          <SelectFilter value={source} onChange={setSource} options={sources} allLabel="全部来源" />
          <SelectFilter value={month} onChange={setMonth} options={months} allLabel="全部时间" />
        </div>
        <div className="muted">共 {filtered.length} 条，支持按时间筛选</div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const expanded = openId === item.id;
          return (
            <article key={item.id} className={`event-card ${expanded ? "expanded" : ""}`}>
              <button type="button" className="event-card-header" onClick={() => setOpenId(expanded ? "" : item.id)}>
                <span className="event-date">{item.date.slice(5)}</span>
                <span className="event-type-tag" style={{ background: "#1B4965", color: "#fff" }}>
                  新闻
                </span>
                <span className="event-title">{item.title}</span>
                <span className="event-toggle">›</span>
              </button>

              <div className="event-card-body">
                <div className="event-card-content">
                  <div className="event-summary">{item.summary}</div>
                  <div className="event-metrics">
                    <span className="metric-badge">{item.source}</span>
                    {item.tags.map((tag) => (
                      <span key={tag} className="metric-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="event-sources">
                    <span>链接：</span>
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
    </>
  );
}
