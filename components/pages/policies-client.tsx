"use client";

import { useMemo, useState } from "react";
import { PolicyItem } from "@/lib/types";
import { formatDate, uniqueValues } from "@/lib/utils";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/ui/empty-state";

export function PoliciesClient({ items }: { items: PolicyItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => uniqueValues(items.map((item) => item.category)), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = !query || [item.title, item.source, item.summary, ...item.tags].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchFilter value={query} onChange={setQuery} placeholder="搜索政策标题、来源、标签或摘要" />
        </div>
        <SelectFilter value={category} onChange={setCategory} options={categories} allLabel="全部分类" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="accent">结果 {filtered.length} 条</Tag>
        <Tag tone="muted">按时间倒序</Tag>
        {category ? <Tag tone="muted">当前分类：{category}</Tag> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="当前筛选条件下暂无政策数据，可运行更新脚本后重试。" />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                <Tag tone="accent">{item.category}</Tag>
                <Tag tone="muted">{item.source}</Tag>
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
                查看原文
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
