import { ArrowUpRight } from "lucide-react";
import { DebtDataItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { Tag } from "@/components/ui/tag";

export function DebtOverview({ items }: { items: DebtDataItem[] }) {
  const issuance = items.filter((item) => item.metricType === "issuance");
  const balances = items.filter((item) => item.metricType === "balance");
  const latestBalance = balances[0];
  const monthlyTotal = issuance.reduce((sum, item) => sum + item.value, 0);
  const specialBondShare = issuance.filter((item) => item.bondType.includes("专项")).reduce((sum, item) => sum + item.value, 0);

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
    <div className="space-y-10">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hero-glow rounded-[30px] px-6 py-7 text-white sm:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Research View</p>
          <h3 className="display-serif mt-3 text-3xl font-semibold tracking-[-0.04em]">地方债月度口径观察</h3>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">
            首版先把财政部月度统计读顺：发行总量、专项债占比和债务余额节点放在同一工作面中，方便研究团队做基础判断。
          </p>
        </div>
        <div className="grid gap-4">
          <div className="paper-card rounded-[28px] px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">样本期发行规模</p>
            <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">{monthlyTotal.toLocaleString("zh-CN")}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">单位：亿元</p>
          </div>
          <div className="paper-card rounded-[28px] px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">专项债样本规模</p>
            <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">{specialBondShare.toLocaleString("zh-CN")}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">单位：亿元</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="border-t border-[var(--line-strong)] pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">最新债务余额</p>
          <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            {latestBalance ? latestBalance.value.toLocaleString("zh-CN") : "--"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">单位：{latestBalance?.unit ?? "亿元"}，对应地方政府债务余额口径。</p>
        </div>
        <div className="border-t border-[var(--line-strong)] pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">最近统计日期</p>
          <p className="display-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            {latestBalance ? formatDate(latestBalance.date) : "--"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">后续可继续补充 2026 年月度统计，形成连续序列。</p>
        </div>
        <div className="border-t border-[var(--line-strong)] pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">观察提示</p>
          <p className="mt-3 text-sm leading-8 text-[var(--ink-soft)]">
            结合专项债制度文件和财政部新闻发布稿，可进一步跟踪资金投向、再融资安排和化债压力缓释节奏。
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="hero-glow rounded-[30px] px-6 py-6 text-white">
          <p className="mb-5 text-xs uppercase tracking-[0.22em] text-white/45">Monthly Issuance</p>
          <SimpleBarChart data={byMonth} unit="亿元" />
        </div>
        <div className="paper-card rounded-[30px] px-6 py-6">
          <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Bond Type Structure</p>
          <SimpleBarChart data={byType} unit="亿元" />
        </div>
      </section>

      <section className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => (
          <article key={item.id} className="grid gap-4 py-5 lg:grid-cols-[150px_120px_minmax(0,1fr)_130px]">
            <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</div>
            <div className="flex flex-wrap gap-2">
              <Tag tone={item.level === "central" ? "default" : "accent"}>{item.level === "central" ? "中央" : "地方"}</Tag>
              <Tag tone="muted">{item.metricType === "issuance" ? "发行" : "余额"}</Tag>
            </div>
            <div>
              <h3 className="text-lg font-medium leading-8 text-[var(--ink)]">
                {item.bondType}：{item.value.toLocaleString("zh-CN")} {item.unit}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.notes ?? item.source}</p>
            </div>
            <div className="flex items-start lg:justify-end">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                  原始统计页
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-sm text-[var(--ink-soft)]">{item.source}</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
