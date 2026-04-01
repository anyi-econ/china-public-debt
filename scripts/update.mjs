import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const DATA_PATH = path.join(process.cwd(), "data", "bundle.json");
const SOURCE_PATH = path.join(process.cwd(), "data", "source-catalog.json");
const REPORT_PATH = path.join(process.cwd(), "data", "reports.json");
const INDEX_PATH = path.join(process.cwd(), "data", "crawl-index.json");

const mode = process.argv[2] ?? "monthly";
const args = process.argv.slice(3);
const monthArg = args.find((arg) => arg.startsWith("--month="))?.split("=")[1];
const targetMonth = normalizeMonth(monthArg ?? defaultTargetMonth());
const today = new Date().toISOString().slice(0, 10);

async function main() {
  const bundle = await readJson(DATA_PATH);
  const sources = await readJson(SOURCE_PATH);
  const reports = await readJson(REPORT_PATH);
  const crawlIndex = await readJson(INDEX_PATH);

  const newPolicies = [];
  const newDebt = [];
  const newNews = [];
  const newPapers = [];
  const sourceStatus = [];

  for (const source of sources) {
    const fallbackRecords = filterByMonth(source.fallback ?? [], targetMonth);

    if (source.navigationOnly || source.automation === "disabled") {
      sourceStatus.push({
        name: source.name,
        category: source.category,
        status: "fallback",
        message: source.notes ?? "该来源当前仅作为导航源保留，不执行自动抓取。",
        updatedAt: today
      });
      continue;
    }

    let records = [];
    try {
      if (source.automation === "auto" && source.method !== "manual") {
        records = filterByMonth(await scrapeSource(source), targetMonth);
      }

      if (!records.length) {
        records = fallbackRecords;
      }

      const inserted = mergeSourceRecords({
        bundle,
        crawlIndex,
        records,
        source,
        seenAt: today
      });

      newPolicies.push(...inserted.policies);
      newDebt.push(...inserted.debt);
      newNews.push(...inserted.news);
      newPapers.push(...inserted.papers);

      sourceStatus.push({
        name: source.name,
        category: source.category,
        status: records.length ? "success" : "fallback",
        message: buildStatusMessage(source, records.length),
        updatedAt: today
      });
    } catch (error) {
      const inserted = mergeSourceRecords({
        bundle,
        crawlIndex,
        records: fallbackRecords,
        source,
        seenAt: today
      });

      newPolicies.push(...inserted.policies);
      newDebt.push(...inserted.debt);
      newNews.push(...inserted.news);
      newPapers.push(...inserted.papers);

      sourceStatus.push({
        name: source.name,
        category: source.category,
        status: "fallback",
        message: `${source.notes ?? source.description}；本次使用兜底记录。${getErrorMessage(error)}`,
        updatedAt: today
      });
    }
  }

  const monthRecords = {
    policies: bundle.policies.filter((item) => monthOf(item.date) === targetMonth),
    debt: bundle.debt.filter((item) => monthOf(item.date) === targetMonth),
    news: bundle.news.filter((item) => monthOf(item.date) === targetMonth),
    papers: bundle.papers.filter((item) => monthOf(item.date ?? `${item.year}-01-01`) === targetMonth)
  };

  const brief = await buildMonthlyBrief({
    month: targetMonth,
    mode,
    today,
    records: monthRecords,
    fallbackPapers: bundle.papers.slice(0, 3)
  });

  upsertReport(reports, brief);

  bundle.metadata.lastUpdated = today;
  bundle.metadata.updateMode = mode;
  bundle.metadata.sourceStatus = sourceStatus;
  bundle.updates = dedupeUpdates([
    makeUpdate(`生成 ${formatMonthLabel(targetMonth)}中国政府债务月度简报`, today, "policy", "系统简报生成器", `基于 ${targetMonth} 元数据生成月度简报并完成归档。`),
    ...bundle.updates
  ]).slice(0, 150);

  await writeJson(DATA_PATH, bundle);
  await writeJson(REPORT_PATH, reports);
  await writeJson(INDEX_PATH, crawlIndex);

  console.log(
    `完成 ${targetMonth} 更新：政策 ${newPolicies.length} 条，债务 ${newDebt.length} 条，新闻 ${newNews.length} 条，文献 ${newPapers.length} 条，简报已生成。`
  );
}

