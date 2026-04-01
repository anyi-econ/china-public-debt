import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { PoliciesClient } from "@/components/pages/policies-client";
import { SectionCard } from "@/components/ui/section-card";
import { getPolicies } from "@/lib/data";

export default function PoliciesPage() {
  const items = getPolicies();

  return (
    <SiteShell currentPath="/policies">
      <PageIntro
        eyebrow="Policy & Institutions"
        title="政策与制度"
        description="聚合财政部、中国政府网、全国人大等正式页面中的政策、预算报告与制度文本，优先帮助老师快速定位本期最重要的法定口径。"
        meta={
          <>
            <span>共 {items.length} 条样本</span>
            <span>按日期倒序</span>
            <span>原文可回跳核验</span>
          </>
        }
        aside={
          <>
            <p className="font-medium text-[var(--ink)]">阅读建议</p>
            <p className="mt-2">
              先看预算报告与专项债制度文件，再回到债务动态页核对对应月份的发行与余额变化。
            </p>
          </>
        }
      />

      <SectionCard title="政策样本库" description="支持按关键词和分类检索，页面保留正式来源、核心摘要与标签，方便快速进入原文。">
        <PoliciesClient items={items} />
      </SectionCard>
    </SiteShell>
  );
}
