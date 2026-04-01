import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { DebtOverview } from "@/components/pages/debt-overview";
import { SectionCard } from "@/components/ui/section-card";
import { getDebtData } from "@/lib/data";

export default function DebtPage() {
  const items = getDebtData();

  return (
    <SiteShell currentPath="/debt">
      <PageIntro
        eyebrow="Debt Monitor"
        title="债务动态"
        description="以财政部债务管理司公开统计为主，按月展示地方政府债发行、专项债结构和债务余额节点。"
        meta={`共 ${items.length} 条结构化记录 · 月度口径为主`}
      />

      <div className="container-page topic-body">
        <SectionCard title="债务统计与图表" description="月度结构与明细">
          <DebtOverview items={items} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
