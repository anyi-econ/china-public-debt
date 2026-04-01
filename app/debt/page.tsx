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
        description="首版以财政部债务管理司公开统计为主，按月展示地方政府债发行、专项债结构和债务余额节点，适合做基础时序观察。"
        meta={
          <>
            <span>共 {items.length} 条结构化记录</span>
            <span>月度口径为主</span>
            <span>支持继续扩充时间序列</span>
          </>
        }
        aside={
          <>
            <p className="font-medium text-[var(--ink)]">当前策略</p>
            <p className="mt-2">先把可核验的财政部月度口径做扎实，再逐步补充一般债 / 专项债的更细分结构。</p>
          </>
        }
      />

      <SectionCard title="债务统计与图表" description="用简洁图表和月度明细帮助快速识别发行节奏、专项债占比和余额变化。">
        <DebtOverview items={items} />
      </SectionCard>
    </SiteShell>
  );
}
