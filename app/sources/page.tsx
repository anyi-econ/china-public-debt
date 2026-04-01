import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionCard } from "@/components/ui/section-card";
import { getSourceRegistryByCategory } from "@/lib/data";

export default function SourcesPage() {
  const sources = getSourceRegistryByCategory();

  return (
    <SiteShell currentPath="/sources">
      <PageIntro
        eyebrow="Source Navigation"
        title="权威来源导航"
        description="网站仅保存来源元数据与简报内容。点击下列链接可直接跳转原站，按政策、数据、新闻、文献四类组织。"
        meta="权威来源优先 · 首版含自动与手动两类接入方式"
        variant="archive"
      />

      <div className="container-page archive-body space-y-8">
        {Object.entries(sources).map(([category, items]) => (
          <SectionCard key={category} title={category === "policy" ? "政策来源" : category === "debt" ? "数据来源" : category === "news" ? "新闻来源" : "文献来源"} description={`${items.length} 个来源`}>
            <div className="flex flex-col gap-3">
              {items.map((source) => (
                <article key={source.key} className="info-card p-4">
                  <div className="sidebar-paper-meta">
                    {source.authority} · {source.method} · {source.automation ?? "manual-only"}
                  </div>
                  <h3 className="sidebar-paper-title-text">{source.name}</h3>
                  <p className="sidebar-paper-note">{source.description}</p>
                  <div className="event-metrics">
                    {(source.tags ?? []).map((tag) => (
                      <span key={tag} className="metric-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm">
                    <a href={source.url} target="_blank" rel="noreferrer">
                      打开来源 ↗
                    </a>
                    {source.notes ? <span className="text-[#777]"> · {source.notes}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </SiteShell>
  );
}
