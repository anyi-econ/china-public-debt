"use client";

import { useMemo, useState } from "react";
import { NewsItem } from "@/lib/types";
import { formatDate, uniqueValues } from "@/lib/utils";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/ui/empty-state";

export function NewsClient({ items }: { items: NewsItem[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");

  const sources = useMemo(() => uniqueValues(items.map((item) => item.source)), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.source, item.summary, ...item.tags].join(" ").toLowerCase();
      return (!query || haystack.includes(query.toLowerCase())) && (!source || item.source === source);
    });
  }, [items, query, source]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、来源、标签或摘要" />
        </div>
        <SelectFilter value={source} onChange={setSource} options={sources} allLabel="全部来源" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="accent">结果 {filtered.length} 条</Tag>
        <Tag tone="muted">按时间倒序</Tag>
        {source ? <Tag tone="muted">当前来源：{source}</Tag> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="当前暂无符合条件的新闻与讨论数据。" />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                <Tag tone="accent">{item.source}</Tag>
                <Tag tone="muted">{formatDate(item.date)}</Tag>
              </div>
              <h3 className="text-lg font-medium text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium">
                查看链接
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
