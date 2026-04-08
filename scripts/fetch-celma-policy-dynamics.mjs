import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.resolve(__dirname, "../data/celma-policy-dynamics.json");
const ATTACHMENTS_ROOT = path.resolve(__dirname, "../data/celma-major-events-attachments");
const LOG_PATH = path.join(ATTACHMENTS_ROOT, "download-log.csv");
const SOURCE_NAME = "中国地方政府债券信息公开平台 / celma";
const MAJOR_EVENT_CATEGORY = "重大事项";

const SECTION_PAGE_CONCURRENCY = parsePositiveInteger(process.env.CELMA_SECTION_CONCURRENCY, 3);
const DETAIL_CONCURRENCY = parsePositiveInteger(process.env.CELMA_DETAIL_CONCURRENCY, 5);
const ATTACHMENT_CONCURRENCY = parsePositiveInteger(process.env.CELMA_ATTACHMENT_CONCURRENCY, 2);

const REGION_CANDIDATES = [
  "新疆生产建设兵团",
  "新疆兵团",
  "内蒙古自治区",
  "广西壮族自治区",
  "西藏自治区",
  "宁夏回族自治区",
  "新疆维吾尔自治区",
  "北京市",
  "天津市",
  "上海市",
  "重庆市",
  "河北省",
  "山西省",
  "辽宁省",
  "吉林省",
  "黑龙江省",
  "江苏省",
  "浙江省",
  "安徽省",
  "福建省",
  "江西省",
  "山东省",
  "河南省",
  "湖北省",
  "湖南省",
  "广东省",
  "海南省",
  "四川省",
  "贵州省",
  "云南省",
  "陕西省",
  "甘肃省",
  "青海省",
  "台湾省",
  "香港特别行政区",
  "澳门特别行政区",
  "大连市",
  "青岛市",
  "宁波市",
  "厦门市",
  "深圳市",
].sort((left, right) => right.length - left.length);

const TOPIC_RULES = [
  // 顺序重要：先匹配具体的，再匹配宽泛的
  ["资金用途调整", /调整(?:部分|新增)?(?:地方)?政府?(?:专项)?债券(?:资金)?用途|用途调整|调整.*用途|债券用途|资金用途|一案两书|一案二书|调整.*专项债券|调整.*债券项目|调整.*用作.*资本金|资金调整|调整使用情况/],
  ["跟踪评级", /跟踪评级|评级报告|信用评级|评级公告/],
  ["偿还与置换", /提前偿还|偿还.*债券|置换.*债券|再融资.*债券|还本.*调整|还本金额/],
  ["项目变更", /重大事项(?:调整|变更)|项目变更|变更情况|变更.*披露|变更为.*债券/],
  ["发行与披露", /发行.*(?:通知|公告|结果|有关事项)|承销团|信息披露文件|披露文件|募集说明书|法律意见书|财务评价报告|实施方案|存续期公开|存续期信息|簿记建档|发债|自行发债|发行的新增.*债券|招标|柜台业务/],
  ["信息披露与更正", /更正|更正声明|信息的公告|收款账户/],
  ["债务限额", /债务限额/],
  ["隐性债务", /隐性债务|违法违规融资|问责.*案例/],
  ["预决算与财政数据", /经济.*(?:财政|数据)|财政.*(?:经济|数据)|预算.*收支|公共预算/],
  ["人事变动", /董事.*变动|总经理.*变动|人事.*变动/],
];

