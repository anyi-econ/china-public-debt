"use client";

import { useMemo, useState } from "react";
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索标题、作者、机构、关键词或摘要" />
        </div>
        <SelectFilter value={year} onChange={setYear} options={years} allLabel="全部年份" />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line/80 pb-4">
        <Tag tone="accent">结果 {filtered.length} 条</Tag>
        <Tag tone="muted">按年份倒序</Tag>
        {year ? <Tag tone="muted">当前年份：{year}</Tag> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="暂无符合条件的文献数据。" />
      ) : (
        <div>
          {filtered.map((item) => (
            <article key={item.id} className="list-row first:pt-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Tag tone="accent">{item.year}</Tag>
                <Tag tone="muted">{item.venue}</Tag>
                <Tag tone="muted">{item.source}</Tag>
              </div>
              <h3 className="max-w-4xl text-xl font-semibold leading-8 text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.authors.join("；")}</p>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{item.abstract}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.keywords.map((keyword) => (
                  <Tag key={keyword}>{keyword}</Tag>
                ))}
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium">
                查看原文
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
