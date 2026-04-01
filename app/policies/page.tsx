import { SiteShell } from "@/components/layout/site-shell";
import { PoliciesClient } from "@/components/pages/policies-client";
import { SectionCard } from "@/components/ui/section-card";
import { getPolicies } from "@/lib/data";

export default function PoliciesPage() {
  return (
    <SiteShell currentPath="/policies">
      <SectionCard title="政策与制度" description="聚合财政部、国务院、中国政府网等与政府债务相关的政策、制度与预算报告。">
        <PoliciesClient items={getPolicies()} />
      </SectionCard>
    </SiteShell>
  );
}
