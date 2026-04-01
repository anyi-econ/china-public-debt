import { SourceRegistryGrid } from "@/components/lists/source-registry-grid";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionCard } from "@/components/ui/section-card";
import { Tag } from "@/components/ui/tag";
import { getAppData, getRecentUpdates, getSourceRegistry } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function UpdatesPage() {
  const data = getAppData();
  const updates = getRecentUpdates();
  const sources = getSourceRegistry();
  const successCount = data.metadata.sourceStatus.filter((item) => item.status === "success").length;
  const fallbackCount = data.metadata.sourceStatus.filter((item) => item.status === "fallback").length;

  return (
    <SiteShell currentPath="/updates">
      <SectionCard title="更新中心" description="展示数据更新时间、来源状态和最近更新记录，方便研究团队快速确认样本新鲜度。">
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-mist p-5">
            <p className="text-sm text-slate-500">最近批量更新</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{formatDate(data.metadata.lastUpdated)}</p>
            <p className="mt-4 text-sm text-slate-600">更新模式：{data.metadata.updateMode}</p>
            <p className="mt-2 text-sm text-slate-600">支持 `npm run update:weekly` 与 `npm run update:monthly` 两种节奏。</p>
          </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-sm text-slate-500">正常来源</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{successCount}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-sm text-slate-500">兜底来源</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{fallbackCount}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 text-sm text-slate-600">
              <p className="font-medium text-ink">建议工作流</p>
              <ol className="mt-3 space-y-2 leading-6">
                <li>1. 先运行更新脚本。</li>
                <li>2. 在本页检查来源状态。</li>
                <li>3. 对兜底条目执行人工复核或手动导入。</li>
              </ol>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-white text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">来源</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">说明</th>
                  <th className="px-4 py-3 font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.metadata.sourceStatus.map((item) => (
                  <tr key={item.name} className="border-b border-line/70">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3"><Tag tone="muted">{item.category}</Tag></td>
                    <td className="px-4 py-3"><Tag tone={item.status === "success" ? "success" : item.status === "fallback" ? "accent" : "default"}>{item.status}</Tag></td>
                    <td className="px-4 py-3">{item.message}</td>
                    <td className="px-4 py-3">{formatDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="来源注册表" description="将真实可用的信息来源显式列出，便于研究团队理解平台覆盖边界与后续扩源方向。">
        <SourceRegistryGrid sources={sources} statuses={data.metadata.sourceStatus} />
      </SectionCard>

      <SectionCard title="更新日志" description="用于人工核对新条目、判断是否需要补充标签、摘要或全文。">
        <div className="space-y-4">
          {updates.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-medium text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.type} · {item.source} · {item.status}</p>
                </div>
                <div className="text-sm text-slate-500">{formatDate(item.date)}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </SiteShell>
  );
}
