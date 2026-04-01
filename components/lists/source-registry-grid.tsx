import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tag } from "@/components/ui/tag";
import type { SourceCatalogItem, Metadata } from "@/lib/types";

export function SourceRegistryGrid({
  sources,
  statuses
}: {
  sources: SourceCatalogItem[];
  statuses: Metadata["sourceStatus"];
}) {
  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {sources.map((source) => {
        const status = statuses.find((item) => item.name === source.name);

        return (
          <article key={source.key} className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Tag tone="accent">{source.category}</Tag>
                <Tag tone="muted">{source.authority}</Tag>
                <Tag tone="muted">{source.method}</Tag>
                <Tag tone="muted">{source.cadence}</Tag>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <h3 className="display-serif text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{source.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{source.description}</p>
                </div>
                {status ? <StatusBadge status={status.status} /> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(source.tags ?? []).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div className="paper-card rounded-[24px] p-5 text-sm leading-7 text-[var(--ink-soft)]">
              <p>
                <span className="font-medium text-[var(--ink)]">接入方式：</span>
                {source.method === "manual" ? "半自动导入 / 人工复核" : source.method === "api" ? "开放 API 抓取" : "公开列表页解析"}
              </p>
              <p className="mt-2">
                <span className="font-medium text-[var(--ink)]">最近状态：</span>
                {status?.message ?? "待更新脚本运行后生成状态。"}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-medium text-[var(--accent)]"
              >
                访问来源
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
