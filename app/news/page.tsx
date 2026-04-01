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
        description="统一使用中国政府网与新华社等权威口径，帮助研究团队把握专项债、化债安排和制度变化。"
        meta={`共 ${items.length} 条权威稿件 · 按日期倒序`}
      />

      <div className="container-page topic-body">
        <SectionCard title="权威解读与发布稿" description="支持按关键词和来源筛选">
          <NewsClient items={items} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
