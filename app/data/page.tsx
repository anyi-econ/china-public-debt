import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { DataPageClient } from "@/components/pages/data-page-client";
import { getAnnualIssuanceDataset, getAnnualBalanceDataset, getDebtData } from "@/lib/data";

export default function DataPage() {
  const items = getDebtData();
  const annualIssuance = getAnnualIssuanceDataset();
  const annualBalance = getAnnualBalanceDataset();

  return (
    <SiteShell currentPath="/data">
      <PageIntro
        eyebrow="Data Dashboard"
        title="数据"
        description="债务数据可视化、财政预决算公开导航与政府官网导航。"
        meta={`年度发行序列 ${annualIssuance.series[0]?.values.length ?? 0} 年 · 月度记录 ${items.length} 条`}
      />

      <DataPageClient items={items} annualIssuance={annualIssuance} annualBalance={annualBalance} />
    </SiteShell>
  );
}
