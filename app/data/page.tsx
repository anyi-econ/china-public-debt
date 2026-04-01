import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { DebtOverview } from "@/components/pages/debt-overview";
import { SectionCard } from "@/components/ui/section-card";
import { getAnnualIssuanceDataset, getDebtData } from "@/lib/data";

export default function DataPage() {
  const items = getDebtData();
  const annualIssuance = getAnnualIssuanceDataset();

  return (
    <SiteShell currentPath="/data">
      <PageIntro
        eyebrow="Data Dashboard"
        title="数据"
        description="优先展示中国地方政府债券信息公开平台的全国年度发行规模，并辅以财政部月度统计口径，形成可核验的数据观察页。"
        meta={`年度发行序列 ${annualIssuance.series[0]?.values.length ?? 0} 年 · 月度记录 ${items.length} 条`}
      />

      <div className="container-page topic-body">
        <SectionCard title="债务数据可视化" description="年度发行规模与月度补充">
          <DebtOverview items={items} annualIssuance={annualIssuance} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
