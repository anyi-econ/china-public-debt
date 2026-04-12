/**
 * fetch-celma-bond-issuance.mjs
 *
 * 抓取 CELMA 平台"债券信息"下的三个栏目：
 *   - 发行安排 (channelId=192)
 *   - 发行前公告 (channelId=193)
 *   - 发行结果 (channelId=194)
 *
 * 输出：data/celma-bond-issuance.json
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.resolve(__dirname, "../data/celma-bond-issuance.json");
const SOURCE_NAME = "中国地方政府债券信息公开平台 / celma";
const BASE = "https://www.celma.org.cn";

const PAGE_CONCURRENCY = parseInt(process.env.CELMA_PAGE_CONCURRENCY, 10) || 5;

const SECTIONS = [
  {
    key: "issuance-plan",
    category: "发行安排",
    channelId: 192,
  },
  {
    key: "pre-issuance-notice",
    category: "发行前公告",
    channelId: 193,
  },
  {
    key: "issuance-result",
    category: "发行结果",
    channelId: 194,
  },
];

const REGION_CANDIDATES = [
  "新疆生产建设兵团", "新疆兵团",
  "内蒙古自治区", "广西壮族自治区", "西藏自治区",
  "宁夏回族自治区", "新疆维吾尔自治区",
  "北京市", "天津市", "上海市", "重庆市",
  "河北省", "山西省", "辽宁省", "吉林省", "黑龙江省",
  "江苏省", "浙江省", "安徽省", "福建省", "江西省",
  "山东省", "河南省", "湖北省", "湖南省", "广东省",
  "海南省", "四川省", "贵州省", "云南省", "陕西省",
  "甘肃省", "青海省",
  "大连市", "青岛市", "宁波市", "厦门市", "深圳市",
].sort((a, b) => b.length - a.length);

/* ── Utilities ── */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function formatLocalDate(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildStableId(sectionKey, url) {
  const normalized = url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `celma-${sectionKey}-${normalized.slice(-120)}`;
}

function absoluteUrl(href) {
  return new URL(href, `${BASE}/`).toString();
}

function extractRegion(text) {
  const t = cleanText(text);
  for (const c of REGION_CANDIDATES) {
    if (t.includes(c)) return c;
  }
  if (/财政部|国务院|全国/.test(t)) return "全国";
  return null;
}

async function fetchText(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } catch (err) {
    if (attempt < 3) {
      await sleep(600 + Math.random() * 600);
      return fetchText(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

/* ── Scraping ── */

function pageUrl(section, page) {
  if (page === 1) {
    return `${BASE}/zqsclb.jhtml?ad_code=87&channelId=${section.channelId}`;
  }
  return `${BASE}/zqsclb_${page}.jhtml?ad_code=87&channelId=${section.channelId}`;
}

function extractCounts(html) {
  const totalItems = Number(html.match(/共\s*(\d+)\s*条/)?.[1] ?? 0);
  const totalPages = Number(html.match(/共\s*(\d+)\s*页/)?.[1] ?? 1);
  return { totalItems, totalPages };
}

function extractItems(html, section) {
  const $ = load(html);
  return $("li.current")
    .map((_, el) => {
      const a = $(el).find("a").first();
      const href = a.attr("href");
      const title = cleanText(a.attr("title") || a.text());
      const dateText = cleanText($(el).find("span").last().text());
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : null;
      if (!href || !title) return null;

      const url = absoluteUrl(href);
      const region = extractRegion(title);

      return {
        id: buildStableId(section.key, url),
        title,
        url,
        date,
        source: SOURCE_NAME,
        category: section.category,
        region,
        attachment_count: 0,
        attachments: [],
      };
    })
    .get()
    .filter(Boolean);
}

async function fetchSection(section) {
  console.log(`\n[${section.category}] 开始抓取 channelId=${section.channelId} ...`);
  const firstHtml = await fetchText(pageUrl(section, 1));
  const { totalItems, totalPages } = extractCounts(firstHtml);
  console.log(`  共 ${totalItems} 条, ${totalPages} 页`);

  const firstItems = extractItems(firstHtml, section);
  const remainingPages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2);

  const remainingResults = await mapWithConcurrency(remainingPages, PAGE_CONCURRENCY, async (page, idx) => {
    await sleep(80 + Math.random() * 120);
    const html = await fetchText(pageUrl(section, page));
    const items = extractItems(html, section);
    if ((idx + 1) % 50 === 0 || idx === remainingPages.length - 1) {
      console.log(`  已抓取 ${idx + 2}/${totalPages} 页`);
    }
    return items;
  });

  const allItems = [firstItems, ...remainingResults].flat();
  console.log(`  实际获取 ${allItems.length} 条（期望 ${totalItems}）`);

  return {
    coverage: {
      category: section.category,
      channelId: section.channelId,
      totalPages,
      totalItems,
      actualItems: allItems.length,
    },
    items: allItems,
  };
}

async function loadExistingDataset() {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(content);
    return new Map((parsed.items || []).map((i) => [i.url, i]));
  } catch {
    return new Map();
  }
}

async function main() {
  const existingByUrl = await loadExistingDataset();
  const coverage = [];
  const allItems = new Map();

  for (const section of SECTIONS) {
    const result = await fetchSection(section);
    coverage.push(result.coverage);
    for (const item of result.items) {
      const existing = existingByUrl.get(item.url);
      if (existing) {
        // Preserve existing enrichment data
        allItems.set(item.url, {
          ...item,
          attachment_count: existing.attachment_count || item.attachment_count,
          attachments: existing.attachments?.length ? existing.attachments : item.attachments,
        });
      } else {
        allItems.set(item.url, item);
      }
    }
  }

  const items = [...allItems.values()].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title, "zh-CN")
  );

  const payload = {
    updatedAt: formatLocalDate(),
    source: {
      name: SOURCE_NAME,
      organization: "财政部政府债务研究和评估中心",
      url: "https://www.celma.org.cn/zqxx/index.jhtml",
      note: "抓取债券信息下的发行安排、发行前公告、发行结果三个栏目的全量列表数据。每个栏目通过 zqsclb.jhtml 分页接口全量抓取，按 URL 去重。",
    },
    coverage,
    items,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\n✅ 写入 ${items.length} 条记录到 ${OUTPUT_PATH}`);
  console.log(`  发行安排: ${items.filter(i => i.category === "发行安排").length}`);
  console.log(`  发行前公告: ${items.filter(i => i.category === "发行前公告").length}`);
  console.log(`  发行结果: ${items.filter(i => i.category === "发行结果").length}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
