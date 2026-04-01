"use client";

import { useMemo, useState } from "react";
import { PaperItem } from "@/lib/types";
import { uniqueValues } from "@/lib/utils";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { EmptyState } from "@/components/ui/empty-state";

export function PapersClient({ items }: { items: PaperItem[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [openId, setOpenId] = useState(items[0]?.id ?? "");

  const years = useMemo(() => uniqueValues(items.map((item) => String(item.year))).reverse(), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.venue, item.abstract, ...item.authors, ...item.keywords].join(" ").toLowerCase();
      return (!query || haystack.includes(query.toLowerCase())) && (!year || String(item.year) === year);
    });
  }, [items, query, year]);

  if (filtered.length === 0) {
    return (
      <>
        <div className="lit-toolbar">
          <div className="lit-filters">
            <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、作者、机构、关键词或摘要" />
            <SelectFilter value={year} onChange={setYear} options={years} allLabel="全部年份" />
          </div>
        </div>
        <EmptyState message="暂无符合条件的文献数据。" />
      </>
    );
  }

  return (
    <>
      <div className="lit-toolbar">
        <div className="lit-filters">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、作者、机构、关键词或摘要" />
          <SelectFilter value={year} onChange={setYear} options={years} allLabel="全部年份" />
        </div>
        <div className="muted">共 {filtered.length} 条，支持按年份筛选</div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const expanded = openId === item.id;
          return (
            <article key={item.id} className={`paper-card ${expanded ? "expanded" : ""}`}>
              <button type="button" className="paper-card-header" onClick={() => setOpenId(expanded ? "" : item.id)}>
                <span className="paper-year">{item.year}</span>
                <span className="paper-tier-tag" style={{ color: "#8B0000", border: "1px solid #8B0000", background: "transparent" }}>
                  {item.source}
                </span>
                <span className="paper-title">{item.title}</span>
                <span className="paper-toggle">›</span>
              </button>

              <div className="paper-card-body">
                <div className="paper-card-content">
                  <div className="paper-authors">{item.authors.join("；")}</div>
                  <div className="paper-journal">{item.venue}</div>
                  <div className="paper-abstract">{item.abstract}</div>
                  <div className="paper-topics">
                    {item.keywords.map((keyword) => (
                      <span key={keyword} className="topic-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="paper-doi">
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
