import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { DebtOverview } from "@/components/pages/debt-overview";
import { SectionCard } from "@/components/ui/section-card";
import { getDebtData } from "@/lib/data";

export default function DataPage() {
  const items = getDebtData();

  return (
    <SiteShell currentPath="/data">
      <PageIntro
        eyebrow="Data Dashboard"
        title="数据"
        description="以财政部债务管理司和地方债公开平台口径为基础，展示地方政府债发行、专项债结构和债务余额等可视化信息。"
        meta={`共 ${items.length} 条结构化记录 · 支持月度观察`}
      />

      <div className="container-page topic-body">
        <SectionCard title="债务数据可视化" description="图表与明细">
          <DebtOverview items={items} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
