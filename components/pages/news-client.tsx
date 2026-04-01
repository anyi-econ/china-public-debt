"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
    <div className="space-y-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、来源、标签或摘要" />
        </div>
        <SelectFilter value={source} onChange={setSource} options={sources} allLabel="全部来源" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag tone="accent">结果 {filtered.length} 条</Tag>
        <Tag tone="muted">按日期倒序</Tag>
        {source ? <Tag tone="muted">当前来源：{source}</Tag> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="当前暂无符合条件的新闻与讨论数据。" />
      ) : (
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {filtered.map((item) => (
            <article key={item.id} className="grid gap-4 py-6 lg:grid-cols-[150px_minmax(0,1fr)_130px]">
              <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</div>
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Tag tone="accent">{item.source}</Tag>
                  {item.tags.map((tag) => (
                    <Tag key={tag} tone="muted">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <h3 className="display-serif max-w-4xl text-[1.85rem] font-semibold leading-10 tracking-[-0.03em] text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--ink-soft)]">{item.summary}</p>
              </div>
              <div className="flex items-start lg:justify-end">
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                  查看链接
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
