import { SiteShell } from "@/components/layout/site-shell";
import { DebtOverview } from "@/components/pages/debt-overview";
import { SectionCard } from "@/components/ui/section-card";
import { getDebtData } from "@/lib/data";

export default function DebtPage() {
  return (
    <SiteShell currentPath="/debt">
      <SectionCard title="债务动态" description="展示样本中的地方政府债发行、再融资安排与债务余额摘要。后续可继续接入更细颗粒度时间序列。">
        <DebtOverview items={getDebtData()} />
      </SectionCard>
    </SiteShell>
  );
}
