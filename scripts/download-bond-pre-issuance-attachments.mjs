/**
 * download-bond-pre-issuance-attachments.mjs
 *
 * 下载已抓取的"发行前公告"页面中的附件。
 *
 * - 读取 data/celma-bond-issuance.json 中 category="发行前公告" 的条目
 * - 进入每条详情页，提取附件链接
 * - 下载附件到 data/celma-pre-issuance-attachments/<yyyymmdd_公告名称>/
 * - 生成 download-log.csv
 */

import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.resolve(__dirname, "../data/celma-bond-issuance.json");
const ATTACHMENTS_ROOT = path.resolve(__dirname, "../data/celma-pre-issuance-attachments");
const LOG_PATH = path.join(ATTACHMENTS_ROOT, "download-log.csv");

const DETAIL_CONCURRENCY = parseInt(process.env.DETAIL_CONCURRENCY, 10) || 5;
const ATTACHMENT_CONCURRENCY = parseInt(process.env.ATTACHMENT_CONCURRENCY, 10) || 2;

/* ── Utilities ── */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
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

async function fetchBinary(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        referer: "https://www.celma.org.cn/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      contentType: res.headers.get("content-type") || "",
    };
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

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function absoluteUrl(href) {
  return new URL(href, "https://www.celma.org.cn/").toString();
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
  return "";
}

function buildAttachmentName(displayName, url, contentType = "") {
  const ext = inferExtension(displayName, url, contentType);
  const stem = sanitizeSegment(
    path.basename(displayName, path.extname(displayName)) || path.basename(new URL(url).pathname, path.extname(new URL(url).pathname)),
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

function extractAttachmentAnchors(html) {
  const $ = load(html);
  return $("a")
    .map((_, el) => {
      const href = $(el).attr("href") || "";
      const text = cleanText($(el).text() || $(el).attr("title") || "");
      if (!href) return null;
      const combined = `${href} ${text}`;
      const isAttachment =
        /uploadFiles\//i.test(href) ||
        /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(href) ||
        /附件|下载/i.test(combined);
      if (!isAttachment) return null;
      return {
        url: absoluteUrl(href),
        display_name: text || path.basename(new URL(absoluteUrl(href)).pathname),
      };
    })
    .get()
    .filter((item) => item && item.display_name);
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
    // folder doesn't exist yet
  }
  return null;
}

async function downloadAttachment(attachment, folderPath, folderRelativePath, reservedNames) {
  try {
    const existingFile = await findExistingFile(folderPath, attachment);
    if (existingFile) {
      reservedNames?.add(existingFile);
      return {
        url: attachment.url,
        display_name: attachment.display_name,
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
      local_file_name: null,
      local_file_path: null,
      download_status: "failed",
      error: err instanceof Error ? err.message : String(err),
      skipped: false,
    };
  }
}

async function main() {
  // 支持 --since=YYYY-MM-DD 参数，只下载该日期之后的公告
  const sinceArg = process.argv.find((a) => a.startsWith("--since="));
  const sinceDate = sinceArg ? sinceArg.split("=")[1] : null;

  // Load dataset
  const raw = await readFile(INPUT_PATH, "utf8");
  const dataset = JSON.parse(raw);
  let preIssuanceItems = dataset.items.filter((i) => i.category === "发行前公告");
  if (sinceDate) {
    preIssuanceItems = preIssuanceItems.filter((i) => i.date && i.date >= sinceDate);
    console.log(`筛选 date >= ${sinceDate}，共 ${preIssuanceItems.length} 条发行前公告`);
  } else {
    console.log(`共 ${preIssuanceItems.length} 条发行前公告需要处理`);
  }

  await mkdir(ATTACHMENTS_ROOT, { recursive: true });

  // Allocate folder names
  const usedFolders = new Set();
  const folderById = new Map();
  for (const item of preIssuanceItems) {
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

  // Also update the JSON items with attachment info
  const itemMap = new Map(dataset.items.map((i) => [i.id, i]));

  const results = await mapWithConcurrency(preIssuanceItems, DETAIL_CONCURRENCY, async (item, index) => {
    await sleep(80 + Math.random() * 150);

    const folderName = folderById.get(item.id);
    const folderPath = path.join(ATTACHMENTS_ROOT, folderName);
    const folderRelativePath = `data/celma-pre-issuance-attachments/${folderName}`;
    await mkdir(folderPath, { recursive: true });

    try {
      const detailHtml = await fetchText(item.url);
      const rawAttachments = extractAttachmentAnchors(detailHtml);
      const uniqueAttachments = [...new Map(rawAttachments.map((a) => [a.url, a])).values()];

      const reservedNames = new Set();
      const downloadResults = await mapWithConcurrency(uniqueAttachments, ATTACHMENT_CONCURRENCY, async (att) => {
        return downloadAttachment(att, folderPath, folderRelativePath, reservedNames);
      });

      const skipped = downloadResults.filter((r) => r.skipped).length;
      const downloaded = downloadResults.filter((r) => !r.skipped && r.download_status === "success").length;
      const failed = downloadResults.filter((r) => r.download_status === "failed").length;
      skippedDownloads += skipped;
      newDownloads += downloaded;
      failedDownloads += failed;

      // Update item
      const jsonItem = itemMap.get(item.id);
      if (jsonItem) {
        jsonItem.attachment_count = downloadResults.length;
        jsonItem.attachments = downloadResults.map((r) => ({
          url: r.url,
          display_name: r.display_name,
          local_file_name: r.local_file_name,
          local_file_path: r.local_file_path,
          download_status: r.download_status,
          error: r.error,
        }));
      }

      // Build log entries
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
      if (processedCount % 50 === 0 || processedCount === preIssuanceItems.length) {
        console.log(
          `  [${processedCount}/${preIssuanceItems.length}] 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`,
        );
      }
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
      if (processedCount % 50 === 0) {
        console.log(
          `  [${processedCount}/${preIssuanceItems.length}] 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`,
        );
      }
    }
  });

  // Write download log (字段顺序参照 celma-major-events-attachments/download-log.csv，额外增加 公告日期)
  const csvHeader = ["标题", "公告日期", "页面 url", "附件显示文件名", "附件 url", "下载是否成功", "失败原因", "本地文件路径"];
  const csvRows = allLogEntries.map((e) =>
    [e.title, e.date, e.page_url, e.attachment_display_name, e.attachment_url, e.download_success, e.failure_reason, e.local_file_path]
      .map(csvEscape)
      .join(","),
  );
  const csvContent = [csvHeader.map(csvEscape).join(","), ...csvRows].join("\n");
  await writeFile(LOG_PATH, `${csvContent}\n`, "utf8");
  console.log(`\nDownload log written to ${LOG_PATH}`);

  // Write updated JSON with attachment info
  await writeFile(INPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Updated ${INPUT_PATH} with attachment metadata`);

  console.log(`\n--- Summary ---`);
  console.log(`Total items: ${preIssuanceItems.length}`);
  console.log(`New downloads: ${newDownloads}`);
  console.log(`Skipped (already exists): ${skippedDownloads}`);
  console.log(`Failed: ${failedDownloads}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
