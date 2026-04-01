import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ArrowUpRight, CalendarDays, FileText, LibraryBig, Newspaper, Wallet } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { HighlightList } from "@/components/lists/highlight-list";
import { RecentList } from "@/components/lists/recent-list";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { Tag } from "@/components/ui/tag";
import { getAppData, getDashboardStats, getDebtData, getNews, getPapers, getPolicies, getRecentUpdates, getSourceRegistry } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const tracks = [
  {
    href: "/policies" as Route,
    label: "政策制度",
    summary: "国务院、财政部、全国人大预算与债务管理正式文本。",
    color: "text-[#d7b28e]"
  },
  {
    href: "/debt" as Route,
    label: "债务动态",
    summary: "财政部债务管理司月度发行、余额与结构变化。",
    color: "text-[#c9d8e7]"
  },
  {
    href: "/news" as Route,
    label: "新闻讨论",
    summary: "中国政府网 / 新华社权威口径的政策解读与发布。",
    color: "text-[#d7d1bb]"
  },
  {
    href: "/papers" as Route,
    label: "文献研究",
    summary: "NBER、期刊与研究机构关于地方债和政府债务的代表性研究。",
    color: "text-[#d9c5d1]"
  }
];

export default function HomePage() {
  const data = getAppData();
  const stats = getDashboardStats();
  const recent = getRecentUpdates().slice(0, 4);
  const sources = getSourceRegistry();
  const policies = getPolicies().slice(0, 4);
  const debt = getDebtData().slice(0, 5);
  const news = getNews().slice(0, 4);
  const papers = getPapers().slice(0, 4);

  return (
    <SiteShell currentPath="/">
      <section className="hero-glow overflow-hidden rounded-[36px] px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="max-w-5xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Tag tone="success">仅展示已核验来源</Tag>
              <Tag tone="muted">内部研究版</Tag>
              <Tag tone="muted">weekly / monthly</Tag>
            </div>
            <p className="issue-kicker">April 2026 · Internal Research Edition</p>
            <h2 className="display-serif mt-4 max-w-5xl text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-[4.8rem]">
              把分散在政策文本、债务统计、权威解读与文献中的关键信息，汇成一套老师打开就能核验的研究首页。
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              当前版本优先保证可靠性与阅读体验：每条核心内容都可点击回到财政部、中国政府网、中国人大网或权威研究机构页面。
            </p>
          </div>

          <div className="grid gap-4">
            <div className="meta-divider grid overflow-hidden rounded-[28px] border border-white/10 bg-white/6 sm:grid-cols-3">
              <div className="px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">最近更新</p>
                <p className="display-serif mt-3 text-3xl font-semibold tracking-[-0.04em]">{formatDate(stats.lastUpdated)}</p>
              </div>
              <div className="px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">来源数量</p>
                <p className="display-serif mt-3 text-3xl font-semibold tracking-[-0.04em]">{stats.activeSources}</p>
              </div>
              <div className="px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">官方占比</p>
                <p className="display-serif mt-3 text-3xl font-semibold tracking-[-0.04em]">{stats.officialSources}</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">本月观察</p>
              <h3 className="display-serif mt-3 text-2xl font-semibold tracking-[-0.04em]">{data.observation.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{data.observation.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
        {tracks.map((track) => (
          <Link key={track.href} href={track.href} className="group bg-[rgba(255,252,247,0.74)] px-6 py-6 transition hover:bg-white/88">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${track.color}`}>{track.label}</p>
            <p className="mt-3 display-serif text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{track.label}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{track.summary}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
              进入专题
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="最新更新日期" value={formatDate(stats.lastUpdated)} hint="最近一次批量更新日期" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="最近政策日期" value={formatDate(stats.latestPolicyDate)} hint="当前样本中最新政策文本" icon={<FileText className="h-5 w-5" />} />
        <StatCard label="最近债务统计" value={formatDate(stats.latestDebtDate)} hint="最新财政部月度统计节点" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="新闻样本数" value={stats.totalNews} hint="中国政府网与新华社权威稿件" icon={<Newspaper className="h-5 w-5" />} />
        <StatCard label="文献样本数" value={stats.totalPapers} hint="NBER / 期刊 / 研究机构页面" icon={<LibraryBig className="h-5 w-5" />} />
      </section>

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <div className="space-y-12">
          <SectionCard title="本期重点政策" description="保留法定文本、制度文件与核心政策口径，方便老师先抓住当前研究主线。">
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {policies.map((item, index) => (
                <article key={item.id} className="grid gap-4 py-5 lg:grid-cols-[64px_minmax(0,1fr)_130px] lg:items-start">
                  <div className="display-serif text-3xl text-[var(--accent)]">0{index + 1}</div>
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Tag tone="accent">{item.category}</Tag>
                      <Tag tone="muted">{item.source}</Tag>
                    </div>
                    <h3 className="display-serif text-2xl font-semibold leading-9 tracking-[-0.03em] text-[var(--ink)]">{item.title}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
                  </div>
                  <div className="flex flex-col items-start gap-4 lg:items-end">
                    <span className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</span>
                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                      原文链接
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="重要政策与热点摘要" description="优先呈现本期最值得立即展开研究的制度变化与财政线索。">
            <HighlightList items={data.highlights} />
          </SectionCard>

          <SectionCard title="月度债务动态" description="以财政部债务管理司公开统计为主，先看月度发行节奏和债务余额节点。">
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {debt.map((item) => (
                <article key={item.id} className="grid gap-4 py-5 lg:grid-cols-[150px_minmax(0,1fr)_140px]">
                  <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</div>
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Tag tone={item.metricType === "issuance" ? "accent" : "default"}>
                        {item.metricType === "issuance" ? "发行" : "余额"}
                      </Tag>
                      <Tag tone="muted">{item.bondType}</Tag>
                    </div>
                    <h3 className="text-lg font-medium leading-8 text-[var(--ink)]">
                      {item.value.toLocaleString("zh-CN")} {item.unit}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.notes ?? item.source}</p>
                  </div>
                  <div className="flex items-start lg:justify-end">
                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                      财政部原页
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="权威新闻与讨论" description="统一收束到中国政府网 / 新华社，减少信息口径分散。">
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {news.map((item) => (
                <article key={item.id} className="grid gap-4 py-5 lg:grid-cols-[150px_minmax(0,1fr)_120px]">
                  <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</div>
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Tag tone="accent">{item.source}</Tag>
                      {item.tags.slice(0, 2).map((tag) => (
                        <Tag key={tag} tone="muted">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <h3 className="text-lg font-medium leading-8 text-[var(--ink)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
                  </div>
                  <div className="flex items-start lg:justify-end">
                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                      查看原文
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-10">
          <SectionCard title="最新文献" description="精选可直接点击的代表性研究页面。">
            <div className="space-y-4">
              {papers.map((item) => (
                <article key={item.id} className="paper-card rounded-[24px] p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Tag tone="accent">{item.year}</Tag>
                    <Tag tone="muted">{item.source}</Tag>
                  </div>
                  <h3 className="display-serif text-[1.45rem] font-semibold leading-8 tracking-[-0.03em] text-[var(--ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.authors.join("；")}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.abstract}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                    打开原文
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="最近更新" description="给老师一个快速判断页面新鲜度的窗口。">
            <RecentList items={recent} />
          </SectionCard>

          <SectionCard title="来源覆盖" description="平台只保留可直接回跳到正式网页的来源。">
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {sources.slice(0, 4).map((source) => (
                <article key={source.key} className="py-5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Tag tone="accent">{source.category}</Tag>
                    <Tag tone="muted">{source.authority}</Tag>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--ink)]">{source.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{source.description}</p>
                </article>
              ))}
            </div>
            <Link href="/updates" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
              查看完整来源注册表
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SectionCard>
        </aside>
      </div>
    </SiteShell>
  );
}
