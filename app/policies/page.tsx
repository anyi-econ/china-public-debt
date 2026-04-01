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
        description="聚合财政部、中国政府网、全国人大等正式页面中的政策、预算报告与制度文本。"
        meta={`共 ${items.length} 条样本 · 原文可回跳核验`}
      />

      <div className="container-page topic-body">
        <SectionCard title="政策样本库" description="按关键词和分类检索">
          <PoliciesClient items={items} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
