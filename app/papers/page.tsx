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
        description="收录 NBER、学术期刊与研究机构关于中国地方债、政府债务和财政扩张机制的代表性研究，优先保证链接可打开、摘要可直接读。"
        meta={
          <>
            <span>共 {items.length} 条文献</span>
            <span>按年份倒序</span>
            <span>后续可扩展 Crossref / OpenAlex</span>
          </>
        }
        aside={
          <>
            <p className="font-medium text-[var(--ink)]">首版原则</p>
            <p className="mt-2">不追求文献量，而是先把老师最可能点开的代表性研究整理成一套好读、好查、好回跳的页面。</p>
          </>
        }
      />

      <SectionCard title="研究样本库" description="支持按关键词和年份检索，条目展示作者、机构、摘要与关键词，适合直接进入阅读。">
        <PapersClient items={items} />
      </SectionCard>
    </SiteShell>
  );
}
