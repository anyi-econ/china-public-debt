import { ExternalLink } from "lucide-react";
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
    <div className="grid gap-4 xl:grid-cols-2">
      {sources.map((source) => {
        const status = statuses.find((item) => item.name === source.name);
        return (
          <article key={source.key} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Tag tone="accent">{source.category}</Tag>
                  <Tag tone="muted">{source.authority}</Tag>
                  <Tag tone="muted">{source.method}</Tag>
                  <Tag tone="muted">{source.cadence}</Tag>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{source.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{source.description}</p>
                </div>
              </div>
              {status ? <StatusBadge status={status.status} /> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(source.tags ?? []).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-mist p-4 text-sm text-slate-600">
              <p>
                <span className="font-medium text-ink">接入方式：</span>
                {source.method === "manual" ? "半自动导入 / 人工复核" : source.method === "api" ? "开放 API 抓取" : "公开列表页解析"}
              </p>
              <p className="mt-2">
                <span className="font-medium text-ink">最近状态：</span>
                {status?.message ?? "待执行更新脚本后生成状态。"}
              </p>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slateBlue"
            >
              访问来源
              <ExternalLink className="h-4 w-4" />
            </a>
          </article>
        );
      })}
    </div>
  );
}
