import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionCard } from "@/components/ui/section-card";
import { getBriefs, getLatestBrief } from "@/lib/data";

export default function BriefsPage() {
  const briefs = getBriefs();
  const latest = getLatestBrief();

  return (
    <SiteShell currentPath="/briefs">
      <PageIntro
        eyebrow="Monthly Briefs"
        title="月度简报归档"
        description="系统按月汇总政策、债务数据、公开讨论与文献观点，生成仅保存元数据与 AI 分析内容的月度简报。"
        meta={`当前共 ${briefs.length} 期 · 最新为 ${latest?.month ?? "--"}`}
        variant="library"
      />

      <div className="container-page lit-body space-y-8">
        {latest ? (
          <SectionCard title="最新简报" description={latest.month}>
            <article className="info-card p-5">
              <h2 className="display-serif text-[1.7rem] text-[#1a1a1a]">{latest.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#555]">{latest.sections.analysis.summary}</p>
              <div className="event-metrics">
                <span className="metric-badge">政策 {latest.sourceCounts.policy}</span>
                <span className="metric-badge">数据 {latest.sourceCounts.debt}</span>
                <span className="metric-badge">新闻 {latest.sourceCounts.news}</span>
                <span className="metric-badge">文献 {latest.sourceCounts.paper}</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {Object.values(latest.sections).map((section) => (
                  <div key={section.title} className="border-t border-[#e8e5e0] pt-3">
                    <h3 className="sidebar-paper-title-text">{section.title}</h3>
                    <p className="sidebar-paper-note">{section.summary}</p>
                    <ul className="mt-2 space-y-1 text-sm text-[#555]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>• {bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </SectionCard>
        ) : null}

        <SectionCard title="历史归档" description="按月份查看">
          <div className="flex flex-col gap-3">
            {briefs.map((brief) => (
              <article key={brief.id} className="info-card p-4">
                <div className="sidebar-paper-meta">
                  {brief.month} · 生成于 {brief.generatedAt}
                </div>
                <h3 className="sidebar-paper-title-text">{brief.title}</h3>
                <p className="sidebar-paper-note">{brief.sections.analysis.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {brief.highlights.map((item) => (
                    <span key={item} className="metric-badge">
                      {item}
                    </span>
                  ))}
                </div>
                {brief.relatedLinks.length ? (
                  <div className="mt-4 text-sm leading-7 text-[#555]">
                    <strong>关键链接：</strong>
                    {brief.relatedLinks.slice(0, 3).map((item, index) => (
                      <span key={`${item.url}-${index}`}>
                        {index ? " · " : ""}
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.source}
                        </a>
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <p className="mt-5 text-sm text-[#777]">
            本地调试时可使用 <code>npm run update:monthly -- --month=2026-03</code> 回溯生成指定月份简报。
          </p>
        </SectionCard>
      </div>
    </SiteShell>
  );
}