function mergeSourceRecords({ bundle, crawlIndex, records, source, seenAt }) {
  const inserted = { policies: [], debt: [], news: [], papers: [] };

  for (const record of records) {
    const crawlKey = buildCrawlKey(source.category, record);
    const existing = crawlIndex.find((item) => item.key === crawlKey);

    if (existing) {
      existing.lastSeenAt = seenAt;
      continue;
    }

    if (source.category === "policy") {
      const item = mapPolicy(record);
      if (!bundle.policies.some((current) => current.id === item.id || current.url === item.url)) {
        bundle.policies.unshift(item);
        inserted.policies.push(item);
      }
      crawlIndex.unshift(makeIndexEntry(crawlKey, record, source.category, item.id, seenAt));
    }

    if (source.category === "debt") {
      const item = mapDebt(record);
      if (item && !bundle.debt.some((current) => current.id === item.id || (current.url && current.url === item.url && current.metricType === item.metricType))) {
        bundle.debt.unshift(item);
        inserted.debt.push(item);
      }
      if (item) {
        crawlIndex.unshift(makeIndexEntry(crawlKey, record, source.category, item.id, seenAt));
      }
    }

    if (source.category === "news") {
      const item = mapNews(record);
      if (!bundle.news.some((current) => current.id === item.id || current.url === item.url)) {
        bundle.news.unshift(item);
        inserted.news.push(item);
      }
      crawlIndex.unshift(makeIndexEntry(crawlKey, record, source.category, item.id, seenAt));
    }

    if (source.category === "paper") {
      const item = mapPaper(record);
      if (!bundle.papers.some((current) => current.id === item.id || current.url === item.url)) {
        bundle.papers.unshift(item);
        inserted.papers.push(item);
      }
      crawlIndex.unshift(makeIndexEntry(crawlKey, record, source.category, item.id, seenAt));
    }
  }

  return inserted;
}

async function buildMonthlyBrief({ month, mode, today, records, fallbackPapers }) {
  const policyItems = records.policies.slice(0, 4);
  const debtItems = records.debt.slice(0, 6);
  const newsItems = records.news.slice(0, 4);
  const paperItems = records.papers.length ? records.papers.slice(0, 3) : fallbackPapers.slice(0, 3);

  const rawSections = {
    policy: {
      title: "核心政策动态",
      summary: buildPolicySummary(policyItems, month),
      bullets: policyItems.length
        ? policyItems.map((item) => `${item.title}（${item.source}，${item.date}）`)
        : ["本月未自动发现新增政策元数据，建议人工补充重要政策链接。"]
    },
    data: {
      title: "关键数据概览",
      summary: buildDebtSummary(debtItems, month),
      bullets: debtItems.length
        ? debtItems.slice(0, 3).map((item) => `${item.date}：${item.bondType}${item.value.toLocaleString("zh-CN")}${item.unit}`)
        : ["本月暂无新增月度债务统计记录。"]
    },
    news: {
      title: "新闻焦点",
      summary: buildNewsSummary(newsItems, month),
      bullets: newsItems.length
        ? newsItems.map((item) => `${item.title}（${item.source}）`)
        : ["本月暂无自动收录的公开讨论元数据。"]
    },
    papers: {
      title: "文献观点",
      summary: buildPaperSummary(records.papers, fallbackPapers, month),
      bullets: paperItems.length
        ? paperItems.map((item) => `${item.title}（${item.source}）`)
        : ["本月未新增开放可核验文献元数据。"]
    }
  };

  const analysisSummary = buildAnalysisSummary({
    month,
    policyCount: records.policies.length,
    debtCount: records.debt.length,
    newsCount: records.news.length,
    paperCount: records.papers.length
  });

  const sections = process.env.LLM_API_KEY
    ? await maybeEnhanceBriefWithLlm(rawSections, analysisSummary, month)
    : {
        ...rawSections,
        analysis: {
          title: "简要分析",
          summary: analysisSummary,
          bullets: [
            `${formatMonthLabel(month)}的信息重心集中在预算安排与月度债务统计。`,
            "后续应重点追踪专项债发行节奏、部委解释口径与地方化债政策推进。",
            "文献部分在首版中继续采用开放来源和手动导入并行机制。"
          ]
        }
      };

  return {
    id: `brief-${month}`,
    month,
    title: `${formatMonthLabel(month)}中国政府债务与地方债简报`,
    generatedAt: today,
    mode,
    sourceCounts: {
      policy: records.policies.length,
      debt: records.debt.length,
      news: records.news.length,
      paper: records.papers.length
    },
    highlights: [
      sections.policy.bullets[0] ?? `${formatMonthLabel(month)}无新增政策摘要。`,
      sections.data.bullets[0] ?? `${formatMonthLabel(month)}无新增数据摘要。`,
      sections.news.bullets[0] ?? `${formatMonthLabel(month)}无新增新闻摘要。`
    ],
    sections,
    relatedIds: {
      policy: records.policies.map((item) => item.id),
      debt: records.debt.map((item) => item.id),
      news: records.news.map((item) => item.id),
      paper: records.papers.map((item) => item.id)
    },
    relatedLinks: [
      ...records.policies.slice(0, 2).map((item) => ({ title: item.title, url: item.url, source: item.source, category: "policy" })),
      ...records.debt.slice(0, 2).map((item) => ({ title: item.bondType, url: item.url ?? "", source: item.source, category: "debt" })),
      ...records.news.slice(0, 2).map((item) => ({ title: item.title, url: item.url, source: item.source, category: "news" })),
      ...records.papers.slice(0, 2).map((item) => ({ title: item.title, url: item.url, source: item.source, category: "paper" }))
    ].filter((item) => item.url),
    notes: [
      "系统仅保存元数据与 AI 生成简报，不持久化保存原文。",
      "中国知网在首版中仅作为导航源，文献元数据需人工导入。"
    ]
  };
}

