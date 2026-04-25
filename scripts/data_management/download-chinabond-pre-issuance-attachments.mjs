/**
 * download-chinabond-pre-issuance-attachments.mjs
 *
 * 从 Chinabond 地方政府债券信息披露门户抓取“发行前披露”列表与附件，
 * 并下载到 data/chinabond-pre-issuance-attachments/raw。
 *
 * 默认仅处理 2026-04-06 以来数据，可通过 --since=YYYY-MM-DD 覆盖。
 */

import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.resolve(__dirname, "../../data/chinabond-bond-issuance.json");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/chinabond-bond-issuance.json");
const ATTACHMENTS_ROOT = path.resolve(__dirname, "../../data/chinabond-pre-issuance-attachments");
const RAW_ROOT = path.join(ATTACHMENTS_ROOT, "raw");
const RAW_LIST_DIR = path.join(RAW_ROOT, "list-pages");
const RAW_DETAIL_DIR = path.join(RAW_ROOT, "details");
const RAW_EVENT_DIR = path.join(RAW_ROOT, "events");
const LOG_PATH = path.join(ATTACHMENTS_ROOT, "download-log.csv");

const SOURCE_NAME = "地方政府债券信息披露门户 / chinabond";
const BASE_URL = "https://www.chinabond.com.cn";
const LIST_API = `${BASE_URL}/cbiw/lgb/infoListByPath`;
const DEFAULT_SINCE = "2026-04-06";

