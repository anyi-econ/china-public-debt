import { DebtDataItem } from "@/lib/types";
import { AnnualIssuanceDataset } from "@/lib/types";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";

export function DebtOverview({ items, annualIssuance }: { items: DebtDataItem[]; annualIssuance: AnnualIssuanceDataset }) {
  const issuance = items.filter((item) => item.metricType === "issuance");
  const balances = items.filter((item) => item.metricType === "balance");
  const latestBalance = balances[0];
  const monthlyTotal = issuance.reduce((sum, item) => sum + item.value, 0);
  const specialBondTotal = issuance.filter((item) => item.bondType.includes("专项")).reduce((sum, item) => sum + item.value, 0);
  const totalSeries = annualIssuance.series.find((series) => series.key === "total") ?? annualIssuance.series[0];
  const generalSeries = annualIssuance.series.find((series) => series.key === "general");
  const specialSeries = annualIssuance.series.find((series) => series.key === "special");
  const latestAnnual = totalSeries?.values.at(-1);
  const previousAnnual = totalSeries?.values.at(-2);
  const latestSpecial = specialSeries?.values.at(-1);
  const latestGeneral = generalSeries?.values.at(-1);
  const annualGrowth = latestAnnual && previousAnnual ? ((latestAnnual.value - previousAnnual.value) / previousAnnual.value) * 100 : 0;
  const specialShare = latestAnnual && latestSpecial ? (latestSpecial.value / latestAnnual.value) * 100 : 0;

  const byMonth = Array.from(
    issuance.reduce((map, item) => {
      const month = item.date.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + item.value);
      return map;
    }, new Map<string, number>())
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([label, value]) => ({ label, value }));

  const byType = Array.from(
    issuance.reduce((map, item) => {
      map.set(item.bondType, (map.get(item.bondType) ?? 0) + item.value);
      return map;
    }, new Map<string, number>())
  ).map(([label, value], index) => ({
    label,
    value,
    tone: (index % 2 ? "secondary" : "primary") as "primary" | "secondary"
  }));

  const annualBars =
    totalSeries?.values.map((item, index) => ({
      label: `${item.year}`,
      value: item.value,
      tone: (index === totalSeries.values.length - 1 ? "primary" : "secondary") as "primary" | "secondary"
    })) ?? [];

  const latestStructure = [
    {
      label: "一般债券",
      value: latestGeneral?.value ?? 0,
      tone: "secondary" as const
    },
    {
      label: "专项债券",
      value: latestSpecial?.value ?? 0,
      tone: "primary" as const
    }
  ];

  return (
    <div className="space-y-8">
      <div className="topic-overview">
        <h3 className="section-title">
          研究概览
          <span className="section-sub">CELMA 年度数据 + 财政部月度统计</span>
        </h3>
        <div className="editorial-prose">
          <p>
            数据页当前以中国地方政府债券信息公开平台年度数据页为核心口径，优先展示全国地方政府债券年度发行规模，并用财政部债务管理司月度统计补足短期观察。
          </p>
          <p>
            最新年度节点为 {latestAnnual?.year ?? "--"} 年，全国地方政府债券发行额为 {latestAnnual?.value.toLocaleString("zh-CN") ?? "--"} 亿元，
            较 {previousAnnual?.year ?? "--"} 年{annualGrowth >= 0 ? "增加" : "减少"} {Math.abs(annualGrowth).toFixed(1)}%。
          </p>
          <p>
            其中 {latestAnnual?.year ?? "--"} 年专项债券发行额为 {latestSpecial?.value.toLocaleString("zh-CN") ?? "--"} 亿元，占比约 {specialShare.toFixed(1)}%；月度样本期发行合计为{" "}
            {monthlyTotal.toLocaleString("zh-CN")} 亿元，最新余额节点为 {latestBalance?.date ?? "--"}。
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="info-card p-5">
          <p className="data-kicker">年度发行规模</p>
          <h3 className="data-stat">{latestAnnual?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestAnnual?.year ?? "--"} 年</p>
          <p className="data-note">来源：{annualIssuance.source.name} 年度数据页，指标 ID {totalSeries?.metricId ?? "--"}。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">专项债占比</p>
          <h3 className="data-stat">{specialShare.toFixed(1)}%</h3>
          <p className="data-substat">
            {latestSpecial?.value.toLocaleString("zh-CN") ?? "--"} / {latestAnnual?.value.toLocaleString("zh-CN") ?? "--"} 亿元
          </p>
          <p className="data-note">用于观察近年稳增长工具中专项债的重要性变化。</p>
        </article>
        <article className="info-card p-5">
          <p className="data-kicker">月度余额节点</p>
          <h3 className="data-stat">{latestBalance?.value.toLocaleString("zh-CN") ?? "--"}</h3>
          <p className="data-substat">亿元 · {latestBalance?.date ?? "--"}</p>
          <p className="data-note">补充口径来自财政部债务管理司月度统计页。</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="info-card p-4">
          <h3 className="section-title">全国年度发行规模</h3>
          <SimpleBarChart data={annualBars} unit="亿元" />
        </article>
        <article className="info-card p-4">
          <h3 className="section-title">最新年度结构</h3>
          <SimpleBarChart data={latestStructure} unit="亿元" />
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="info-card p-4">
          <h3 className="section-title">官方数据入口</h3>
          <div className="space-y-3">
            {annualIssuance.links.map((link) => (
              <div key={link.url} className="list-row pb-3 last:border-b-0 last:pb-0">
                <div className="event-title">{link.title}</div>
                <div className="event-summary mt-1">{link.description}</div>
                <div className="event-sources">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    打开官方页面 ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="info-card p-4">
          <h3 className="section-title">月度补充观察</h3>
          <SimpleBarChart data={byMonth} unit="亿元" />
          <div className="event-summary mt-4">
            当前月度样本中专项债发行合计 {specialBondTotal.toLocaleString("zh-CN")} 亿元，可与年度发行口径结合使用，追踪专项债节奏和余额变化。
          </div>
        </article>
      </div>

      <article className="info-card p-4">
        <h3 className="section-title">月度结构化记录</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="event-summary">
              当前记录主要来自财政部债务管理司月度统计页，保留具体统计页面链接，便于老师直接跳回原始口径核验。
            </div>
          </div>
          <div>
            <SimpleBarChart data={byType} unit="亿元" />
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <article key={item.id} className="event-card expanded">
            <div className="event-card-header cursor-default">
              <span className="event-date">{item.date.slice(5)}</span>
              <span className="event-type-tag" style={{ background: "#1B4965", color: "#fff" }}>
                {item.metricType === "issuance" ? "发行" : "余额"}
              </span>
              <span className="event-title">
                {item.bondType}：{item.value.toLocaleString("zh-CN")} {item.unit}
              </span>
            </div>
            <div className="event-card-body" style={{ maxHeight: "400px" }}>
              <div className="event-card-content">
                <div className="event-summary">{item.notes ?? item.source}</div>
                <div className="event-metrics">
                  <span className="metric-badge">{item.level === "local" ? "地方" : "中央"}</span>
                  <span className="metric-badge">{item.source}</span>
                </div>
                {item.url ? (
                  <div className="event-sources">
                    <a href={item.url} target="_blank" rel="noreferrer">
                      财政部原始统计页 ↗
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
