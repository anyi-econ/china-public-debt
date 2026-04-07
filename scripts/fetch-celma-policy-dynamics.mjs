import { writeFile } from "node:fs/promises";
import { load } from "cheerio";

const OUTPUT_PATH = new URL("../data/celma-policy-dynamics.json", import.meta.url);
const SOURCE_NAME = "中国地方政府债券信息公开平台 / celma";

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

function fetchText(url, attempt = 1) {
  return (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

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
      if (attempt < 3) {
        await sleep(500 * attempt);
        return fetchText(url, attempt + 1);
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  })();
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

      return {
        id: buildStableId(section.key, url),
        title,
        url,
        date,
        source: SOURCE_NAME,
        category_level1: section.categoryLevel1,
        category_level2: section.categoryLevel2,
        summary: null,
        snippet: null,
      };
    })
    .get()
    .filter(Boolean);
}

async function fetchSection(section) {
  const firstHtml = await fetchText(section.url);
  const counts = extractCounts(firstHtml);
  const pages = [];

  for (let page = 1; page <= counts.totalPages; page += 1) {
    const url = pageUrl(section, page);
    const html = page === 1 ? firstHtml : await fetchText(url);
    pages.push(...extractItems(html, section));
  }

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

async function main() {
  const coverage = [];
  const itemsByUrl = new Map();

  for (const section of SECTIONS) {
    const result = await fetchSection(section);
    coverage.push(result.coverage);
    for (const item of result.items) {
      itemsByUrl.set(item.url, item);
    }
  }

  const items = [...itemsByUrl.values()].sort((left, right) => {
    const dateCompare = (right.date ?? "").localeCompare(left.date ?? "");
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return left.title.localeCompare(right.title, "zh-CN");
  });

  const payload = {
    updatedAt: formatLocalDate(),
    source: {
      name: SOURCE_NAME,
      organization: "财政部政府债务研究和评估中心",
      url: "https://www.celma.org.cn/",
      note: "仅抓取债券市场动态中的重大事项、预决算公开，以及政策法规、政策解读四个可访问列表；脚本按公开分页全量抓取，并按 URL 去重。重大事项 iframe 页同时包含隐藏的问责结果公开块，抓取时已明确排除。",
    },
    coverage,
    items,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${items.length} CELMA policy items to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});