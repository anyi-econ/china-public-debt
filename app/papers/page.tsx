import { PageIntro } from "@/components/layout/page-intro";
import { SiteShell } from "@/components/layout/site-shell";
import { PapersClient } from "@/components/pages/papers-client";
import { SectionCard } from "@/components/ui/section-card";
import { getPapers } from "@/lib/data";

export default function PapersPage() {
  const items = getPapers();

  return (
    <SiteShell currentPath="/papers">
      <PageIntro
        eyebrow="Literature & Research"
        title="文献与研究"
        description="收录 NBER、学术期刊与研究机构关于中国地方债、政府债务和财政扩张机制的代表性研究。"
        meta={`共 ${items.length} 条文献 · 按年份倒序`}
        variant="library"
      />

      <div className="container-page lit-body">
        <SectionCard title="研究样本库" description="支持按关键词和年份检索">
          <PapersClient items={items} />
        </SectionCard>
      </div>
    </SiteShell>
  );
}
