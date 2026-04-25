/**
 * download-issuance-plan-attachments.mjs
 *
 * 下载"发行安排"页面中的附件（每页通常 1 个 PDF）。
 *
 * 存放到 data/celma-issuance-plan-attachments/raw/
 * 文件名格式: <yyyyMM_省份名>.pdf  (从标题提取核心信息)
 *
 * 用法:
 *   node scripts/download-issuance-plan-attachments.mjs
 *   node scripts/download-issuance-plan-attachments.mjs --since=2025-01-01
 */

import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.resolve(__dirname, "../../data/celma-bond-issuance.json");
const RAW_DIR = path.resolve(__dirname, "../../data/celma-issuance-plan-attachments/raw");
const LOG_PATH = path.resolve(__dirname, "../../data/celma-issuance-plan-attachments/download-log.csv");

const CONCURRENCY = parseInt(process.env.CONCURRENCY, 10) || 5;

/* ── Utilities ── */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function fetchText(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
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

async function fetchBinary(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        referer: "https://www.celma.org.cn/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    if (attempt < 3) {
      await sleep(600 + Math.random() * 600);
      return fetchBinary(url, attempt + 1);
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

function absoluteUrl(href) {
  return new URL(href, "https://www.celma.org.cn/").toString();
}

/**
 * 从详情页 HTML 提取第一个附件链接 (通常只有 1 个 PDF)
 */
function extractFirstAttachment(html) {
  const $ = load(html);
  let result = null;
  $("a").each((_, el) => {
    if (result) return false; // already found
    const href = $(el).attr("href") || "";
    if (/uploadFiles\//i.test(href) || /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(href)) {
      result = absoluteUrl(href);
    }
  });
  return result;
}

/**
 * 从标题提取核心命名信息
 *
 * "2026年03月辽宁省本月债券发行安排公开"      → "202603_辽宁省.pdf"
 * "山东省（不含青岛）2019年2月政府债券发行计划表" → "201902_山东省（不含青岛）.pdf"
 * "关于公布2019年3季度贵州省地方政府债券发行计划的通知" → "201903_贵州省.pdf"
 */
function buildFileName(title, date) {
  // 1. Extract time period from title
  let yearMonth = "";
  const ymMatch = title.match(/(\d{4})年\s*(\d{1,2})月/);
  if (ymMatch) {
    yearMonth = ymMatch[1] + ymMatch[2].padStart(2, "0");
  } else {
    // Try quarter pattern: 3季度 / 三季度
    const qMap = { "1": "01", "2": "04", "3": "07", "4": "10", "一": "01", "二": "04", "三": "07", "四": "10" };
    const qMatch = title.match(/(\d{4})年\s*([1-4一二三四])季度/);
    if (qMatch) {
      yearMonth = qMatch[1] + qMap[qMatch[2]];
    } else {
      yearMonth = date.replace(/-/g, "").slice(0, 6);
    }
  }

  // 2. Extract region by removing all noise
  let cleaned = title;
  // Remove time patterns
  cleaned = cleaned.replace(/\d{4}年\s*\d{1,2}月(?:份)?/g, "");
  cleaned = cleaned.replace(/\d{4}年\s*[1-4一二三四]季度/g, "");
  cleaned = cleaned.replace(/\d{4}年/g, "");
  // Remove wrapping pattern
  cleaned = cleaned.replace(/关于公布/g, "");
  cleaned = cleaned.replace(/的通知/g, "");
  cleaned = cleaned.replace(/及安排/g, "");
  // Remove content descriptors
  cleaned = cleaned.replace(/本月/g, "");
  cleaned = cleaned.replace(/全辖/g, "");
  cleaned = cleaned.replace(/(?:政府)?(?:地方)?债券发行安排公开/g, "");
  cleaned = cleaned.replace(/(?:地方)?(?:政府)?债券发行计划表?/g, "");
  cleaned = cleaned.replace(/(?:政府)?(?:地方)?债券发行工作安排/g, "");
  cleaned = cleaned.replace(/地方政府/g, "");
  cleaned = cleaned.replace(/政府/g, "");
  cleaned = cleaned.trim();

  let region = cleaned || "未知";
  // Sanitize for filesystem
  region = region
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/[\u200b-\u200f\ufeff]/g, "")
    .replace(/\s+/g, "")
    .trim();

  return `${yearMonth}_${region}.pdf`;
}

async function main() {
  const sinceArg = process.argv.find((a) => a.startsWith("--since="));
  const sinceDate = sinceArg ? sinceArg.split("=")[1] : null;

  const raw = await readFile(INPUT_PATH, "utf8");
  const dataset = JSON.parse(raw);
  let items = dataset.items.filter((i) => i.category === "发行安排");

  if (sinceDate) {
    items = items.filter((i) => i.date && i.date >= sinceDate);
    console.log(`筛选 date >= ${sinceDate}，共 ${items.length} 条发行安排`);
  } else {
    console.log(`共 ${items.length} 条发行安排`);
  }

  await mkdir(RAW_DIR, { recursive: true });

  // Build file names and check for duplicates
  const fileNameMap = new Map(); // fileName -> item
  const itemToFileName = new Map();
  for (const item of items) {
    let baseName = buildFileName(item.title, item.date);
    // Handle duplicates by appending id suffix
    if (fileNameMap.has(baseName)) {
      const stem = baseName.replace(/\.pdf$/, "");
      baseName = `${stem}_${item.url.match(/\/(\d+)\.jhtml/)?.[1] || item.id?.slice(-6)}.pdf`;
    }
    fileNameMap.set(baseName, item);
    itemToFileName.set(item.id || item.url, baseName);
  }

  // Check what already exists
  let existingFiles = new Set();
  try {
    const entries = await readdir(RAW_DIR);
    existingFiles = new Set(entries);
  } catch {
    // dir doesn't exist yet
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const logEntries = [];

  await mapWithConcurrency(items, CONCURRENCY, async (item, idx) => {
    await sleep(80 + Math.random() * 150);

    const fileName = itemToFileName.get(item.id || item.url);
    const filePath = path.join(RAW_DIR, fileName);

    // Skip if already downloaded
    if (existingFiles.has(fileName)) {
      skipped++;
      logEntries.push({
        title: item.title,
        date: item.date,
        pageUrl: item.url,
        attachmentUrl: "",
        fileName,
        success: "yes",
        error: "已存在,跳过",
        localPath: `data/celma-issuance-plan-attachments/raw/${fileName}`,
      });
      if ((idx + 1) % 50 === 0) {
        console.log(`  [${idx + 1}/${items.length}] 下载 ${downloaded}, 跳过 ${skipped}, 失败 ${failed}`);
      }
      return;
    }

    try {
      // Fetch detail page to find attachment URL
      const html = await fetchText(item.url);
      const attachUrl = extractFirstAttachment(html);
      if (!attachUrl) {
        failed++;
        logEntries.push({
          title: item.title,
          date: item.date,
          pageUrl: item.url,
          attachmentUrl: "",
          fileName,
          success: "no",
          error: "页面无附件链接",
          localPath: "",
        });
        return;
      }

      // Download the file
      const buffer = await fetchBinary(attachUrl);
      await writeFile(filePath, buffer);
      downloaded++;
      logEntries.push({
        title: item.title,
        date: item.date,
        pageUrl: item.url,
        attachmentUrl: attachUrl,
        fileName,
        success: "yes",
        error: "",
        localPath: `data/celma-issuance-plan-attachments/raw/${fileName}`,
      });
    } catch (err) {
      failed++;
      logEntries.push({
        title: item.title,
        date: item.date,
        pageUrl: item.url,
        attachmentUrl: "",
        fileName,
        success: "no",
        error: err instanceof Error ? err.message : String(err),
        localPath: "",
      });
    }

    if ((idx + 1) % 50 === 0) {
      console.log(`  [${idx + 1}/${items.length}] 下载 ${downloaded}, 跳过 ${skipped}, 失败 ${failed}`);
    }
  });

  // Write CSV log
  const header = [
    "标题",
    "公告日期",
    "页面 url",
    "附件 url",
    "文件名",
    "下载是否成功",
    "失败原因",
    "本地文件路径",
  ].map(csvEscape).join(",");

  const rows = logEntries.map((e) =>
    [e.title, e.date, e.pageUrl, e.attachmentUrl, e.fileName, e.success, e.error, e.localPath]
      .map(csvEscape)
      .join(","),
  );

  await writeFile(LOG_PATH, "\ufeff" + header + "\n" + rows.join("\n") + "\n", "utf8");

  console.log(`\n完成: 下载 ${downloaded}, 跳过 ${skipped}, 失败 ${failed}, 共 ${items.length}`);
  console.log(`日志: ${LOG_PATH}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
