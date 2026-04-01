"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PaperItem } from "@/lib/types";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { uniqueValues } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/ui/empty-state";

export function PapersClient({ items }: { items: PaperItem[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");

  const years = useMemo(() => uniqueValues(items.map((item) => String(item.year))).reverse(), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.venue, item.abstract, ...item.authors, ...item.keywords].join(" ").toLowerCase();
      return (!query || haystack.includes(query.toLowerCase())) && (!year || String(item.year) === year);
    });
  }, [items, query, year]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、作者、机构、关键词或摘要" />
        </div>
        <SelectFilter value={year} onChange={setYear} options={years} allLabel="全部年份" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag tone="accent">结果 {filtered.length} 条</Tag>
        <Tag tone="muted">按年份倒序</Tag>
        {year ? <Tag tone="muted">当前年份：{year}</Tag> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="暂无符合条件的文献数据。" />
      ) : (
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {filtered.map((item) => (
            <article key={item.id} className="grid gap-4 py-6 lg:grid-cols-[110px_minmax(0,1fr)_130px]">
              <div className="display-serif text-3xl font-semibold text-[var(--accent)]">{item.year}</div>
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Tag tone="accent">{item.source}</Tag>
                  <Tag tone="muted">{item.venue}</Tag>
                </div>
                <h3 className="display-serif max-w-4xl text-[1.9rem] font-semibold leading-10 tracking-[-0.03em] text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">{item.authors.join("；")}</p>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--ink-soft)]">{item.abstract}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.keywords.map((keyword) => (
                    <Tag key={keyword} tone="muted">
                      {keyword}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="flex items-start lg:justify-end">
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                  查看原文
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
