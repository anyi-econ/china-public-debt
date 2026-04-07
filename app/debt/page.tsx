import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { DebtOverview } from "@/components/pages/debt-overview";
import { SectionCard } from "@/components/ui/section-card";
import { getAnnualIssuanceDataset, getAnnualBalanceDataset } from "@/lib/data";

export default function DebtPage() {
  const annualIssuance = getAnnualIssuanceDataset();
  const annualBalance = getAnnualBalanceDataset();

  return (
    <SiteShell currentPath="/debt">
      <PageIntro
        eyebrow="Debt Monitor"
        title="债务动态"
        description="以中国地方政府债券信息公开平台年度指标为主，展示全国及各省地方债发行额与债务余额趋势。"
        meta={`年度发行序列 ${annualIssuance.series[0]?.values.length ?? 0} 年 · 地区覆盖 ${(annualIssuance.regions?.length ?? 1) - 1} 省级单元`}
      />

      <div className="container-page topic-body">
        <SectionCard title="债务统计与图表" description="年度趋势与地区联动筛选">
          <DebtOverview annualIssuance={annualIssuance} annualBalance={annualBalance} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
