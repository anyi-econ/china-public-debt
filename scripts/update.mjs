import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const DATA_PATH = path.join(process.cwd(), "data", "bundle.json");
const SOURCE_PATH = path.join(process.cwd(), "data", "source-catalog.json");
const mode = process.argv[2] ?? "weekly";

async function main() {
  const bundle = await readJson(DATA_PATH);
  const sourceCatalog = await readJson(SOURCE_PATH);
  const now = new Date().toISOString().slice(0, 10);

  const sourceStatus = [];
  const newPolicies = [];
  const newNews = [];
  const newPapers = [];
  const debtClues = [];
  const newUpdates = [];

  for (const source of sourceCatalog) {
    try {
      const records = await scrapeSource(source);

      if (source.category === "policy") {
        const mapped = await Promise.all(records.map(mapPolicy));
        const inserted = mergeUnique(bundle.policies, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newPolicies.push(...inserted.added);
      }

      if (source.category === "news") {
        const mapped = await Promise.all(records.map(mapNews));
        const inserted = mergeUnique(bundle.news, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newNews.push(...inserted.added);
      }

      if (source.category === "paper") {
        const mapped = await Promise.all(records.map(mapPaper));
        const inserted = mergeUnique(bundle.papers, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newPapers.push(...inserted.added);
      }

      if (source.category === "debt") {
        debtClues.push(...records);
      }

      sourceStatus.push({
        name: source.name,
        category: source.category,
        status: "success",
        message: buildStatusMessage(source, records.length),
        updatedAt: now
      });
    } catch (error) {
      const fallback = source.fallback ?? [];

      if (source.category === "policy") {
        const mapped = await Promise.all(fallback.map(mapPolicy));
        const inserted = mergeUnique(bundle.policies, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newPolicies.push(...inserted.added);
      }

      if (source.category === "news") {
        const mapped = await Promise.all(fallback.map(mapNews));
        const inserted = mergeUnique(bundle.news, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newNews.push(...inserted.added);
      }

      if (source.category === "paper") {
        const mapped = await Promise.all(fallback.map(mapPaper));
        const inserted = mergeUnique(bundle.papers, mapped, (item) => `${item.url}-${normalizeTitle(item.title)}`);
        newPapers.push(...inserted.added);
      }

      if (source.category === "debt") {
        debtClues.push(...fallback);
      }

      sourceStatus.push({
        name: source.name,
        category: source.category,
        status: source.method === "manual" || source.category === "debt" ? "fallback" : "fallback",
        message: `${source.description}；本次使用兜底记录。${getErrorMessage(error)}`,
        updatedAt: now
      });
    }
  }

  for (const item of newPolicies) {
    newUpdates.push(makeUpdate(item.title, item.date, "policy", item.source, "自动补充政策条目并完成基础标签归档。"));
  }
  for (const item of newNews) {
    newUpdates.push(makeUpdate(item.title, item.date, "news", item.source, "自动补充新闻讨论条目，建议复核摘要和主题标签。"));
  }
  for (const item of newPapers) {
    newUpdates.push(makeUpdate(item.title, `${item.year}-01-01`, "paper", item.source, "自动同步开放文献元数据，建议补充作者机构和摘要。"));
  }
  for (const item of debtClues.slice(0, 6)) {
    newUpdates.push(makeUpdate(item.title, item.date, "debt", item.source, "同步官方债务动态线索，建议结合月度统计口径补录结构化指标。"));
  }

  bundle.metadata.lastUpdated = now;
  bundle.metadata.updateMode = mode;
  bundle.metadata.sourceStatus = sourceStatus;
  bundle.updates = dedupeUpdates([...newUpdates, ...bundle.updates]).slice(0, 100);

  await fs.writeFile(DATA_PATH, JSON.stringify(bundle, null, 2), "utf-8");
  console.log(`更新完成：政策 ${newPolicies.length} 条，新闻 ${newNews.length} 条，文献 ${newPapers.length} 条。`);
}

function buildStatusMessage(source, count) {
  if (source.category === "debt") {
    return `${source.description}；当前记录 ${count} 条线索，建议人工核对并补入结构化指标。`;
  }
  return `${source.description}；本次抓取获得 ${count} 条候选记录。`;
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function scrapeSource(source) {
  if (source.method === "manual") {
    throw new Error("manual source configured");
  }

  if (source.method === "api" && source.url.includes("openalex.org")) {
    return scrapeOpenAlex(source.url);
  }

  if (source.method === "api" && source.url.includes("crossref.org")) {
    return scrapeCrossref(source.url);
  }

  if (source.method === "html") {
    return scrapeHtml(source);
  }

  throw new Error(`Unsupported source: ${source.name}`);
}

async function scrapeOpenAlex(url) {
  const response = await fetch(url, { headers: { "User-Agent": "DebtTracker/0.1" } });
  if (!response.ok) {
    throw new Error(`OpenAlex HTTP ${response.status}`);
  }
  const data = await response.json();
  return (data.results ?? [])
    .filter((item) => item.title)
    .map((item) => ({
      title: normalizeText(item.title ?? ""),
      date: `${item.publication_year ?? new Date().getFullYear()}-01-01`,
      source: "OpenAlex",
      url: item.id ?? "https://openalex.org/",
      summary: "来自 OpenAlex 的检索结果，适合作为英文论文与工作论文的持续样本池。",
      tags: ["OpenAlex", "政府债务", "中国"],
      category: item.primary_location?.source?.display_name ?? "Working Paper"
    }));
}

async function scrapeCrossref(url) {
  const response = await fetch(url, { headers: { "User-Agent": "DebtTracker/0.1" } });
  if (!response.ok) {
    throw new Error(`Crossref HTTP ${response.status}`);
  }
  const data = await response.json();
  return (data.message?.items ?? [])
    .filter((item) => item.title?.[0])
    .map((item) => ({
      title: normalizeText(item.title?.[0] ?? ""),
      date: `${item.issued?.['date-parts']?.[0]?.[0] ?? new Date().getFullYear()}-01-01`,
      source: "Crossref",
      url: item.URL ?? "https://search.crossref.org/",
      summary: "来自 Crossref 的文献元数据，适合作为期刊论文补充来源。",
      tags: ["Crossref", "政府债务", "文献检索"],
      category: item.type ?? "journal-article"
    }));
}

async function scrapeHtml(source) {
  const response = await fetch(source.url, { headers: { "User-Agent": "Mozilla/5.0 DebtTrackerBot/0.1" } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const listSelector = source.selectors?.list ?? "li";
  const titleSelector = source.selectors?.title ?? "a";
  const linkSelector = source.selectors?.link ?? titleSelector;
  const dateSelector = source.selectors?.date;

  const items = $(listSelector)
    .slice(0, 10)
    .map((_, element) => {
      const root = $(element);
      const title = normalizeText(root.find(titleSelector).first().text());
      const href = root.find(linkSelector).first().attr("href");
      const dateText = dateSelector ? normalizeText(root.find(dateSelector).first().text()) : "";
      if (!title || !href) {
        return null;
      }
      return {
        title,
        date: parseChineseDate(dateText) ?? new Date().toISOString().slice(0, 10),
        source: guessSourceName(source),
        url: makeAbsoluteUrl(source.url, href),
        summary: fallbackSummary(title),
        tags: source.tags ?? [],
        category: source.categoryName ?? "未分类"
      };
    })
    .get()
    .filter(Boolean);

  if (!items.length) {
    throw new Error("No items parsed");
  }

  return items;
}

async function mapPolicy(item) {
  const summary = await maybeSummarize(item, "policy");
  return {
    id: `policy-${slugify(item.title)}-${slugify(item.date)}`,
    title: item.title,
    date: item.date,
    source: item.source,
    category: item.category ?? "债务管理",
    tags: uniqueStrings(item.tags ?? []),
    summary,
    url: item.url
  };
}

async function mapNews(item) {
  const summary = await maybeSummarize(item, "news");
  return {
    id: `news-${slugify(item.title)}-${slugify(item.date)}`,
    title: item.title,
    date: item.date,
    source: item.source,
    tags: uniqueStrings(item.tags ?? []),
    summary,
    url: item.url
  };
}

async function mapPaper(item) {
  const summary = await maybeSummarize(item, "paper");
  const year = Number(String(item.date).slice(0, 4)) || new Date().getFullYear();
  return {
    id: `paper-${slugify(item.title)}-${year}`,
    title: item.title,
    authors: item.authors ?? ["待补充"],
    year,
    venue: item.category ?? "Working Paper",
    abstract: summary,
    keywords: uniqueStrings(item.tags ?? ["政府债务", "中国"]),
    url: item.url,
    source: item.source
  };
}

async function maybeSummarize(item, type) {
  if (!process.env.LLM_API_KEY) {
    return item.summary ?? fallbackSummary(item.title, type);
  }

  try {
    const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
    const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是研究平台的数据摘要助手。请用中文输出一句到两句专业、客观、无夸张的摘要，不要加标题。"
          },
          {
            role: "user",
            content: `类型：${type}\n标题：${item.title}\n来源：${item.source}\n已有摘要：${item.summary ?? "无"}`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`LLM HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return normalizeText(content || item.summary || fallbackSummary(item.title, type));
  } catch {
    return item.summary ?? fallbackSummary(item.title, type);
  }
}

function mergeUnique(existing, incoming, keyFn) {
  const existingKeys = new Set(existing.map(keyFn));
  const added = [];

  for (const item of incoming) {
    const key = keyFn(item);
    const duplicateByTitle = existing.some((current) => isNearDuplicate(current.title, item.title) && sameDay(current, item));
    if (!existingKeys.has(key) && !duplicateByTitle) {
      existing.unshift(item);
      existingKeys.add(key);
      added.push(item);
    }
  }

  return { added };
}

function sameDay(current, incoming) {
  if (!current.date || !incoming.date) {
    return false;
  }
  return String(current.date).slice(0, 10) === String(incoming.date).slice(0, 10);
}

function dedupeUpdates(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}-${item.date}-${normalizeTitle(item.title)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isNearDuplicate(a, b) {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  if (!left || !right) {
    return false;
  }
  if (left === right || left.includes(right) || right.includes(left)) {
    return true;
  }
  const leftTokens = new Set(left.split(" "));
  const rightTokens = new Set(right.split(" "));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size || 1;
  return intersection / union >= 0.72;
}

function normalizeTitle(input) {
  return normalizeText(String(input).toLowerCase().replace(/[【】《》“”"'：:()（）,，。、]/g, " "));
}

function makeUpdate(title, date, type, source, note) {
  return {
    id: `update-${slugify(title)}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    date,
    type,
    title,
    source,
    status: "新增",
    note
  };
}

function parseChineseDate(input) {
  const normalized = String(input).replace(/[年/.]/g, "-").replace(/月/g, "-").replace(/日/g, "");
  const match = normalized.match(/\d{4}-\d{1,2}-\d{1,2}/);
  if (!match) {
    return null;
  }
  const [year, month, day] = match[0].split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function makeAbsoluteUrl(base, href) {
  if (href.startsWith("http")) {
    return href;
  }
  return new URL(href, base).toString();
}

function guessSourceName(source) {
  if (source.name.includes("财政部")) return "财政部";
  if (source.name.includes("中国政府网")) return "中国政府网";
  if (source.name.includes("地方政府债券信息公开平台")) return "中国地方政府债券信息公开平台";
  return source.name;
}

function fallbackSummary(title, type = "policy") {
  const prefix = type === "paper" ? "文献摘要" : type === "news" ? "讨论摘要" : "政策摘要";
  return `${prefix}：${title}。当前为规则摘要，建议后续补充正文解析与标签细化。`;
}

function uniqueStrings(items) {
  return [...new Set((items ?? []).map((item) => normalizeText(item)).filter(Boolean))];
}

function normalizeText(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "unknown error";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
