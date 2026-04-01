import { DebtDataItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { Tag } from "@/components/ui/tag";

export function DebtOverview({ items }: { items: DebtDataItem[] }) {
  const issuance = items.filter((item) => item.metricType === "issuance");
  const balances = items.filter((item) => item.metricType === "balance");
  const latestBalance = balances[0];
  const monthlyTotal = issuance.reduce((sum, item) => sum + item.value, 0);
  const specialBondShare = issuance
    .filter((item) => item.bondType.includes("专项"))
    .reduce((sum, item) => sum + item.value, 0);

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
  ).map(([label, value], index) => {
    const tone: "primary" | "secondary" = index % 2 ? "secondary" : "primary";
    return { label, value, tone };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-line/80 bg-slate-50/70 p-5">
          <p className="text-sm text-slate-500">样本期发行规模合计</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{monthlyTotal.toLocaleString("zh-CN")}</p>
          <p className="mt-2 text-sm text-slate-500">单位：亿元</p>
        </div>
        <div className="rounded-[24px] border border-line/80 bg-slate-50/70 p-5">
          <p className="text-sm text-slate-500">最新债务余额</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{latestBalance ? latestBalance.value.toLocaleString("zh-CN") : "--"}</p>
          <p className="mt-2 text-sm text-slate-500">单位：{latestBalance?.unit ?? "亿元"}</p>
        </div>
        <div className="rounded-[24px] border border-line/80 bg-slate-50/70 p-5">
          <p className="text-sm text-slate-500">最近统计日期</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{latestBalance ? formatDate(latestBalance.date) : "--"}</p>
          <p className="mt-2 text-sm text-slate-500">可按周 / 月继续补充</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] bg-[#102033] p-6 text-white">
          <h3 className="text-lg font-medium text-white">研究提示</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            首版债务动态以地方政府债券信息公开平台和财政部公开信息为核心，适合做月度发行节奏、专项债占比与债务余额变化的基础观测。
          </p>
        </div>
        <div className="rounded-[24px] border border-line/80 bg-slate-50/70 p-5">
          <p className="text-sm text-slate-500">专项债样本规模</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{specialBondShare.toLocaleString("zh-CN")}</p>
          <p className="mt-2 text-sm text-slate-500">单位：亿元，用于观察一般债与专项债结构差异</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[24px] border border-line/80 bg-white p-5">
          <h3 className="mb-4 text-lg font-medium text-ink">近 6 个样本月发行规模</h3>
          <SimpleBarChart data={byMonth} unit="亿元" />
        </div>
        <div className="rounded-[24px] border border-line/80 bg-white p-5">
          <h3 className="mb-4 text-lg font-medium text-ink">样本期债券类型分布</h3>
          <SimpleBarChart data={byType} unit="亿元" />
        </div>
      </div>

      <div className="rounded-[24px] border border-line/80 bg-white p-5">
        <h3 className="mb-4 text-lg font-medium text-ink">月度发行与余额明细</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">日期</th>
                <th className="px-3 py-3 font-medium">层级</th>
                <th className="px-3 py-3 font-medium">债券类型</th>
                <th className="px-3 py-3 font-medium">指标</th>
                <th className="px-3 py-3 font-medium">数值</th>
                <th className="px-3 py-3 font-medium">来源</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line/70">
                  <td className="px-3 py-3">{formatDate(item.date)}</td>
                  <td className="px-3 py-3"><Tag tone={item.level === "central" ? "default" : "accent"}>{item.level === "central" ? "中央" : "地方"}</Tag></td>
                  <td className="px-3 py-3">{item.bondType}</td>
                  <td className="px-3 py-3">{item.metricType === "issuance" ? "发行" : "余额"}</td>
                  <td className="px-3 py-3">{item.value.toLocaleString("zh-CN")} {item.unit}</td>
                  <td className="px-3 py-3">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
