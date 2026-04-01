import { SourceRegistryGrid } from "@/components/lists/source-registry-grid";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { RecentList } from "@/components/lists/recent-list";
import { SectionCard } from "@/components/ui/section-card";
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
        description="把更新时间、来源状态和最近变动放在同一页，方便先判断可信度与新鲜度。"
        meta={`最近更新：${formatDate(data.metadata.lastUpdated)} · 模式：${data.metadata.updateMode}`}
        variant="archive"
      />

      <div className="container-page archive-body space-y-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="info-card p-4">
            <h3 className="section-title">最近批量更新</h3>
            <p className="display-serif text-3xl text-[#1a1a1a]">{formatDate(data.metadata.lastUpdated)}</p>
            <p className="muted mt-2">支持 `npm run update:weekly` 与 `npm run update:monthly`。</p>
          </article>
          <article className="info-card p-4">
            <h3 className="section-title">正常来源</h3>
            <p className="display-serif text-3xl text-[#1a1a1a]">{successCount}</p>
            <p className="muted mt-2">当前可稳定核验并直接回跳原始页面的来源数。</p>
          </article>
          <article className="info-card p-4">
            <h3 className="section-title">兜底来源</h3>
            <p className="display-serif text-3xl text-[#1a1a1a]">{fallbackCount}</p>
            <p className="muted mt-2">如遇结构变化或抓取失败，可转为半自动导入并人工复核。</p>
          </article>
        </section>

        <SectionCard title="实时来源状态" description="逐项展示当前接入来源的状态与口径">
          <div className="flex flex-col gap-3">
            {data.metadata.sourceStatus.map((item) => (
              <article key={item.name} className="event-card expanded">
                <div className="event-card-header cursor-default">
                  <span className="event-date">{formatDate(item.updatedAt).slice(5)}</span>
                  <span className="event-type-tag" style={{ background: item.status === "success" ? "#2E7D32" : "#8B0000", color: "#fff" }}>
                    {item.status}
                  </span>
                  <span className="event-title">{item.name}</span>
                </div>
                <div className="event-card-body" style={{ maxHeight: "320px" }}>
                  <div className="event-card-content">
                    <div className="event-summary">{item.message}</div>
                    <div className="event-metrics">
                      <span className="metric-badge">{item.category}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="来源注册表" description="展示当前平台的覆盖边界与接入方式">
          <SourceRegistryGrid sources={sources} statuses={data.metadata.sourceStatus} />
        </SectionCard>

        <SectionCard title="最近更新日志" description="便于快速核对新增条目和人工整理动作">
          <RecentList items={updates} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