const SECTIONS = [
  {
    key: "market-major",
    categoryLevel1: "债券市场动态",
    categoryLevel2: "重大事项",
    url: "https://www.celma.org.cn/zqsclb.jhtml?ad_code=87&channelId=221",
    pageType: "iframe-list",
    itemSelector: "#tagBean1 li.current",
  },
  {
    key: "market-budget",
    categoryLevel1: "债券市场动态",
    categoryLevel2: "预决算公开",
    url: "https://www.celma.org.cn/zqsclb.jhtml?ad_code=87&channelId=317",
    pageType: "iframe-list",
    itemSelector: ".content-li-css li.current",
  },
  {
    key: "regulation",
    categoryLevel1: "政策法规",
    categoryLevel2: null,
    url: "https://www.celma.org.cn/zcfg/index.jhtml",
    pageType: "index-list",
    itemSelector: ".content-li-css li.current",
  },
  {
    key: "interpretation",
    categoryLevel1: "政策解读",
    categoryLevel2: null,
    url: "https://www.celma.org.cn/zcjd/index.jhtml",
    pageType: "index-list",
    itemSelector: ".content-li-css li.current",
  },
];

function absoluteUrl(url) {
  return new URL(url, "https://www.celma.org.cn/").toString();
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function pageUrl(section, page) {
  if (page === 1) {
    return section.url;
  }

  if (section.pageType === "iframe-list") {
    const channelId = new URL(section.url).searchParams.get("channelId");
    return `https://www.celma.org.cn/zqsclb_${page}.jhtml?ad_code=87&channelId=${channelId}`;
  }

  return section.url.replace(/index\.jhtml$/, `index_${page}.jhtml`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, Math.max(items.length, 1));
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}

async function fetchText(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status} for ${url}`);
    }

    return await response.text();
  } catch (error) {
    if (attempt < 2) {
      await sleep(800 + Math.random() * 400);
      return fetchText(url, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBinary(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        referer: "https://www.celma.org.cn/",
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status} for ${url}`);
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") || "",
    };
  } catch (error) {
    if (attempt < 2) {
      await sleep(800 + Math.random() * 400);
      return fetchBinary(url, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildStableId(sectionKey, url) {
  const normalized = url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `celma-${sectionKey}-${normalized.slice(-120)}`;
}

function extractCounts(html) {
  const totalItems = Number(html.match(/共\s*(\d+)\s*条/)?.[1] ?? 0);
  const totalPages = Number(html.match(/共\s*(\d+)\s*页/)?.[1] ?? 1);
  return { totalItems, totalPages };
}

function sanitizeSegment(value, maxLength = 80) {
  const cleaned = cleanText(value)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/[\u200b-\u200f\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "untitled";
  }

  return cleaned.slice(0, maxLength).trim().replace(/[.\s]+$/g, "") || "untitled";
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function loadExistingDataset() {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(content);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return {
      payload: parsed,
      byUrl: new Map(items.map((item) => [item.url, item])),
    };
  } catch {
    return {
      payload: null,
      byUrl: new Map(),
    };
  }
}

function mergeExistingItem(baseItem, existingItem) {
  if (!existingItem) {
    return baseItem;
  }

  return {
    ...existingItem,
    ...baseItem,
    region: existingItem.region ?? baseItem.region,
    region_normalized: existingItem.region_normalized ?? baseItem.region_normalized,
    topic: existingItem.topic ?? baseItem.topic,
    attachments: Array.isArray(existingItem.attachments) ? existingItem.attachments : baseItem.attachments,
    attachment_count: typeof existingItem.attachment_count === "number" ? existingItem.attachment_count : baseItem.attachment_count,
    local_attachment_folder: existingItem.local_attachment_folder ?? baseItem.local_attachment_folder,
    summary: existingItem.summary ?? baseItem.summary,
    snippet: existingItem.snippet ?? baseItem.snippet,
  };
}

async function hasUsableLocalArchive(item) {
  if (!item?.local_attachment_folder) {
    return false;
  }

  const folderPath = path.resolve(__dirname, "..", item.local_attachment_folder.replace(/^data\//, "data/"));
  if (!(await pathExists(folderPath))) {
    return false;
  }

  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  if (attachments.length === 0) {
    return true;
  }

  for (const attachment of attachments) {
    if (attachment?.download_status !== "success" || !attachment?.local_file_path) {
      return false;
    }

    const filePath = path.resolve(__dirname, "..", attachment.local_file_path.replace(/^data\//, "data/"));
    if (!(await pathExists(filePath))) {
      return false;
    }
  }

  return true;
}

function extractRegionFromText(text) {
  const normalizedText = cleanText(text);

  for (const candidate of REGION_CANDIDATES) {
    if (normalizedText.includes(candidate)) {
      return { region: candidate, region_normalized: candidate };
    }
  }

  if (/财政部|国务院|全国人大|国家发展改革委|国家发展改革委员会/.test(normalizedText)) {
    return { region: "全国", region_normalized: "全国" };
  }

  return { region: "全国", region_normalized: "全国" };
}

function determineTopic(title, attachmentNames = []) {
  // First try matching on title alone
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(title)) {
      return topic;
    }
  }
  // Then try matching on combined title + attachment names
  const combined = title + " " + attachmentNames.join(" ");
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(combined)) {
      return topic;
    }
  }
  return "其他";
}

function inferExtension(displayName, url, contentType = "") {
  const displayExt = path.extname(displayName);
  if (displayExt) {
    return displayExt;
  }

  const urlExt = path.extname(new URL(url).pathname);
  if (urlExt) {
    return urlExt;
  }

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
  const parsedUrl = new URL(url);
  const stem = sanitizeSegment(
    path.basename(displayName, path.extname(displayName)) || path.basename(parsedUrl.pathname, path.extname(parsedUrl.pathname)),
    120
  );
  return `${stem}${ext}`;
}

async function allocateFilePath(dirPath, preferredName, reservedNames = null) {
  const ext = path.extname(preferredName);
  const stem = path.basename(preferredName, ext);

  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const candidateName = attempt === 0 ? preferredName : `${stem}-${attempt + 1}${ext}`;

    if (reservedNames?.has(candidateName)) {
      continue;
    }

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

function extractItems(html, section) {
  const $ = load(html);

  return $(section.itemSelector)
    .map((_, element) => {
      const anchor = $(element).find("a").first();
      const href = anchor.attr("href");
      const title = cleanText(anchor.attr("title") || anchor.text());
      const dateText = cleanText($(element).find("span").last().text());
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : null;

      if (!href || !title) {
        return null;
      }

      const url = absoluteUrl(href);
      const regionInfo = extractRegionFromText(title);
      const isMajorEvent = section.categoryLevel2 === MAJOR_EVENT_CATEGORY;
      const topic = isMajorEvent ? determineTopic(title) : null;

      return {
        id: buildStableId(section.key, url),
        title,
        url,
        date,
        source: SOURCE_NAME,
        category_level1: section.categoryLevel1,
        category_level2: section.categoryLevel2,
        region: regionInfo.region,
        region_normalized: regionInfo.region_normalized,
        topic,
        attachments: [],
        attachment_count: 0,
        local_attachment_folder: null,
        summary: isMajorEvent ? null : `${regionInfo.region_normalized} · ${section.categoryLevel1}${section.categoryLevel2 ? ` · ${section.categoryLevel2}` : ""}`,
        snippet: isMajorEvent ? null : `${title} · ${date ?? "无日期"}`,
      };
    })
    .get()
    .filter(Boolean);
}

async function fetchSection(section) {
  const firstHtml = await fetchText(section.url);
  const counts = extractCounts(firstHtml);
  const remainingPages = Array.from({ length: Math.max(counts.totalPages - 1, 0) }, (_, index) => index + 2);
  const remainingItems = await mapWithConcurrency(remainingPages, SECTION_PAGE_CONCURRENCY, async (page) => {
    const html = await fetchText(pageUrl(section, page));
    return extractItems(html, section);
  });
  const pages = [extractItems(firstHtml, section), ...remainingItems].flat();

  return {
    coverage: {
      category_level1: section.categoryLevel1,
      category_level2: section.categoryLevel2,
      path: new URL(section.url).pathname,
      totalPages: counts.totalPages,
      totalItems: counts.totalItems,
    },
    items: pages,
  };
}

function extractDetailContext(rootText, title) {
  const anchor = title.slice(0, Math.min(title.length, 18));
  const index = rootText.indexOf(anchor);
  if (index === -1) {
    return rootText.slice(0, 1500);
  }
  return rootText.slice(Math.max(0, index - 80), index + 1500);
}

function extractAttachmentAnchors(html) {
  const $ = load(html);

  return $("a")
    .map((_, element) => {
      const href = $(element).attr("href") || "";
      const text = cleanText($(element).text() || $(element).attr("title") || "");
      if (!href) {
        return null;
      }

      const combined = `${href} ${text}`;
      const isAttachment = /uploadFiles\//i.test(href) || /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(href) || /附件|下载/i.test(combined);
      if (!isAttachment) {
        return null;
      }

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
      const entryStem = path.basename(entry, path.extname(entry));
      const entryExt = path.extname(entry).toLowerCase();
      if (entryExt === expectedExt && entryStem === expectedStem) {
        const fp = path.join(folderPath, entry);
        const st = await stat(fp);
        if (st.isFile() && st.size > 0) {
          return entry;
        }
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
  } catch (error) {
    return {
      url: attachment.url,
      display_name: attachment.display_name,
      local_file_name: null,
      local_file_path: null,
      download_status: "failed",
      error: error instanceof Error ? error.message : String(error),
      skipped: false,
    };
  }
}

async function enrichMajorEvents(items, existingItemsByUrl) {
  await mkdir(ATTACHMENTS_ROOT, { recursive: true });

  const sortedMajorItems = items
    .filter((item) => item.category_level1 === "债券市场动态" && item.category_level2 === MAJOR_EVENT_CATEGORY)
    .sort((left, right) => (right.date ?? "").localeCompare(left.date ?? "") || left.title.localeCompare(right.title, "zh-CN"));

  const usedFolders = new Set();
  const folderById = new Map();

  for (const item of sortedMajorItems) {
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

  const majorEventResults = await mapWithConcurrency(sortedMajorItems, DETAIL_CONCURRENCY, async (item, index) => {
    // pace requests: small random delay to avoid bursting the server
    await sleep(100 + Math.random() * 200);

    const folderName = folderById.get(item.id);
    const folderPath = path.join(ATTACHMENTS_ROOT, folderName);
    const folderRelativePath = `data/celma-major-events-attachments/${folderName}`;
    await mkdir(folderPath, { recursive: true });

    item.local_attachment_folder = folderRelativePath;

    try {
      const detailHtml = await fetchText(item.url);
      const rootText = cleanText(load(detailHtml).root().text());
      const context = extractDetailContext(rootText, item.title);
      // Extract region from title first; fall back to detail context only if title gives no result
      const titleRegion = extractRegionFromText(item.title);
      const regionInfo = titleRegion.region !== "全国"
        ? titleRegion
        : extractRegionFromText(`${item.title} ${context}`);
      item.region = regionInfo.region;
      item.region_normalized = regionInfo.region_normalized;

      const rawAttachments = extractAttachmentAnchors(detailHtml);
      const uniqueAttachments = [...new Map(rawAttachments.map((attachment) => [attachment.url, attachment])).values()];
      const reservedNames = new Set();
      const downloadedAttachments = await mapWithConcurrency(uniqueAttachments, ATTACHMENT_CONCURRENCY, async (attachment) => {
        const result = await downloadAttachment(attachment, folderPath, folderRelativePath, reservedNames);
        return {
          attachment,
          result,
        };
      });

      // Determine topic using both title and attachment names
      const attNames = uniqueAttachments.map(a => a.display_name || "");
      item.topic = determineTopic(item.title, attNames);
      const logEntries = downloadedAttachments.map(({ attachment, result }) => ({
          title: item.title,
          page_url: item.url,
          attachment_display_name: attachment.display_name,
          attachment_url: attachment.url,
          download_success: result.download_status === "success" ? "yes" : "no",
          failure_reason: result.error ?? "",
          local_file_path: result.local_file_path ?? "",
        }));
      const attachmentResults = downloadedAttachments.map(({ result }) => result);

      const skippedCount = attachmentResults.filter(r => r.skipped).length;
      const downloadedCount = attachmentResults.filter(r => !r.skipped && r.download_status === 'success').length;
      const failedCount = attachmentResults.filter(r => r.download_status === 'failed').length;
      skippedDownloads += skippedCount;
      newDownloads += downloadedCount;
      failedDownloads += failedCount;

      item.attachments = attachmentResults;
      item.attachment_count = attachmentResults.length;
      item.summary = `${item.region_normalized ?? "全国"} · ${item.topic} · 附件 ${attachmentResults.length} 个`;
      item.snippet = attachmentResults.length > 0 ? `已同步 ${attachmentResults.length} 个附件到本地目录。` : "当前页面未发现可下载附件。";

      processedCount++;
      if (processedCount % 20 === 0 || processedCount === sortedMajorItems.length) {
        console.log(`  [${processedCount}/${sortedMajorItems.length}] 已处理, 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`);
      }
      return logEntries;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      item.topic = item.topic || determineTopic(item.title);
      item.attachments = [];
      item.attachment_count = 0;
      item.summary = `${item.region_normalized ?? "全国"} · ${item.topic} · 附件解析失败`;
      item.snippet = "详情页解析失败，请查看下载日志。";
      processedCount++;
      failedDownloads++;
      if (processedCount % 20 === 0) {
        console.log(`  [${processedCount}/${sortedMajorItems.length}] 已处理, 新下载 ${newDownloads}, 跳过 ${skippedDownloads}, 失败 ${failedDownloads}`);
      }
      return [{
        title: item.title,
        page_url: item.url,
        attachment_display_name: "",
        attachment_url: "",
        download_success: "no",
        failure_reason: message,
        local_file_path: "",
      }];
    }
  });

  const logEntries = majorEventResults.flat();

  const logContent = [
    ["标题", "页面 url", "附件显示文件名", "附件 url", "下载是否成功", "失败原因", "本地文件路径"].map(csvEscape).join(","),
    ...logEntries.map((entry) => [
      entry.title,
      entry.page_url,
      entry.attachment_display_name,
      entry.attachment_url,
      entry.download_success,
      entry.failure_reason,
      entry.local_file_path,
    ].map(csvEscape).join(",")),
  ].join("\n");

  await writeFile(LOG_PATH, `${logContent}\n`, "utf8");
}

async function main() {
  const existingDataset = await loadExistingDataset();
  const coverage = [];
  const itemsByUrl = new Map();

  for (const section of SECTIONS) {
    const result = await fetchSection(section);
    coverage.push(result.coverage);
    for (const item of result.items) {
      itemsByUrl.set(item.url, mergeExistingItem(item, existingDataset.byUrl.get(item.url)));
    }
  }

  const items = [...itemsByUrl.values()].sort((left, right) => {
    const dateCompare = (right.date ?? "").localeCompare(left.date ?? "");
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return left.title.localeCompare(right.title, "zh-CN");
  });

  await enrichMajorEvents(items, existingDataset.byUrl);

  const payload = {
    updatedAt: formatLocalDate(),
    source: {
      name: SOURCE_NAME,
      organization: "财政部政府债务研究和评估中心",
      url: "https://www.celma.org.cn/",
      note: "仅抓取债券市场动态中的重大事项、预决算公开，以及政策法规、政策解读四个可访问列表；脚本按公开分页全量抓取，并按 URL 去重。重大事项 iframe 页同时包含隐藏的问责结果公开块，抓取时已明确排除；重大事项附件已批量下载到本地目录并生成下载日志。",
    },
    coverage,
    items,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${items.length} CELMA policy items to ${OUTPUT_PATH}`);
  console.log(`Saved major-event attachments under ${ATTACHMENTS_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});