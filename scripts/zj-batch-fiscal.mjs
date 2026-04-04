/**
 * ZJ county fiscal budget page batch discovery.
 * Follows fiscal-site-finder Tier 3C: for each missing county,
 *   1. HEAD-check candidate domains
 *   2. Fetch 政务公开/政府信息公开 page
 *   3. Extract 财政信息 / 财政预决算 col links
 *
 * Outputs a JSON mapping: { countyName: confirmedURL }
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Domain candidates for all 35 missing ZJ counties + 绍兴市 ──
// Multiple candidates per county; script will find the first alive one.
const TARGETS = [
  // === 绍兴市 (city) ===
  { name: "绍兴市", parent: "绍兴市", domains: ["www.sx.gov.cn", "www.shaoxing.gov.cn"] },

  // === 杭州市 (6 missing counties) ===
  { name: "上城区", parent: "杭州市", domains: ["www.hzsc.gov.cn"] },
  { name: "西湖区", parent: "杭州市", domains: ["www.hzxh.gov.cn"] },
  { name: "临平区", parent: "杭州市", domains: ["www.linping.gov.cn", "www.hzlp.gov.cn"] },
  { name: "临安区", parent: "杭州市", domains: ["www.linan.gov.cn"] },
  { name: "淳安县", parent: "杭州市", domains: ["www.qdh.gov.cn"] },
  { name: "建德市", parent: "杭州市", domains: ["www.jiande.gov.cn"] },

  // === 嘉兴市 (5 missing) ===
  { name: "秀洲区", parent: "嘉兴市", domains: ["www.xiuzhou.gov.cn"] },
  { name: "嘉善县", parent: "嘉兴市", domains: ["www.jiashan.gov.cn"] },
  { name: "海盐县", parent: "嘉兴市", domains: ["www.haiyan.gov.cn"] },
  { name: "海宁市", parent: "嘉兴市", domains: ["www.haining.gov.cn"] },
  { name: "桐乡市", parent: "嘉兴市", domains: ["www.tx.gov.cn", "www.tongxiang.gov.cn"] },

  // === 湖州市 (5 missing) ===
  { name: "吴兴区", parent: "湖州市", domains: ["www.wuxing.gov.cn"] },
  { name: "南浔区", parent: "湖州市", domains: ["www.nanxun.gov.cn"] },
  { name: "德清县", parent: "湖州市", domains: ["www.deqing.gov.cn"] },
  { name: "长兴县", parent: "湖州市", domains: ["www.changxing.gov.cn"] },
  { name: "安吉县", parent: "湖州市", domains: ["www.anji.gov.cn"] },

  // === 金华市 (6 missing) ===
  { name: "婺城区", parent: "金华市", domains: ["www.wucheng.gov.cn"] },
  // wuyi.gov.cn → 河北衡水 (known trap).  Try ZJ-specific patterns.
  { name: "武义县", parent: "金华市", domains: ["www.zjwy.gov.cn", "www.wuyi.gov.cn"] },
  { name: "浦江县", parent: "金华市", domains: ["www.pujiang.gov.cn", "www.pj.gov.cn"] },
  { name: "磐安县", parent: "金华市", domains: ["www.panan.gov.cn"] },
  { name: "兰溪市", parent: "金华市", domains: ["www.lanxi.gov.cn"] },
  { name: "永康市", parent: "金华市", domains: ["www.yongkang.gov.cn", "www.yk.gov.cn"] },

  // === 衢州市 (2 missing) ===
  { name: "衢江区", parent: "衢州市", domains: ["www.qujiang.gov.cn"] },
  { name: "常山县", parent: "衢州市", domains: ["www.changshan.gov.cn", "www.cs.gov.cn"] },

  // === 舟山市 (4 missing) ===
  { name: "定海区", parent: "舟山市", domains: ["www.dinghai.gov.cn"] },
  { name: "普陀区", parent: "舟山市", domains: ["www.putuo.gov.cn", "www.zspt.gov.cn"] },
  { name: "岱山县", parent: "舟山市", domains: ["www.daishan.gov.cn"] },
  { name: "嵊泗县", parent: "舟山市", domains: ["www.shengsi.gov.cn"] },

  // === 台州市 (6 missing) ===
  { name: "黄岩区", parent: "台州市", domains: ["www.huangyan.gov.cn"] },
  { name: "三门县", parent: "台州市", domains: ["www.sanmen.gov.cn"] },
  { name: "天台县", parent: "台州市", domains: ["www.tt.gov.cn", "www.tiantai.gov.cn"] },
  { name: "仙居县", parent: "台州市", domains: ["www.xianju.gov.cn"] },
  { name: "温岭市", parent: "台州市", domains: ["www.wl.gov.cn", "www.wenling.gov.cn"] },
  { name: "临海市", parent: "台州市", domains: ["www.linhai.gov.cn"] },

  // === 丽水市 (1 missing) ===
  { name: "莲都区", parent: "丽水市", domains: ["www.liandu.gov.cn"] },
];

const TIMEOUT = 6000;
const CONCURRENCY = 8;
// col number known to be shared provincial news — always reject
const BLACKLIST_COLS = new Set(["1229396854"]);

// ── Helpers ──
async function headCheck(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timer);
    return r.ok || r.status === 302 || r.status === 301;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

async function getText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timer);
    if (!r.ok) return "";
    return await r.text();
  } catch {
    clearTimeout(timer);
    return "";
  }
}

/** Find the first alive domain among candidates */
async function findDomain(candidates) {
  for (const d of candidates) {
    for (const proto of ["https", "http"]) {
      const url = `${proto}://${d}/`;
      if (await headCheck(url)) return `${proto}://${d}`;
    }
  }
  return null;
}

