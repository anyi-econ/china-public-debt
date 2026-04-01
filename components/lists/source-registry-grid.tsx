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
    <div className="flex flex-col gap-3">
      {sources.map((source) => {
        const status = statuses.find((item) => item.name === source.name);

        return (
          <article key={source.key} className="info-card p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Tag tone="accent">{source.category}</Tag>
              <Tag tone="muted">{source.authority}</Tag>
              <Tag tone="muted">{source.method}</Tag>
              <Tag tone="muted">{source.cadence}</Tag>
              {status ? <StatusBadge status={status.status} /> : null}
            </div>

            <h3 className="display-serif text-[1.3rem] text-[#1a1a1a]">{source.name}</h3>
            <p className="mt-2 text-sm leading-7 text-[#555]">{source.description}</p>

            <div className="event-metrics">
              {(source.tags ?? []).map((tag) => (
                <span key={tag} className="metric-badge">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 text-sm leading-7 text-[#666]">
              <p>
                <strong>接入方式：</strong>
                {source.method === "manual" ? "半自动导入 / 人工复核" : source.method === "api" ? "开放 API 抓取" : "公开列表页解析"}
              </p>
              <p>
                <strong>最近状态：</strong>
                {status?.message ?? "待更新脚本运行后生成状态。"}
              </p>
            </div>

            <a href={source.url} target="_blank" rel="noreferrer" className="view-all-link inline-flex items-center gap-2">
              访问来源
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>
        );
      })}
    </div>
  );
}
