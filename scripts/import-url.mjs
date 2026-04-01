import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const DATA_PATH = path.join(process.cwd(), "data", "bundle.json");
const targetUrl = process.argv[2];
const targetType = process.argv[3] ?? "news";

async function main() {
  if (!targetUrl) {
    throw new Error("请提供 URL，例如：npm run import:url -- https://example.com news");
  }

  const response = await fetch(targetUrl, { headers: { "User-Agent": "Mozilla/5.0 DebtTrackerBot/0.1" } });
  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const title = normalizeText($("title").first().text()) || "未命名条目";
  const summary =
    normalizeText($('meta[name="description"]').attr("content") ?? "") ||
    normalizeText($("article p").slice(0, 3).text()).slice(0, 180) ||
    "手动导入链接，待补充摘要。";

  const bundle = JSON.parse(await fs.readFile(DATA_PATH, "utf-8"));
  const today = new Date().toISOString().slice(0, 10);
  const hostname = new URL(targetUrl).hostname;

  if (targetType === "policy") {
    bundle.policies.unshift({
      id: `policy-${slugify(title)}-${today}`,
      title,
      date: today,
      source: hostname,
      category: "手动导入",
      tags: ["手动导入"],
      summary,
      url: targetUrl
    });
  } else if (targetType === "paper") {
    bundle.papers.unshift({
      id: `paper-${slugify(title)}-${today.slice(0, 4)}`,
      title,
      authors: ["待补充"],
      year: Number(today.slice(0, 4)),
      venue: "手动导入",
      abstract: summary,
      keywords: ["手动导入"],
      url: targetUrl,
      source: hostname
    });
  } else {
    bundle.news.unshift({
      id: `news-${slugify(title)}-${today}`,
      title,
      date: today,
      source: hostname,
      tags: ["手动导入"],
      summary,
      url: targetUrl
    });
  }

  bundle.updates.unshift({
    id: `update-import-${Date.now()}`,
    date: today,
    type: targetType,
    title,
    source: hostname,
    status: "导入",
    note: "通过手动导入链接方式补充。"
  });

  bundle.metadata.lastUpdated = today;
  bundle.metadata.updateMode = "manual";

  await fs.writeFile(DATA_PATH, JSON.stringify(bundle, null, 2), "utf-8");
  console.log(`已导入：${title}`);
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
