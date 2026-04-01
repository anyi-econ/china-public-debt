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
      <section className="card overflow-hidden p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Tag tone="accent">研究助手型网页</Tag>
              <Tag tone="success">仅展示已核验来源</Tag>
              <Tag tone="muted">周更 / 月更</Tag>
              <Tag tone="muted">官方源优先</Tag>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">从政策文本到债务统计，形成一套老师可直接核验的研究工作台</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              当前版本只保留能回跳到财政部、中国政府网、中国人大网与权威研究机构页面的条目，适合直接分享给老师查看和继续扩展。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-mist p-4">
              <p className="text-sm text-slate-500">接入来源</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{stats.activeSources}</p>
              <p className="mt-2 text-sm text-slate-600">其中官方 / 权威来源 {stats.officialSources} 个</p>
            </div>
            <div className="rounded-2xl border border-line bg-mist p-4">
              <p className="text-sm text-slate-500">最近更新</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{formatDate(stats.lastUpdated)}</p>
              <p className="mt-2 text-sm text-slate-600">已覆盖 {sources.filter((item) => item.category === "policy").length} 个政策源与权威研究入口</p>
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

      <SectionCard title="来源覆盖" description="首版优先接入财政部、中国政府网、地方政府债券信息公开平台，以及开放学术检索源。">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sources.slice(0, 4).map((source) => (
            <div key={source.key} className="rounded-2xl border border-line bg-mist p-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <Tag tone="accent">{source.category}</Tag>
                <Tag tone="muted">{source.authority}</Tag>
              </div>
              <h3 className="font-medium text-ink">{source.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{source.description}</p>
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

        <SectionCard title="本月观察" description="作为首页的研究提示区域，可在后续版本接入 Agent 自动撰写。">
          <div className="rounded-2xl bg-mist p-5">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">{data.observation.month}</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{data.observation.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{data.observation.summary}</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {data.observation.bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slateBlue" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </SiteShell>
  );
}