const PAGE_SIZE = parseInt(process.env.CHINABOND_PAGE_SIZE, 10) || 30;
const LIST_CONCURRENCY = parseInt(process.env.CHINABOND_LIST_CONCURRENCY, 10) || 2;
const DETAIL_CONCURRENCY = parseInt(process.env.CHINABOND_DETAIL_CONCURRENCY, 10) || 4;
const ATTACHMENT_CONCURRENCY = parseInt(process.env.CHINABOND_ATTACHMENT_CONCURRENCY, 10) || 1;

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sanitizeSegment(value, maxLength = 80) {
  const cleaned = cleanText(value)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/[\u200b-\u200f\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "untitled";
  return cleaned.slice(0, maxLength).trim().replace(/[.\s]+$/g, "") || "untitled";
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatLocalDate(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function absoluteUrl(url) {
  return new URL(url, `${BASE_URL}/`).toString();
}

function extractRegion(text) {
  const t = cleanText(text);
  for (const c of REGION_CANDIDATES) {
    if (t.includes(c)) return c;
  }
  if (/财政部|国务院|全国/.test(t)) return "全国";
  return null;
}

async function fetchJson(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        accept: "application/json,text/plain,*/*",
        referer: "https://www.chinabond.com.cn/dfz/#/information/index?name=%E5%8F%91%E8%A1%8C%E5%89%8D%E6%8A%AB%E9%9C%B2",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    if (attempt < 3) {
      await sleep(700 + Math.random() * 700);
      return fetchJson(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBinary(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        referer: "https://www.chinabond.com.cn/dfz/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      contentType: res.headers.get("content-type") || "",
    };
  } catch (err) {
    if (attempt < 3) {
      await sleep(700 + Math.random() * 700);
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

function inferExtension(displayName, url, contentType = "") {
  const displayExt = path.extname(displayName);
  if (displayExt) return displayExt;
  const urlExt = path.extname(new URL(url).pathname);
  if (urlExt) return urlExt;
  const lowerType = contentType.toLowerCase();
  if (lowerType.includes("pdf")) return ".pdf";
  if (lowerType.includes("msword")) return ".doc";
  if (lowerType.includes("wordprocessingml")) return ".docx";
  if (lowerType.includes("spreadsheetml")) return ".xlsx";
  if (lowerType.includes("excel")) return ".xls";
  if (lowerType.includes("zip")) return ".zip";
  if (lowerType.includes("rar")) return ".rar";
  if (lowerType.includes("7z")) return ".7z";
  return "";
}

function buildAttachmentName(displayName, url, contentType = "") {
  const ext = inferExtension(displayName, url, contentType);
  const parsedUrl = new URL(url);
  const stem = sanitizeSegment(
    path.basename(displayName, path.extname(displayName)) || path.basename(parsedUrl.pathname, path.extname(parsedUrl.pathname)),
    120,
  );
  return `${stem}${ext}`;
}

async function allocateFilePath(dirPath, preferredName, reservedNames = null) {
  const ext = path.extname(preferredName);
  const stem = path.basename(preferredName, ext);
  for (let attempt = 0; attempt < 5000; attempt++) {
    const candidateName = attempt === 0 ? preferredName : `${stem}-${attempt + 1}${ext}`;
    if (reservedNames?.has(candidateName)) continue;
    const candidatePath = path.join(dirPath, candidateName);
    try {
      await access(candidatePath);
    } catch {
      reservedNames?.add(candidateName);
      return { candidateName, candidatePath };
    }
  }
  throw new Error(`Unable to allocate file name for ${preferredName}`);
}

async function findExistingFile(folderPath, attachment) {
  const expectedName = buildAttachmentName(attachment.display_name, attachment.url);
  const expectedStem = path.basename(expectedName, path.extname(expectedName));
  const expectedExt = path.extname(expectedName).toLowerCase();
  try {
    const entries = await readdir(folderPath);
    for (const entry of entries) {
      if (
        path.basename(entry, path.extname(entry)) === expectedStem &&
        path.extname(entry).toLowerCase() === expectedExt
      ) {
        const fp = path.join(folderPath, entry);
        const st = await stat(fp);
        if (st.isFile() && st.size > 0) return entry;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function buildListUrl(page, pageSize = PAGE_SIZE) {
  const params = new URLSearchParams({
    _tp_lgbInfo: String(page),
    pageSize: String(pageSize),
    channelName: "xxplwj_fxqpl",
    issuer: "",
    infoName: "",
    disClosureYear: "",
    depth: "3",
    t: String(Date.now()),
    lan: "",
  });
  return `${LIST_API}?${params.toString()}`;
}

function buildStableId(item) {
  const safeId = String(item.id ?? "").replace(/[^0-9a-zA-Z_-]/g, "");
  if (safeId) return `chinabond-pre-issuance-${safeId}`;
  const normalized = String(item.property0 ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `chinabond-pre-issuance-${normalized.slice(-120)}`;
}

function toIssuanceItem(rawItem) {
  const title = cleanText(rawItem.title || rawItem.title1 || "");
  return {
    id: buildStableId(rawItem),
    title,
    url: absoluteUrl(rawItem.property0),
    date: /^\d{4}-\d{2}-\d{2}$/.test(rawItem.createTime || "") ? rawItem.createTime : null,
    source: SOURCE_NAME,
    category: "发行前公告",
    region: extractRegion(title),
    attachment_count: 0,
    attachments: [],
  };
}

async function downloadAttachment(attachment, folderPath, folderRelativePath, reservedNames) {
  try {
    const existingFile = await findExistingFile(folderPath, attachment);
    if (existingFile) {
      reservedNames?.add(existingFile);
      return {
        url: attachment.url,
        display_name: attachment.display_name,
        app_desc: attachment.app_desc ?? "",
        local_file_name: existingFile,
        local_file_path: `${folderRelativePath}/${existingFile}`,
        download_status: "success",
        error: null,
        skipped: true,
      };
    }

    const initialName = buildAttachmentName(attachment.display_name, attachment.url);
    let { candidateName, candidatePath } = await allocateFilePath(folderPath, initialName, reservedNames);
    const { buffer, contentType } = await fetchBinary(attachment.url);

    if (!path.extname(candidateName)) {
      const adjustedName = buildAttachmentName(attachment.display_name, attachment.url, contentType);
      const allocated = await allocateFilePath(folderPath, adjustedName, reservedNames);
      candidateName = allocated.candidateName;
      candidatePath = allocated.candidatePath;
    }

    await writeFile(candidatePath, buffer);
    return {
      url: attachment.url,
      display_name: attachment.display_name,
      app_desc: attachment.app_desc ?? "",
      local_file_name: candidateName,
      local_file_path: `${folderRelativePath}/${candidateName}`,
      download_status: "success",
      error: null,
      skipped: false,
    };
  } catch (err) {
    return {
      url: attachment.url,
      display_name: attachment.display_name,
      app_desc: attachment.app_desc ?? "",
      local_file_name: null,
      local_file_path: null,
      download_status: "failed",
      error: err instanceof Error ? err.message : String(err),
      skipped: false,
    };
  }
}

async function loadExistingMap() {
  try {
    const content = await readFile(INPUT_PATH, "utf8");
    const parsed = JSON.parse(content);
    return new Map((parsed.items || []).map((item) => [item.url, item]));
  } catch {
    return new Map();
  }
}

async function fetchListPages(sinceDate) {
  const firstUrl = buildListUrl(1, PAGE_SIZE);
  const firstData = await fetchJson(firstUrl);
  await writeFile(path.join(RAW_LIST_DIR, "page-0001.json"), `${JSON.stringify(firstData, null, 2)}\n`, "utf8");

  const totalItems = Number(firstData?.pageParam?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2);

  const otherPages = await mapWithConcurrency(pages, LIST_CONCURRENCY, async (page, idx) => {
    await sleep(100 + Math.random() * 120);
    const url = buildListUrl(page, PAGE_SIZE);
    const data = await fetchJson(url);
    await writeFile(path.join(RAW_LIST_DIR, `page-${String(page).padStart(4, "0")}.json`), `${JSON.stringify(data, null, 2)}\n`, "utf8");
    if ((idx + 2) % 20 === 0 || idx === pages.length - 1) {
      console.log(`  已抓取列表页 ${idx + 2}/${totalPages}`);
    }
    return data;
  });

  const allRawItems = [firstData, ...otherPages].flatMap((x) => x?.lgbInfoList ?? []);
  const dedup = [...new Map(allRawItems.map((x) => [x.property0, x])).values()];
  const filtered = dedup.filter((x) => x.createTime && x.createTime >= sinceDate);

  return {
    totalItems,
    totalPages,
    allRawItemsCount: allRawItems.length,
    filteredRawItems: filtered,
  };
}

async function main() {
  const sinceArg = process.argv.find((a) => a.startsWith("--since="));
  const sinceDate = sinceArg ? sinceArg.split("=")[1] : DEFAULT_SINCE;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceDate)) {
    throw new Error(`Invalid --since value: ${sinceDate}. Expected YYYY-MM-DD`);
  }

  await mkdir(ATTACHMENTS_ROOT, { recursive: true });
  await mkdir(RAW_ROOT, { recursive: true });
  await mkdir(RAW_LIST_DIR, { recursive: true });
  await mkdir(RAW_DETAIL_DIR, { recursive: true });
  await mkdir(RAW_EVENT_DIR, { recursive: true });

  console.log(`抓取 Chinabond 发行前披露，筛选 date >= ${sinceDate}`);
  const listResult = await fetchListPages(sinceDate);
  console.log(`  列表总条数: ${listResult.totalItems}，总页数: ${listResult.totalPages}`);
  console.log(`  全量抓取条数: ${listResult.allRawItemsCount}`);
  console.log(`  日期筛选后: ${listResult.filteredRawItems.length}`);

  const existingByUrl = await loadExistingMap();

  const usedFolders = new Set();
  const folderById = new Map();
  const preItems = listResult.filteredRawItems.map(toIssuanceItem);
  for (const item of preItems) {
    const datePart = (item.date ?? "0000-00-00").replace(/-/g, "");
    const baseName = `${datePart}_${sanitizeSegment(item.title, 72)}`;
    const folderName = usedFolders.has(baseName) ? `${baseName}-${item.id.slice(-8)}` : baseName;
    usedFolders.add(folderName);
    folderById.set(item.id, folderName);
  }

  let processedCount = 0;
  let skippedDownloads = 0;
  let newDownloads = 0;
  let failedDownloads = 0;
  const allLogEntries = [];

  const enrichedItems = await mapWithConcurrency(preItems, DETAIL_CONCURRENCY, async (item) => {
    await sleep(80 + Math.random() * 140);
    const folderName = folderById.get(item.id);
    const folderPath = path.join(RAW_EVENT_DIR, folderName);
    const folderRelativePath = `data/chinabond-pre-issuance-attachments/raw/events/${folderName}`;
    await mkdir(folderPath, { recursive: true });

    try {
      const detailUrl = `${item.url}${item.url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      const detail = await fetchJson(detailUrl);
      const detailRawPath = path.join(RAW_DETAIL_DIR, `${sanitizeSegment(item.id, 120)}.json`);
      await writeFile(detailRawPath, `${JSON.stringify(detail, null, 2)}\n`, "utf8");

      const rawFiles = Array.isArray(detail.files) ? detail.files : [];
      const uniqueAttachments = [...new Map(
        rawFiles
          .map((f) => ({
            url: absoluteUrl(f.url),
            display_name: cleanText(f.srcFile || "") || path.basename(new URL(absoluteUrl(f.url)).pathname),
            app_desc: cleanText(f.appDesc || ""),
          }))
          .filter((f) => Boolean(f.url && f.display_name))
          .map((f) => [f.url, f]),
      ).values()];

      const reservedNames = new Set();
      const downloadResults = await mapWithConcurrency(uniqueAttachments, ATTACHMENT_CONCURRENCY, async (att) =>
        downloadAttachment(att, folderPath, folderRelativePath, reservedNames)
      );

      const skipped = downloadResults.filter((r) => r.skipped).length;
      const downloaded = downloadResults.filter((r) => !r.skipped && r.download_status === "success").length;
      const failed = downloadResults.filter((r) => r.download_status === "failed").length;
      skippedDownloads += skipped;
      newDownloads += downloaded;
      failedDownloads += failed;

      const existing = existingByUrl.get(item.url);
      const mergedItem = {
        ...item,
        attachment_count: downloadResults.length,
        attachments: downloadResults.map((r) => ({
          url: r.url,
          display_name: r.display_name,
          local_file_name: r.local_file_name,
          local_file_path: r.local_file_path,
          download_status: r.download_status,
          error: r.error,
          app_desc: r.app_desc,
        })),
        raw_detail_path: `data/chinabond-pre-issuance-attachments/raw/details/${sanitizeSegment(item.id, 120)}.json`,
        detail_channel: cleanText(detail.channelDesc || ""),
        detail_title: cleanText(detail.title || item.title),
        ...(existing && existing.attachments?.length ? { previous_attachments_count: existing.attachments.length } : {}),
      };

      const logEntries = downloadResults.length > 0
        ? downloadResults.map((r) => ({
            title: item.title,
            date: item.date ?? "",
            page_url: item.url,
            attachment_display_name: r.display_name,
            attachment_url: r.url,
            local_file_path: r.local_file_path ?? "",
            download_success: r.download_status === "success" ? "yes" : "no",
            failure_reason: r.error ?? "",
          }))
        : [{
            title: item.title,
            date: item.date ?? "",
            page_url: item.url,
            attachment_display_name: "",
            attachment_url: "",
            local_file_path: "",
            download_success: "no",
            failure_reason: "no attachments found",
          }];
      allLogEntries.push(...logEntries);

      processedCount++;
      if (processedCount % 20 === 0 || processedCount === preItems.length) {
        console.log(`  [${processedCount}/${preItems.length}] 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`);
      }

      return mergedItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      allLogEntries.push({
        title: item.title,
        date: item.date ?? "",
        page_url: item.url,
        attachment_display_name: "",
        attachment_url: "",
        local_file_path: "",
        download_success: "no",
        failure_reason: message,
      });

      processedCount++;
      failedDownloads++;
      if (processedCount % 20 === 0 || processedCount === preItems.length) {
        console.log(`  [${processedCount}/${preItems.length}] 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`);
      }

      return {
        ...item,
        attachment_count: 0,
        attachments: [],
        detail_error: message,
      };
    }
  });

  const items = enrichedItems.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title, "zh-CN"));

  const payload = {
    updatedAt: formatLocalDate(),
    source: {
      name: SOURCE_NAME,
      organization: "中央国债登记结算有限责任公司",
      url: "https://www.chinabond.com.cn/dfz/#/information/index?name=%E5%8F%91%E8%A1%8C%E5%89%8D%E6%8A%AB%E9%9C%B2",
      note: `抓取 cbiw/lgb/infoListByPath 的 xxplwj_fxqpl（发行前披露）列表，筛选 ${sinceDate} 及以后记录，并下载详情中的 files 附件。原始列表与详情 JSON 均保存至 raw 目录。`,
    },
    coverage: [
      {
        category: "发行前公告",
        channelName: "xxplwj_fxqpl",
        totalItems: listResult.totalItems,
        totalPages: listResult.totalPages,
        fetchedItems: listResult.allRawItemsCount,
        filteredSince: sinceDate,
        actualItems: items.length,
      },
    ],
    items,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const csvHeader = ["标题", "公告日期", "页面 url", "附件显示文件名", "附件 url", "下载是否成功", "失败原因", "本地文件路径"];
  const csvRows = allLogEntries.map((e) =>
    [e.title, e.date, e.page_url, e.attachment_display_name, e.attachment_url, e.download_success, e.failure_reason, e.local_file_path]
      .map(csvEscape)
      .join(",")
  );
  const csvContent = [csvHeader.map(csvEscape).join(","), ...csvRows].join("\n");
  await writeFile(LOG_PATH, `${csvContent}\n`, "utf8");

  console.log(`\nDownload log written to ${LOG_PATH}`);
  console.log(`Updated ${OUTPUT_PATH} with attachment metadata`);
  console.log("\n--- Summary ---");
  console.log(`Since date: ${sinceDate}`);
  console.log(`Total selected items: ${items.length}`);
  console.log(`New downloads: ${newDownloads}`);
  console.log(`Skipped (already exists): ${skippedDownloads}`);
  console.log(`Failed: ${failedDownloads}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
