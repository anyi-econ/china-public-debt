import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { PoliciesPageClient } from "@/components/pages/policies-page-client";
import { getCelmaPolicyDynamics } from "@/lib/data";
import { buildCitySearchData } from "@/data/gov-search-data";

export default function PoliciesPage() {
  const policyItems = getCelmaPolicyDynamics();
  const govSearchItems = buildCitySearchData();

  return (
    <SiteShell currentPath="/policies">
      <PageIntro
        eyebrow="Policy & Institutions"
        title="政策与制度"
        description="聚合债券政策动态与政府官网政策信息检索，支持按地区、类型、主题等多维度筛选。"
        meta={`CELMA 债券政策 ${policyItems.length} 条 · 政府官网检索 ${govSearchItems.length} 条`}
      />

      <PoliciesPageClient policyItems={policyItems} govSearchItems={govSearchItems} />
    </SiteShell>
  );
}
