import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { NewsPageClient } from "@/components/pages/news-page-client";
import { getNews } from "@/lib/data";

export default function NewsPage() {
  const items = getNews();

  return (
    <SiteShell currentPath="/news">
      <PageIntro
        eyebrow="News & Commentary"
        title="新闻与讨论"
        description="统一使用中国政府网与新华社等权威口径，并通过地区要闻导航直达各级政府门户本地新闻栏目。"
        meta={`共 ${items.length} 条权威稿件 · 按日期倒序`}
      />

      <NewsPageClient items={items} />
    </SiteShell>
  );
}
