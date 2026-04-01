import { SiteShell } from "@/components/layout/site-shell";
import { PapersClient } from "@/components/pages/papers-client";
import { SectionCard } from "@/components/ui/section-card";
import { getPapers } from "@/lib/data";

export default function PapersPage() {
  return (
    <SiteShell currentPath="/papers">
      <SectionCard title="文献与研究" description="首版以样例文献与可扩展检索框架为主，后续可对接 Crossref、OpenAlex、SSRN、RePEc 等开放源。">
        <PapersClient items={getPapers()} />
      </SectionCard>
    </SiteShell>
  );
}
