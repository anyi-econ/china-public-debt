import { SourceRegistryGrid } from "@/components/lists/source-registry-grid";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { RecentList } from "@/components/lists/recent-list";
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
      <PageIntro
        eyebrow="Update Center"
        title="更新中心"
        description="把更新时间、来源状态和最近变动放在同一页，方便老师或研究团队先判断可信度与新鲜度，再进入政策、债务和文献页面。"
        meta={
          <>
            <span>最近更新：{formatDate(data.metadata.lastUpdated)}</span>
            <span>模式：{data.metadata.updateMode}</span>
            <span>来源状态可复核</span>
          </>
        }
        aside={
          <>
            <p className="font-medium text-[var(--ink)]">建议工作流</p>
            <p className="mt-2">先检查来源状态，再看最近更新记录；如果某个来源降级到兜底模式，再考虑人工导入补齐。</p>
          </>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        <div className="hero-glow rounded-[28px] px-6 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">最近批量更新</p>
          <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.04em]">{formatDate(data.metadata.lastUpdated)}</p>
          <p className="mt-3 text-sm leading-7 text-white/72">支持 `npm run update:weekly` 与 `npm run update:monthly` 两种节奏。</p>
        </div>
        <div className="paper-card rounded-[28px] px-6 py-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">正常来源</p>
          <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{successCount}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">当前可稳定核验并直接回跳原始页面的来源数。</p>
        </div>
        <div className="paper-card rounded-[28px] px-6 py-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">兜底来源</p>
          <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{fallbackCount}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">如遇结构变化或抓取失败，可转为半自动导入并人工复核。</p>
        </div>
      </section>

      <SectionCard title="实时来源状态" description="逐项展示当前接入来源的状态、口径与可访问方式。">
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {data.metadata.sourceStatus.map((item) => (
            <div key={item.name} className="grid gap-4 py-5 lg:grid-cols-[220px_120px_120px_minmax(0,1fr)_140px] lg:items-start">
              <div className="font-medium text-[var(--ink)]">{item.name}</div>
              <div>
                <Tag tone="muted">{item.category}</Tag>
              </div>
              <div>
                <Tag tone={item.status === "success" ? "success" : item.status === "fallback" ? "accent" : "default"}>{item.status}</Tag>
              </div>
              <div className="text-sm leading-7 text-[var(--ink-soft)]">{item.message}</div>
              <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.updatedAt)}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="来源注册表" description="展示当前平台的覆盖边界、接入方式和后续可扩展方向。">
        <SourceRegistryGrid sources={sources} statuses={data.metadata.sourceStatus} />
      </SectionCard>

      <SectionCard title="最近更新日志" description="给团队一个快速核对新增条目和人工整理动作的入口。">
        <RecentList items={updates} />
      </SectionCard>
    </SiteShell>
  );
}
