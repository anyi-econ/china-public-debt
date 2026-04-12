import Link from "next/link";
import type { Route } from "next";
import { getAppData, getDashboardStats, getLatestWeeklyReport, getRecentUpdates } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";

const topicCards: Array<{
  href: Route;
  label: string;
  color: string;
  lead: string;
  bullets: string[];
}> = [
  {
    href: "/policies",
    label: "政策",
    color: "#8B0000",
    lead: "年度预算报告、专项债制度与债务管理文本，是当前研究的基础口径。",
    bullets: ["预算草案报告", "专项债制度优化", "债务管理年度报告", "财政部制度文件"]
  },
  {
    href: "/data" as Route,
    label: "数据",
    color: "#1B4965",
    lead: "围绕财政部月度统计，追踪地方债发行规模、专项债结构和余额变化。",
    bullets: ["月度发行规模", "专项债与一般债", "债务余额节点", "财政部统计原页"]
  },
  {
    href: "/news",
    label: "新闻",
    color: "#2E7D32",
    lead: "统一收束到中国政府网与新华社，保留老师可直接核验的权威解读。",
    bullets: ["政策发布稿", "权威解读", "化债口径", "专项债投向变化"]
  },
  {
    href: "/papers",
    label: "文献",
    color: "#5C6BC0",
    lead: "精选地方债、融资平台与财政扩张研究，优先保留可直接打开的页面。",
    bullets: ["NBER 工作论文", "期刊正式发表", "研究机构 PDF", "关键词索引"]
  }
];

export default function HomePage() {
  const data = getAppData();
  const stats = getDashboardStats();
  const updates = getRecentUpdates();
  const weeklyReport = getLatestWeeklyReport();

  return (
    <SiteShell currentPath="/">
      <section className="hero">
        <div className="container-page">
          <h1 className="hero-title">China Government Debt Tracker</h1>
          <p className="hero-subtitle">中国政府债务追踪平台</p>
          <p className="hero-issue">{formatDate(stats.lastUpdated)} 更新版</p>
          <div className="hero-colophon">
            <span className="hero-inst">面向高校财税研究团队的内部研究网页</span>
            <span className="hero-authors">总览 · 数据 · 政策 · 新闻 · 文献</span>
          </div>
        </div>
      </section>

      <section className="digest-strip">
        <div className="container-page digest-wide">
          <div className="digest-grid">
            {topicCards.map((item) => (
              <Link key={item.href} href={item.href} className="digest-card" style={{ ["--topic-color" as never]: item.color }}>
                <span className="digest-label">{item.label}</span>
                <div className="digest-text">
                  <p className="digest-lead">
                    <strong>{item.lead}</strong>
                  </p>
                  <ul className="digest-bullets">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
                <span className="digest-more">阅读全部 →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page home-grid">
        <div className="home-topics">
          {weeklyReport ? (
            <div className="topic-overview">
              <h2 className="section-title">
                本周周报
                <span className="section-sub">{weeklyReport.weekStart.replace(/-/g, ".")}—{weeklyReport.weekEnd.replace(/-/g, ".")}</span>
              </h2>
              <div className="editorial-prose">
                <p>
                  <strong>{weeklyReport.title}</strong>
                </p>
                <p>{weeklyReport.summary}</p>
                {weeklyReport.highlights.map((item) => (
                  <p key={item}>— {item}</p>
                ))}
                <div className="mt-4" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {weeklyReport.regions.map((r) => (
                    <span key={r.name} className="metric-badge">
                      {r.name} {r.amount.toLocaleString("zh-CN")} 亿元（{r.count} 只）
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="topic-overview">
              <h3 className="section-title">
                本周周报
                <span className="section-sub">{data.observation.month}</span>
              </h3>
              <div className="editorial-prose">
                <p>
                  <strong>{data.observation.title}</strong>
                </p>
                <p>{data.observation.summary}</p>
                {data.observation.bullets.map((bullet) => (
                  <p key={bullet}>— {bullet}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="home-sidebar">
          <h2 className="section-title">最新更新</h2>
          <ul className="sidebar-papers">
            {updates.slice(0, 6).map((item) => (
              <li key={item.id} className="sidebar-paper-item">
                <span className="sidebar-paper-meta">
                  {formatDate(item.date)} · {item.type}
                </span>
                <span className="sidebar-paper-title-text">{item.title}</span>
                <span className="sidebar-paper-authors-text">{item.source}</span>
                <p className="sidebar-paper-note">{item.note}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </SiteShell>
  );
}
