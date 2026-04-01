import { DebtDataItem } from "@/lib/types";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";

export function DebtOverview({ items }: { items: DebtDataItem[] }) {
  const issuance = items.filter((item) => item.metricType === "issuance");
  const balances = items.filter((item) => item.metricType === "balance");
  const latestBalance = balances[0];
  const monthlyTotal = issuance.reduce((sum, item) => sum + item.value, 0);
  const specialBondTotal = issuance.filter((item) => item.bondType.includes("专项")).reduce((sum, item) => sum + item.value, 0);

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

  return (
    <div className="space-y-8">
      <div className="topic-overview">
        <h3 className="section-title">
          研究概览
          <span className="section-sub">财政部月度统计</span>
        </h3>
        <div className="editorial-prose">
          <p>首版债务页优先围绕财政部债务管理司的公开月度口径，形成一条可持续更新、可直接核验的时间序列。</p>
          <p>当前样本期发行规模合计为 {monthlyTotal.toLocaleString("zh-CN")} 亿元，其中特殊用途债券样本规模为 {specialBondTotal.toLocaleString("zh-CN")} 亿元。</p>
          <p>最新债务余额节点为 {latestBalance?.date ?? "--"}，对应地方政府债务余额 {latestBalance?.value.toLocaleString("zh-CN") ?? "--"} 亿元。</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="info-card p-4">
          <h3 className="section-title">月度发行规模</h3>
          <SimpleBarChart data={byMonth} unit="亿元" />
        </article>
        <article className="info-card p-4">
          <h3 className="section-title">债券类型结构</h3>
          <SimpleBarChart data={byType} unit="亿元" />
        </article>
      </div>

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