async function maybeEnhanceBriefWithLlm(rawSections, analysisSummary, month) {
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
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "你是中国政府债务研究助手。请把给定月度元数据整理成 JSON，包含 policy/data/news/papers/analysis 五个 section，每个 section 只返回 title、summary、bullets。摘要专业、客观、简洁。"
          },
          {
            role: "user",
            content: JSON.stringify({ month, rawSections, analysisSummary })
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) throw new Error(`LLM HTTP ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return {
      ...rawSections,
      analysis: {
        title: "简要分析",
        summary: analysisSummary,
        bullets: [
          `${formatMonthLabel(month)}的信息重心集中在预算安排与月度债务统计。`,
          "后续应重点追踪专项债发行节奏、部委解释口径与地方化债政策推进。",
          "文献部分在首版中继续采用开放来源和手动导入并行机制。"
        ]
      }
    };
  }
}

function buildPolicySummary(items, month) {
  if (!items.length) return `${formatMonthLabel(month)}未自动发现新增政策元数据，建议人工复核两会和财政部相关页面。`;
  const lead = items[0];
  return `${formatMonthLabel(month)}政策线索主要集中在《${lead.title}》等正式文本上，政策观察重点重新回到年度预算、专项债安排与地方债务管理框架。`;
}

function buildDebtSummary(items, month) {
  const issuance = items.filter((item) => item.metricType === "issuance").reduce((sum, item) => sum + item.value, 0);
  const latestBalance = items.find((item) => item.metricType === "balance");
  if (!items.length) return `${formatMonthLabel(month)}暂无新增公开债务统计元数据。`;
  return `${formatMonthLabel(month)}公开债务数据以财政部月度统计为主；本月样本中的发行合计 ${issuance.toLocaleString("zh-CN")} 亿元，最新余额节点为 ${latestBalance?.value?.toLocaleString("zh-CN") ?? "--"} 亿元。`;
}

function buildNewsSummary(items, month) {
  if (!items.length) return `${formatMonthLabel(month)}公开讨论较少，建议围绕政府工作报告和预算报告补充手动导入。`;
  return `${formatMonthLabel(month)}新闻焦点主要围绕政府工作报告、预算安排与专项债政策表述展开，公开讨论整体偏政策解读型。`;
}

function buildPaperSummary(monthPapers, fallbackPapers, month) {
  if (monthPapers.length) {
    return `${formatMonthLabel(month)}文献部分已有新增记录，可围绕新增论文继续补充观点综述。`;
  }
  const lead = fallbackPapers[0];
  return `${formatMonthLabel(month)}未自动抓取到新增开放文献元数据。当前仍以《${lead?.title ?? "代表性研究"}》等开放来源文献作为观点补充，中国知网保持导航与人工导入模式。`;
}

function buildAnalysisSummary({ month, policyCount, debtCount, newsCount, paperCount }) {
  return `${formatMonthLabel(month)}共汇总政策 ${policyCount} 条、债务数据 ${debtCount} 条、新闻 ${newsCount} 条、文献 ${paperCount} 条。整体看，政府债务议题仍围绕预算总量安排、专项债工具使用和月度债务余额变化展开，后续应继续跟踪当月新增口径。`;
}

async function scrapeSource(source) {
  if (source.method === "api" && source.url.includes("openalex.org")) {
    return scrapeOpenAlex(source.url);
  }

  if (source.method === "api" && source.url.includes("crossref.org")) {
    return scrapeCrossref(source.url);
  }

  if (source.method === "html") {
    return scrapeHtml(source);
  }

  return [];
}

async function scrapeOpenAlex(url) {
  const response = await fetch(url, { headers: { "User-Agent": "DebtTracker/0.2" } });
  if (!response.ok) throw new Error(`OpenAlex HTTP ${response.status}`);
  const data = await response.json();
  return (data.results ?? []).map((item) => ({
    title: normalizeText(item.title ?? ""),
    date: `${item.publication_year ?? new Date().getFullYear()}-01-01`,
    source: "OpenAlex",
    url: item.id ?? "https://openalex.org/",
    summary: "来自 OpenAlex 的开放文献元数据。",
    tags: ["OpenAlex", "政府债务", "中国"],
    category: item.primary_location?.source?.display_name ?? "Working Paper",
    authors: (item.authorships ?? []).map((author) => author.author?.display_name).filter(Boolean),
    venue: item.primary_location?.source?.display_name ?? "Working Paper"
  }));
}

async function scrapeCrossref(url) {
  const response = await fetch(url, { headers: { "User-Agent": "DebtTracker/0.2" } });
  if (!response.ok) throw new Error(`Crossref HTTP ${response.status}`);
  const data = await response.json();
  return (data.message?.items ?? []).map((item) => ({
    title: normalizeText(item.title?.[0] ?? ""),
    date: buildDateFromParts(item.issued?.["date-parts"]?.[0]),
    source: "Crossref",
    url: item.URL ?? "https://search.crossref.org/",
    summary: "来自 Crossref 的开放文献元数据。",
    tags: ["Crossref", "政府债务", "文献检索"],
    category: item.type ?? "journal-article",
    authors: (item.author ?? []).map((author) => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean),
    venue: item["container-title"]?.[0] ?? item.type ?? "journal-article"
  }));
}

async function scrapeHtml(source) {
  const response = await fetch(source.url, { headers: { "User-Agent": "Mozilla/5.0 DebtTrackerBot/0.2" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  const listSelector = source.selectors?.list ?? "li";
  const titleSelector = source.selectors?.title ?? "a";
  const linkSelector = source.selectors?.link ?? titleSelector;
  const dateSelector = source.selectors?.date;

  const items = $(listSelector)
    .slice(0, 20)
    .map((_, element) => {
      const root = $(element);
      const title = normalizeText(root.find(titleSelector).first().text());
      const href = root.find(linkSelector).first().attr("href");
      const dateText = dateSelector ? normalizeText(root.find(dateSelector).first().text()) : "";
      if (!title || !href) return null;
      return {
        title,
        date: parseChineseDate(dateText) ?? today,
        source: guessSourceName(source),
        url: makeAbsoluteUrl(source.url, href),
        summary: fallbackSummary(title, source.category),
        tags: source.tags ?? [],
        category: source.categoryName ?? "未分类"
      };
    })
    .get()
    .filter(Boolean);

  return items;
}

function mapPolicy(item) {
  return {
    id: `policy-${slugify(item.title)}-${slugify(item.date)}`,
    title: item.title,
    date: item.date,
    source: item.source,
    category: item.category ?? "债务管理",
    tags: uniqueStrings(item.tags ?? []),
    summary: item.summary ?? fallbackSummary(item.title, "policy"),
    url: item.url
  };
}

function mapDebt(item) {
  if (typeof item.value !== "number" || !item.metricType || !item.bondType) return null;
  return {
    id: `debt-${slugify(item.title)}-${item.metricType}`,
    date: item.date,
    level: item.level ?? "local",
    bondType: item.bondType,
    metricType: item.metricType,
    value: item.value,
    unit: item.unit ?? "亿元",
    source: item.source,
    notes: item.notes ?? item.summary,
    url: item.url
  };
}

function mapNews(item) {
  return {
    id: `news-${slugify(item.title)}-${slugify(item.date)}`,
    title: item.title,
    date: item.date,
    source: item.source,
    tags: uniqueStrings(item.tags ?? []),
    summary: item.summary ?? fallbackSummary(item.title, "news"),
    url: item.url
  };
}

function mapPaper(item) {
  const date = item.date ?? `${new Date().getFullYear()}-01-01`;
  return {
    id: `paper-${slugify(item.title)}-${slugify(date)}`,
    title: item.title,
    authors: item.authors ?? ["待补充"],
    year: Number(String(date).slice(0, 4)) || new Date().getFullYear(),
    date,
    venue: item.venue ?? item.category ?? "研究文献",
    abstract: item.summary ?? fallbackSummary(item.title, "paper"),
    keywords: uniqueStrings(item.tags ?? ["政府债务", "中国"]),
    url: item.url,
    source: item.source
  };
}

function upsertReport(reports, report) {
  const index = reports.findIndex((item) => item.month === report.month);
  if (index >= 0) reports[index] = report;
  else reports.unshift(report);
}

function filterByMonth(items, month) {
  return (items ?? []).filter((item) => monthOf(item.date) === month);
}

function monthOf(date) {
  return String(date).slice(0, 7);
}

function defaultTargetMonth() {
  const now = new Date();
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return target.toISOString().slice(0, 7);
}

function normalizeMonth(input) {
  if (/^\d{4}-\d{2}$/.test(String(input))) return input;
  throw new Error(`月份格式错误：${input}，应为 YYYY-MM`);
}

function buildStatusMessage(source, count) {
  if (source.navigationOnly) return source.notes ?? "该来源为导航源。";
  if (source.category === "debt") return `${source.description}；本次纳入 ${count} 条月度统计记录。`;
  return `${source.description}；本次处理 ${count} 条候选记录。`;
}

function buildDateFromParts(parts) {
  const [year = 2026, month = 1, day = 1] = parts ?? [];
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCrawlKey(category, record) {
  return `${category}-${record.url}-${record.date}-${record.metricType ?? ""}`;
}

function makeIndexEntry(key, record, category, fingerprint, seenAt) {
  return {
    key,
    url: record.url,
    title: record.title,
    date: record.date,
    month: monthOf(record.date),
    source: record.source,
    category,
    fingerprint,
    lastSeenAt: seenAt
  };
}

function dedupeUpdates(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}-${item.date}-${normalizeText(item.title)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function formatMonthLabel(month) {
  const [year, mon] = month.split("-");
  return `${year}年${Number(mon)}月`;
}

function parseChineseDate(input) {
  const normalized = String(input).replace(/[年/.]/g, "-").replace(/月/g, "-").replace(/日/g, "");
  const match = normalized.match(/\d{4}-\d{1,2}-\d{1,2}/);
  if (!match) return null;
  const [year, month, day] = match[0].split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function makeAbsoluteUrl(base, href) {
  if (href.startsWith("http")) return href;
  return new URL(href, base).toString();
}

function guessSourceName(source) {
  if (source.name.includes("财政部")) return "财政部";
  if (source.name.includes("人大")) return "中国人大网";
  if (source.name.includes("政府网")) return "中国政府网";
  return source.name;
}

function fallbackSummary(title, type = "policy") {
  const label = type === "paper" ? "文献摘要" : type === "news" ? "新闻摘要" : type === "debt" ? "数据摘要" : "政策摘要";
  return `${label}：${title}。当前为规则摘要，后续可接入模型进一步优化。`;
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

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
