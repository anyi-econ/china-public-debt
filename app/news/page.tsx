import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { NewsClient } from "@/components/pages/news-client";
import { SectionCard } from "@/components/ui/section-card";
import { getNews } from "@/lib/data";

export default function NewsPage() {
  const items = getNews();

  return (
    <SiteShell currentPath="/news">
      <PageIntro
        eyebrow="News & Commentary"
        title="新闻与讨论"
        description="统一使用中国政府网与新华社等权威口径，帮助研究团队快速把握专项债、化债安排和政府债务管理制度的公开叙事。"
        meta={
          <>
            <span>共 {items.length} 条权威稿件</span>
            <span>按日期倒序</span>
            <span>来源可直接点击</span>
          </>
        }
        aside={
          <>
            <p className="font-medium text-[var(--ink)]">说明</p>
            <p className="mt-2">本页刻意收紧来源范围，优先追求口径一致和老师可直接核验，而不是媒体覆盖面。</p>
          </>
        }
      />

      <SectionCard title="权威解读与发布稿" description="支持按关键词和来源筛选，适合快速找到专项债、化债与制度改革的权威解释。">
        <NewsClient items={items} />
      </SectionCard>
    </SiteShell>
  );
}
