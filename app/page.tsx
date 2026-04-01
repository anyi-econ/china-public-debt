import { CalendarDays, FileText, LibraryBig, Newspaper, Wallet } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { HighlightList } from "@/components/lists/highlight-list";
import { RecentList } from "@/components/lists/recent-list";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { getAppData, getDashboardStats, getRecentUpdates, getSourceRegistry } from "@/lib/data";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const data = getAppData();
  const stats = getDashboardStats();
  const recent = getRecentUpdates().slice(0, 6);
  const sources = getSourceRegistry();

  return (
    <SiteShell currentPath="/">
      <section className="editorial-surface overflow-hidden px-6 py-8 sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-4xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <Tag tone="accent">研究助手型网页</Tag>
              <Tag tone="success">仅展示已核验来源</Tag>
              <Tag tone="muted">周更 / 月更</Tag>
              <Tag tone="muted">官方源优先</Tag>
            </div>
            <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              把政策文本、债务统计、权威解读和研究文献汇成一套可直接核验的工作台
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              当前版本只保留能回跳到财政部、中国政府网、中国人大网与权威研究机构页面的条目，适合直接分享给老师查看和继续扩展。
            </p>
            <div className="mt-8 data-divider grid gap-4 rounded-[24px] border border-line/80 bg-slate-50/70 p-4 sm:grid-cols-3 sm:gap-0 sm:p-0">
              <div className="px-4 py-2 sm:px-6 sm:py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">最近更新</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{formatDate(stats.lastUpdated)}</p>
              </div>
              <div className="px-4 py-2 sm:px-6 sm:py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">接入来源</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{stats.activeSources}</p>
              </div>
              <div className="px-4 py-2 sm:px-6 sm:py-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">官方 / 权威</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{stats.officialSources}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] bg-[#102033] p-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">本版说明</p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm text-slate-400">覆盖范围</p>
                <p className="mt-2 text-lg leading-8 text-slate-100">政策、债务统计、权威新闻与代表性研究文献</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">老师最先会看到</p>
                <p className="mt-2 text-lg leading-8 text-slate-100">最近政策日期、最近债务统计、核心政策摘要与来源状态</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">当前重点</p>
                <p className="mt-2 text-lg leading-8 text-slate-100">已覆盖 {sources.filter((item) => item.category === "policy").length} 个政策源与权威研究入口</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="最新更新日期" value={formatDate(stats.lastUpdated)} hint="最近一次批量更新" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="最近政策日期" value={formatDate(stats.latestPolicyDate)} hint="当前样本中最新政策文本" icon={<FileText className="h-5 w-5" />} />
        <StatCard label="最近债务统计" value={formatDate(stats.latestDebtDate)} hint="财政部月度债务统计口径" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="政策样本数" value={stats.totalPolicies} hint="仅保留可核验原文链接" icon={<Newspaper className="h-5 w-5" />} />
        <StatCard label="文献样本数" value={stats.totalPapers} hint="NBER / 期刊 / 研究机构页面" icon={<LibraryBig className="h-5 w-5" />} />
      </div>

      <SectionCard title="来源覆盖" description="页面仅展示可回跳到正式网站的条目，优先保留财政部、中国政府网、中国人大网和权威研究机构。">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sources.slice(0, 4).map((source) => (
            <div key={source.key} className="rounded-[24px] border border-line/80 bg-slate-50/70 p-5">
              <div className="mb-2 flex flex-wrap gap-2">
                <Tag tone="accent">{source.category}</Tag>
                <Tag tone="muted">{source.authority}</Tag>
              </div>
              <h3 className="text-lg font-medium text-ink">{source.name}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{source.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="重要政策与热点摘要" description="优先展示当前样本库中对研究工作较有参考价值的政策与观察。">
        <HighlightList items={data.highlights} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="最近更新" description="按抓取、导入与人工整理的时间顺序记录最近内容变动。">
          <RecentList items={recent} />
        </SectionCard>

        <SectionCard title="本月观察" description="保留为老师快速把握本期重点的阅读入口。">
          <div className="rounded-[26px] bg-[#102033] p-6 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">{data.observation.month}</p>
            <h3 className="mt-4 text-2xl font-semibold leading-9">{data.observation.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{data.observation.summary}</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {data.observation.bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </SiteShell>
  );
}