/**
 * ZJ CMS sites have a standard 政务公开/政府信息公开 section.
 * Try several known entry-point patterns to find the sidebar that lists "财政信息".
 */
const XXGK_PATHS = [
  "/xxgk/index.html",                          // 信息公开
  "/col/col1229055097/index.html",              // 政府信息公开 (滨江区 pattern)
  "/",                                          // homepage fallback
];

/**
 * From HTML, extract links whose anchor text contains fiscal keywords
 * and whose href matches /col/col{digits}/
 */
function extractFiscalCols(html, baseUrl) {
  // Match <a ...href="...col/col{digits}..."...>...fiscal keyword...</a>
  const linkRe = /<a\s[^>]*href=["']([^"']*\/col\/col(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const kw = /财政信息|财政预决算|预决算公开|政府预决算|财政收支|财政资金/;
  const results = [];
  let m;
  while ((m = linkRe.exec(html))) {
    const [, href, colNum, text] = m;
    const cleanText = text.replace(/<[^>]+>/g, "").trim();
    if (kw.test(cleanText) && !BLACKLIST_COLS.has(colNum)) {
      let fullUrl = href;
      if (href.startsWith("/")) fullUrl = baseUrl + href;
      else if (!href.startsWith("http")) fullUrl = baseUrl + "/" + href;
      results.push({ colNum, text: cleanText, url: fullUrl });
    }
  }
  return results;
}

/**
 * Also try finding fiscal col via 政务公开 sidebar structure:
 * look for any link containing czxx|czyjs|czyjsgk|czzj in the URL path
 */
function extractFiscalPathLinks(html, baseUrl) {
  const linkRe = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const pathKw = /czxx|czyjs|czyjsgk|czzj|财政/;
  const textKw = /财政|预算|决算/;
  const results = [];
  let m;
  while ((m = linkRe.exec(html))) {
    const [, href, rawText] = m;
    const text = rawText.replace(/<[^>]+>/g, "").trim();
    if (!href.includes("gov.cn") && !href.startsWith("/") && !href.startsWith("http")) continue;
    if ((pathKw.test(href) || textKw.test(text)) && !href.includes("mof.gov.cn") && !href.includes("www.gov.cn")) {
      let fullUrl = href;
      if (href.startsWith("/")) fullUrl = baseUrl + href;
      else if (!href.startsWith("http")) fullUrl = baseUrl + "/" + href;
      // Deduplicate by col number if present
      const colMatch = fullUrl.match(/col\/col(\d+)/);
      if (colMatch && BLACKLIST_COLS.has(colMatch[1])) continue;
      results.push({ url: fullUrl, text, colNum: colMatch?.[1] || null });
    }
  }
  return results;
}

/** Score a page's HTML for fiscal budget content */
function scoreFiscal(html) {
  let score = 0;
  if (/预决算公开/.test(html)) score += 5;
  if (/政府预决算/.test(html)) score += 4;
  if (/预算公开|决算公开/.test(html)) score += 3;
  if (/一般公共预算|政府性基金预算/.test(html)) score += 3;
  if (/部门预算|部门决算/.test(html)) score += 2;
  if (/预算|决算/.test(html)) score += 1;
  if (/三公经费/.test(html)) score += 1;
  return score;
}

// ── Main ──
async function processTarget(target) {
  const { name, parent, domains } = target;
  const base = await findDomain(domains);
  if (!base) return { name, parent, status: "NO_DOMAIN", url: null };

  // Phase 1: Try the standard 政务公开 pages to find fiscal sidebar links
  for (const path of XXGK_PATHS) {
    const pageUrl = base + path;
    const html = await getText(pageUrl);
    if (!html) continue;

    // Try col-based fiscal links (highest precision)
    const colLinks = extractFiscalCols(html, base);
    if (colLinks.length > 0) {
      // Prefer "政府预决算" > "财政预决算" > "财政信息"
      const best = colLinks.find((l) => /政府预决算/.test(l.text)) ||
                    colLinks.find((l) => /财政预决算|预决算公开/.test(l.text)) ||
                    colLinks.find((l) => /财政信息/.test(l.text)) ||
                    colLinks[0];
      return { name, parent, status: "COL_FOUND", url: best.url, text: best.text, source: pageUrl };
    }

    // Try path-based fiscal links
    const pathLinks = extractFiscalPathLinks(html, base);
    if (pathLinks.length > 0) {
      // De-duplicate, prefer col-based
      const withCol = pathLinks.filter((l) => l.colNum);
      const best = withCol[0] || pathLinks[0];
      return { name, parent, status: "PATH_FOUND", url: best.url, text: best.text, source: pageUrl };
    }
  }

  // Phase 2: Try fetching common direct sub-path patterns
  const directPaths = [
    "/col/col1229055831/index.html", // 财政信息 (滨江区 known col)
    // Generic patterns
  ];
  // Skip this — col numbers are unique per county

  // Phase 3: Return domain-only so we can manually investigate
  return { name, parent, status: "DOMAIN_ONLY", url: base, text: null };
}

async function main() {
  console.log(`Processing ${TARGETS.length} targets...\n`);
  const results = [];
  // Process in batches of CONCURRENCY
  for (let i = 0; i < TARGETS.length; i += CONCURRENCY) {
    const batch = TARGETS.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(processTarget));
    results.push(...batchResults);
    for (const r of batchResults) {
      const icon = r.status === "COL_FOUND" ? "✅" :
                   r.status === "PATH_FOUND" ? "🔗" :
                   r.status === "DOMAIN_ONLY" ? "🏠" : "❌";
      console.log(`${icon} ${r.parent} / ${r.name}: ${r.status} → ${r.url || "NONE"}${r.text ? ` [${r.text}]` : ""}`);
    }
  }

  // Summary
  const found = results.filter((r) => r.status === "COL_FOUND" || r.status === "PATH_FOUND");
  const domainOnly = results.filter((r) => r.status === "DOMAIN_ONLY");
  const noDomain = results.filter((r) => r.status === "NO_DOMAIN");

  console.log(`\n=== SUMMARY ===`);
  console.log(`✅ Fiscal page found: ${found.length}`);
  console.log(`🏠 Domain only (need manual): ${domainOnly.length}`);
  console.log(`❌ No domain: ${noDomain.length}`);

  // Save results
  const outPath = join(__dirname, "zj-batch-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nResults saved to scripts/zj-batch-results.json`);
}

main();
