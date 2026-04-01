import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_PATH = path.join(process.cwd(), "data", "celma-annual-issuance.json");
const API_BASE = "https://www.governbond.org.cn:4443/api/loadBondData.action";
const METRICS = [
  { key: "total", metricId: "0301", label: "全国地方政府债券发行额" },
  { key: "general", metricId: "030101", label: "全国一般债券发行额" },
  { key: "special", metricId: "030102", label: "全国专项债券发行额" }
];

async function main() {
  const series = await Promise.all(METRICS.map(fetchSeries));
  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    source: {
      name: "中国地方政府债券信息公开平台",
      organization: "财政部建设",
      url: "https://www.celma.org.cn/ndsj/index.jhtml",
      note: "通过官方年度数据页对应接口 loadBondData.action 抓取全国年度发行额指标。"
    },
    series,
    links: [
      {
        title: "年度数据：全国地方政府债券发行额",
        url: "https://www.celma.org.cn/ndsj/index.jhtml",
        description: "官方年度数据页，对应指标 ID 0301、030101、030102。"
      },
      {
        title: "债券信息检索页",
        url: "https://www.celma.org.cn/zqxx/index.jhtml",
        description: "可按地区、期限、债券类型和发行日期检索具体债券条目。"
      },
      {
        title: "月度数据页",
        url: "https://www.celma.org.cn/ydsj/index.jhtml",
        description: "适合后续补充月度发行额、还本付息和余额变化口径。"
      }
    ]
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`已更新 CELMA 年度发行数据：${OUTPUT_PATH}`);
}

async function fetchSeries(metric) {
  const url = `${API_BASE}?dataType=NDZB&adCode=87&zb=${metric.metricId}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${metric.metricId}`);
  }

  const payload = await response.json();
  if (payload.code !== "0" || !Array.isArray(payload.data)) {
    throw new Error(`Unexpected payload for ${metric.metricId}`);
  }

  const values = payload.data
    .filter((item) => item.ZB_ID === metric.metricId)
    .map((item) => ({
      year: Number(item.SET_YEAR),
      value: Number(item.AMOUNT.toFixed(1))
    }))
    .sort((a, b) => a.year - b.year);

  return {
    key: metric.key,
    metricId: metric.metricId,
    label: metric.label,
    unit: "亿元",
    values
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
