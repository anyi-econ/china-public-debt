/**
 * fetch-chinabond-list.mjs
 *
 * 从 Chinabond 地方政府债券信息披露门户抓取债券综合查询列表与详情信息，
 * 保存至 data/chinabond-list.json。
 *
 * 用法:
 *   node scripts/fetch-chinabond-list.mjs                       # 默认抓取最近一周
 *   node scripts/fetch-chinabond-list.mjs --since=2026-04-06 --until=2026-04-12
 *   node scripts/fetch-chinabond-list.mjs --all                 # 全量抓取（大量请求）
 */

import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, "../data/chinabond-list.json");

const BASE_URL = "https://www.chinabond.com.cn";
const LIST_API = `${BASE_URL}/cbiw/LgbBondInfo`;
const DETAIL_API = `${BASE_URL}/cbiw/LgbBondDetailServlet`;

const PAGE_SIZE = 50;
const DETAIL_CONCURRENCY = 4;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded",
  Referer: "https://www.chinabond.com.cn/dfz/",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { since: "", until: "", all: false, skipDetail: false };
  for (const a of args) {
    if (a.startsWith("--since=")) opts.since = a.slice(8);
    else if (a.startsWith("--until=")) opts.until = a.slice(8);
    else if (a === "--all") opts.all = true;
    else if (a === "--skip-detail") opts.skipDetail = true;
  }
  if (!opts.all && !opts.since) {
    // Default: this week (Mon-Sun)
    const now = new Date();
    const day = now.getDay() || 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + 1);
    opts.since = mon.toISOString().slice(0, 10);
    opts.until = now.toISOString().slice(0, 10);
  }
  return opts;
}

