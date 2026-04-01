import { SiteShell } from "@/components/layout/site-shell";
import { NewsClient } from "@/components/pages/news-client";
import { SectionCard } from "@/components/ui/section-card";
import { getNews } from "@/lib/data";

export default function NewsPage() {
  return (
    <SiteShell currentPath="/news">
      <SectionCard title="新闻与讨论" description="聚合主流媒体、财经媒体与研究机构对于政府债务问题的报道、评论与解读。">
        <NewsClient items={getNews()} />
      </SectionCard>
    </SiteShell>
  );
}
