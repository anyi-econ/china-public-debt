import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";

const ISSUANCE_OUT = path.join(process.cwd(), "data", "celma-annual-issuance.json");
const BALANCE_OUT = path.join(process.cwd(), "data", "celma-annual-balance.json");
const API = "https://www.governbond.org.cn:4443/api/loadBondData.action";

const REGIONS = [
  { adCode: "87", name: "全国" },
  { adCode: "11", name: "北京市" },
  { adCode: "12", name: "天津市" },
  { adCode: "13", name: "河北省" },
  { adCode: "14", name: "山西省" },
  { adCode: "15", name: "内蒙古自治区" },
  { adCode: "21", name: "辽宁省" },
  { adCode: "22", name: "吉林省" },
  { adCode: "23", name: "黑龙江省" },
  { adCode: "31", name: "上海市" },
  { adCode: "32", name: "江苏省" },
  { adCode: "33", name: "浙江省" },
  { adCode: "34", name: "安徽省" },
  { adCode: "35", name: "福建省" },
  { adCode: "36", name: "江西省" },
  { adCode: "37", name: "山东省" },
  { adCode: "41", name: "河南省" },
  { adCode: "42", name: "湖北省" },
  { adCode: "43", name: "湖南省" },
  { adCode: "44", name: "广东省" },
  { adCode: "45", name: "广西壮族自治区" },
  { adCode: "46", name: "海南省" },
  { adCode: "50", name: "重庆市" },
  { adCode: "51", name: "四川省" },
  { adCode: "52", name: "贵州省" },
  { adCode: "53", name: "云南省" },
  { adCode: "54", name: "西藏自治区" },
  { adCode: "61", name: "陕西省" },
  { adCode: "62", name: "甘肃省" },
  { adCode: "63", name: "青海省" },
  { adCode: "64", name: "宁夏回族自治区" },
  { adCode: "65", name: "新疆维吾尔自治区" },
];

const ISSUANCE_METRICS = [
  { key: "total", metricId: "0301", label: "债券发行额" },
  { key: "general", metricId: "030101", label: "一般债券发行额" },
  { key: "special", metricId: "030102", label: "专项债券发行额" },
];

const BALANCE_METRICS = [
  { key: "total", metricId: "0601", label: "债务余额" },
  { key: "general", metricId: "060101", label: "一般债务余额" },
  { key: "special", metricId: "060102", label: "专项债务余额" },
];

function requestJson(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0"
        },
        rejectUnauthorized: false,
        timeout
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestJson(url);
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(` retry ${i + 1} for ${url}...`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function fetchRegionData(region, parentZb, metrics) {
  const url = `${API}?dataType=NDZB&adCode=${region.adCode}&zb=${parentZb}`;
  const payload = await fetchWithRetry(url);
  if (payload.code !== "0" || !Array.isArray(payload.data)) {
    return metrics.map((m) => ({ ...m, values: [] }));
  }

  return metrics.map((m) => {
    const values = payload.data
      .filter((d) => d.ZB_ID === m.metricId)
      .map((d) => ({ year: Number(d.SET_YEAR), value: Number(Number(d.AMOUNT).toFixed(1)) }))
      .sort((a, b) => a.year - b.year);
    return { key: m.key, metricId: m.metricId, label: m.label, unit: "亿元", values };
  });
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const sourceMeta = {
    name: "中国地方政府债券信息公开平台",
    organization: "财政部建设",
    url: "https://www.celma.org.cn/ndsj/index.jhtml",
  };

  const issuanceRegions = [];
  const balanceRegions = [];

  for (const region of REGIONS) {
    process.stdout.write(`Fetching ${region.name} (${region.adCode})...`);
    const issSeries = await fetchRegionData(region, "03", ISSUANCE_METRICS);
    await new Promise((r) => setTimeout(r, 500));
    const balSeries = await fetchRegionData(region, "06", BALANCE_METRICS);
    issuanceRegions.push({ adCode: region.adCode, name: region.name, series: issSeries });
    balanceRegions.push({ adCode: region.adCode, name: region.name, series: balSeries });
    const issYears = issSeries[0].values.length;
    const balYears = balSeries[0].values.length;
    console.log(` issuance=${issYears}y, balance=${balYears}y`);
    // small delay to be respectful
    await new Promise((r) => setTimeout(r, 800));
  }

  const issuancePayload = {
    updatedAt: today,
    source: { ...sourceMeta, note: "通过官方年度数据页对应接口抓取全国及各省年度债券发行额指标。" },
    series: issuanceRegions[0]?.series ?? [],
    regions: issuanceRegions,
    links: [
      { title: "年度数据：全国地方政府债券发行额", url: "https://www.celma.org.cn/ndsj/index.jhtml", description: "官方年度数据页，对应指标 ID 0301、030101、030102。" },
      { title: "债券信息检索页", url: "https://www.celma.org.cn/zqxx/index.jhtml", description: "可按地区、期限、债券类型和发行日期检索具体债券条目。" },
      { title: "月度数据页", url: "https://www.celma.org.cn/ydsj/index.jhtml", description: "适合后续补充月度发行额、还本付息和余额变化口径。" },
    ],
  };

  const balancePayload = {
    updatedAt: today,
    source: { ...sourceMeta, note: "通过官方年度数据页对应接口抓取全国及各省年度债务余额指标（06 债务余额）。" },
    series: balanceRegions[0]?.series ?? [],
    regions: balanceRegions,
    links: [
      { title: "年度数据：全国地方政府债务余额", url: "https://www.celma.org.cn/ndsj/index.jhtml", description: "官方年度数据页，对应指标 ID 0601、060101、060102。" },
    ],
  };

  await fs.writeFile(ISSUANCE_OUT, JSON.stringify(issuancePayload, null, 2) + "\n", "utf8");
  await fs.writeFile(BALANCE_OUT, JSON.stringify(balancePayload, null, 2) + "\n", "utf8");
  console.log(`\nDone! Updated:\n  ${ISSUANCE_OUT}\n  ${BALANCE_OUT}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