async function fetchList(pageNo, opts) {
  const params = new URLSearchParams();
  params.append("pageNumber", String(pageNo));
  params.append("pageSize", String(PAGE_SIZE));
  params.append("issuer", "");
  params.append("bondCharacter", "");
  params.append("beginBondDeadLine", "");
  params.append("endBondDeadLine", "");
  params.append("beginIssueDate", opts.since || "");
  params.append("endIssuedate", opts.until || "");
  params.append("beginRedeemDate", "");
  params.append("endRedeemDate", "");
  params.append("continueIssue", "");
  params.append("serial", "");
  params.append("optionCategory", "");
  params.append("issueDateOrder", "0");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(LIST_API, {
      method: "POST",
      body: params,
      signal: controller.signal,
      headers: HEADERS,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDetail(bondCode, issueNo) {
  const params = new URLSearchParams();
  params.append("bondCode", bondCode);
  params.append("issueNo", issueNo || "0");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(DETAIL_API, {
      method: "POST",
      body: params,
      signal: controller.signal,
      headers: HEADERS,
    });
    const json = await res.json();
    return json.BondInfo || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function classifyBond(name) {
  if (/再融资/.test(name)) return "再融资债券";
  if (/专项/.test(name)) return "新增专项债券";
  if (/一般/.test(name)) return "一般债券";
  // Fallback heuristics
  if (/特殊再融资|置换/.test(name)) return "再融资债券";
  return "其他";
}

function classifySubtype(name) {
  if (/再融资.*一般/.test(name) || /一般.*再融资/.test(name)) return "再融资一般债券";
  if (/再融资.*专项/.test(name) || /专项.*再融资/.test(name)) return "再融资专项债券";
  if (/再融资/.test(name)) return "再融资债券";
  if (/专项/.test(name)) return "新增专项债券";
  if (/一般/.test(name)) return "新增一般债券";
  return "其他";
}

async function main() {
  const opts = parseArgs();
  console.log(
    `[chinabond-list] Fetching bonds${opts.since ? ` from ${opts.since}` : ""}${opts.until ? ` to ${opts.until}` : ""}${opts.all ? " (ALL)" : ""}`,
  );

  // Phase 1: Fetch paginated list
  let allBonds = [];
  let page = 1;
  let totalLines = 0;
  while (true) {
    const data = await fetchList(page, opts);
    totalLines = data.totleLines || 0;
    const items = data.lgbBondList || [];
    if (!items.length) break;
    allBonds.push(...items);
    console.log(`  Page ${page}: ${items.length} items (total: ${totalLines})`);
    if (allBonds.length >= totalLines) break;
    page++;
    await sleep(300);
  }
  console.log(`[chinabond-list] List fetched: ${allBonds.length} bonds`);

  // Phase 2: Fetch details (optional)
  const detailMap = new Map();
  if (!opts.skipDetail) {
    console.log(`[chinabond-list] Fetching details for ${allBonds.length} bonds...`);
    const queue = [...allBonds];
    let done = 0;
    while (queue.length > 0) {
      const batch = queue.splice(0, DETAIL_CONCURRENCY);
      const results = await Promise.all(
        batch.map((b) => fetchDetail(b.bondCode, b.issueNo)),
      );
      for (let i = 0; i < batch.length; i++) {
        if (results[i]) detailMap.set(batch[i].bondCode, results[i]);
      }
      done += batch.length;
      process.stdout.write(`\r  Details: ${done}/${allBonds.length}`);
      if (queue.length) await sleep(200);
    }
    console.log();
  }

  // Phase 3: Merge and output
  const items = allBonds.map((b) => {
    const detail = detailMap.get(b.bondCode);
    const bondName = (b.bondName || "").replace(/\s+/g, "");
    return {
      bondCode: b.bondCode,
      bondName,
      bondShortName: detail?.bondShortName || null,
      issuer: b.issuer,
      bondCharacter: b.bondCharacter || null,
      bondType: classifyBond(bondName),
      bondSubtype: classifySubtype(bondName),
      bondDeadLine: b.bondDeadLine ? `${b.bondDeadLine}年` : null,
      bearingWay: b.bearingWay || detail?.bearingWay || null,
      issueDate: b.issueDate,
      batchDate: b.batchDate,
      redeemDate: detail?.redeemDate || null,
      valueDate: detail?.valueDate || null,
      dueDate: detail?.dueDate || null,
      listingDay: detail?.listingDay || null,
      cauponRate: parseFloat(b.cauponRate) || null,
      referenceRate: detail?.referenceRate ? parseFloat(detail.referenceRate) : null,
      plannedCirculation: detail?.plannedCirculation
        ? parseFloat(detail.plannedCirculation)
        : null,
      actualCirculation: parseFloat(b.actualCirculation) || null,
      bondCredRate: b.bondCredRate || null,
      bondRatingAgency: detail?.bondRatingAgency || null,
      serial: detail?.serial || null,
      continueIssue: detail?.continueIssue || null,
      interestFrequency: detail?.interestFrequency || null,
      issuePrice: detail?.issuePrice ? parseFloat(detail.issuePrice) : null,
    };
  });

  const output = {
    updatedAt: new Date().toISOString().slice(0, 10),
    source: {
      name: "地方政府债券信息披露门户 / chinabond",
      organization: "中央国债登记结算有限责任公司",
      url: "https://www.chinabond.com.cn/dfz/#/bond/list",
    },
    query: {
      beginIssueDate: opts.since || null,
      endIssueDate: opts.until || null,
      totalRecords: totalLines,
    },
    items,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`[chinabond-list] Saved ${items.length} bonds to ${OUTPUT_PATH}`);

  // Summary
  const byRegion = {};
  const byType = {};
  let totalAmount = 0;
  for (const item of items) {
    byRegion[item.issuer] = (byRegion[item.issuer] || 0) + (item.actualCirculation || 0);
    byType[item.bondType] = (byType[item.bondType] || 0) + (item.actualCirculation || 0);
    totalAmount += item.actualCirculation || 0;
  }
  console.log(`\nSummary:`);
  console.log(`  Total: ${totalAmount.toFixed(4)} 亿元`);
  console.log(`  By region:`, byRegion);
  console.log(`  By type:`, byType);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
