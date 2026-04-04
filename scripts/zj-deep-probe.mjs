/**
 * Deep probe for ZJ county fiscal budget pages.
 * Uses corrected official domains from ZJ gov nav.
 * Tries multiple entry-point patterns per county.
 */

const TIMEOUT = 8000;
const BLACKLIST_COLS = new Set(["1229396854"]);

const TARGETS = [
  // ── Corrected domains (previously NO_DOMAIN) ──
  { name: "长兴县", parent: "湖州市", domain: "www.zjcx.gov.cn" },
  { name: "衢江区", parent: "衢州市", domain: "www.qjq.gov.cn" },
  { name: "常山县", parent: "衢州市", domain: "www.zjcs.gov.cn" },
  { name: "黄岩区", parent: "台州市", domain: "www.zjhy.gov.cn" },
  { name: "天台县", parent: "台州市", domain: "www.zjtt.gov.cn" },
  { name: "仙居县", parent: "台州市", domain: "www.zjxj.gov.cn" },
  // Corrected婺城区 domain
  { name: "婺城区", parent: "金华市", domain: "www.wuch.gov.cn" },

  // ── Domain-only from first batch (need deeper exploration) ──
  { name: "绍兴市", parent: "绍兴市", domain: "www.sx.gov.cn" },
  { name: "上城区", parent: "杭州市", domain: "www.hzsc.gov.cn" },
  { name: "临平区", parent: "杭州市", domain: "www.linping.gov.cn" },
  { name: "临安区", parent: "杭州市", domain: "www.linan.gov.cn" },
  { name: "建德市", parent: "杭州市", domain: "www.jiande.gov.cn" },
  { name: "秀洲区", parent: "嘉兴市", domain: "www.xiuzhou.gov.cn" },
  { name: "嘉善县", parent: "嘉兴市", domain: "www.jiashan.gov.cn" },
  { name: "海盐县", parent: "嘉兴市", domain: "www.haiyan.gov.cn" },
  { name: "海宁市", parent: "嘉兴市", domain: "www.haining.gov.cn" },
  { name: "桐乡市", parent: "嘉兴市", domain: "www.tx.gov.cn" },
  { name: "吴兴区", parent: "湖州市", domain: "www.wuxing.gov.cn" },
  { name: "南浔区", parent: "湖州市", domain: "www.nanxun.gov.cn" },
  { name: "安吉县", parent: "湖州市", domain: "www.anji.gov.cn" },
  { name: "武义县", parent: "金华市", domain: "www.zjwy.gov.cn" },
  { name: "兰溪市", parent: "金华市", domain: "www.lanxi.gov.cn" },
  { name: "永康市", parent: "金华市", domain: "www.yk.gov.cn" },
  { name: "定海区", parent: "舟山市", domain: "www.dinghai.gov.cn" },
  { name: "普陀区", parent: "舟山市", domain: "www.putuo.gov.cn" },
  { name: "嵊泗县", parent: "舟山市", domain: "www.shengsi.gov.cn" },
  { name: "三门县", parent: "台州市", domain: "www.sanmen.gov.cn" },
  { name: "温岭市", parent: "台州市", domain: "www.wl.gov.cn" },
  { name: "临海市", parent: "台州市", domain: "www.linhai.gov.cn" },
  { name: "莲都区", parent: "丽水市", domain: "www.liandu.gov.cn" },
];

async function getText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal, redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    clearTimeout(timer);
    if (!r.ok) return "";
    return await r.text();
  } catch { clearTimeout(timer); return ""; }
}

// Extract col-based fiscal links
function findFiscalCols(html, base) {
  const re = /<a\s[^>]*href=["']([^"']*\/col\/col(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const kw = /财政信息|财政预决算|预决算公开|政府预决算|财政收支|财政资金/;
  const results = [];
  let m;
  while ((m = re.exec(html))) {
    const [, href, colNum, rawText] = m;
    const text = rawText.replace(/<[^>]+>/g, "").trim();
    if (kw.test(text) && !BLACKLIST_COLS.has(colNum)) {
      let url = href;
      if (href.startsWith("/")) url = base + href;
      else if (!href.startsWith("http")) url = base + "/" + href;
      results.push({ colNum, text, url });
    }
  }
  return results;
}

// Find links with fiscal path patterns or text
function findFiscalPathLinks(html, base) {
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = re.exec(html))) {
    const [, href, rawText] = m;
    const text = rawText.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    // fiscal-related text
    const hasFiscalText = /财政信息|财政预决算|预决算公开|政府预决算|财政局/.test(text);
    // fiscal-related URL path
    const hasFiscalPath = /czxx|czyjs|czyjsgk|czzj|财政/.test(href);
    if ((hasFiscalText || hasFiscalPath) && !href.includes("mof.gov.cn") && !href.includes("www.gov.cn")) {
      let url = href;
      if (href.startsWith("/")) url = base + href;
      else if (!href.startsWith("http")) url = base + "/" + href;
      const colMatch = url.match(/col\/col(\d+)/);
      if (colMatch && BLACKLIST_COLS.has(colMatch[1])) continue;
      results.push({ url, text, colNum: colMatch?.[1] || null });
    }
  }
  return results;
}

// Try to find ?number=D001 style fiscal link in xxgk pages
function findNumberParam(html, base) {
  const re = /href=["']([^"']*number=D001(?:-A001)?[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = re.exec(html))) {
    const [, href, rawText] = m;
    const text = rawText.replace(/<[^>]+>/g, "").trim();
    let url = href;
    if (href.startsWith("/")) url = base + href;
    else if (!href.startsWith("http")) url = base + "/" + href;
    results.push({ url, text });
  }
  return results;
}

// Also check for xxgk subfolder pattern: /xxgk/fdzdgknr/czxx/ or /xxgk/zfxxgk/czxx/
function findXxgkSubFolder(html, base) {
  const re = /href=["']([^"']*(?:\/xxgk\/[^"']*czxx|\/xxgk\/[^"']*czyjsgk|\/xxgk\/[^"']*czyjs)[^"']*)["']/gi;
  const results = [];
  let m;
  while ((m = re.exec(html))) {
    let url = m[1];
    if (url.startsWith("/")) url = base + url;
    else if (!url.startsWith("http")) url = base + "/" + url;
    results.push({ url });
  }
  return results;
}

async function probeTarget(t) {
  const protos = ["https", "http"];
  let base = null;
  
  // Find working protocol
  for (const p of protos) {
    const url = `${p}://${t.domain}/`;
    const html = await getText(url);
    if (html.length > 500) { base = `${p}://${t.domain}`; break; }
  }
  if (!base) return { ...t, status: "NO_DOMAIN", url: null };

  // Pages to probe (in order of priority)
  const pages = [
    "/",
    "/xxgk/index.html",
    "/col/col1229253826/index.html",  // 政务公开 (吴兴区)
    "/col/col1229211227/index.html",  // 政务公开 (南浔区)
    "/col/col1229882204/index.html",  // 政务公开 (海宁市)
  ];

  for (const page of pages) {
    const url = base + page;
    const html = await getText(url);
    if (!html || html.length < 500) continue;

    // Priority 1: col-based fiscal links
    const cols = findFiscalCols(html, base);
    if (cols.length > 0) {
      const best = cols.find(l => /政府预决算/.test(l.text)) ||
                   cols.find(l => /财政预决算|预决算公开/.test(l.text)) ||
                   cols.find(l => /财政信息/.test(l.text)) || cols[0];
      return { ...t, status: "COL_FOUND", url: best.url, text: best.text, source: url };
    }

    // Priority 2: ?number=D001 pattern
    const numLinks = findNumberParam(html, base);
    if (numLinks.length > 0) {
      return { ...t, status: "NUM_FOUND", url: numLinks[0].url, text: numLinks[0].text, source: url };
    }

    // Priority 3: xxgk subfolder pattern (czxx)
    const subLinks = findXxgkSubFolder(html, base);
    if (subLinks.length > 0) {
      return { ...t, status: "XXGK_FOUND", url: subLinks[0].url, text: "czxx subfolder", source: url };
    }

    // Priority 4: fiscal path/text links
    const pathLinks = findFiscalPathLinks(html, base);
    const goodLinks = pathLinks.filter(l => /财政信息|财政预决算|预决算公开|政府预决算/.test(l.text));
    if (goodLinks.length > 0) {
      return { ...t, status: "PATH_FOUND", url: goodLinks[0].url, text: goodLinks[0].text, source: url };
    }
  }

  // Phase 2: Try common CMS 信息公开 patterns with number param
  const xxgkPatterns = [
    // Scan for any col link on homepage that looks like xxgk/信息公开
    "xxgk/fdzdgknr/czxx/index.html",
    "xxgk/fdzdgknr/czxx/czyjs/index.html",
    "xxgk/fdzdgknr/czxx/czyjsgk/index.html",
    "xxgk/zfbmxxgk/qczjqgzb/fdzdgknr/czxx/index.html",  // 南浔区 pattern
  ];
  for (const p of xxgkPatterns) {
    const url = `${base}/${p}`;
    const html = await getText(url);
    if (html && html.length > 1000) {
      // Verify it has fiscal content
      if (/预算|决算|财政/.test(html)) {
        return { ...t, status: "XXGK_DIRECT", url, text: "xxgk direct", source: url };
      }
    }
  }

  // Phase 3: Try fetching 信息公开目录 and look for D001
  // Many ZJ CMS sites use a single col with number= params
  const homepageHtml = await getText(base + "/");
  if (homepageHtml) {
    // Find the main xxgk col number  
    const xxgkColMatch = homepageHtml.match(/href=["'][^"']*\/col\/col(\d+)\/index\.html\?number=[^"']*["'][^>]*>[^<]*信息公开/i) ||
                         homepageHtml.match(/href=["'][^"']*\/col\/col(\d+)[^"']*["'][^>]*>[^<]*信息公开目录/i);
    if (xxgkColMatch) {
      const colNum = xxgkColMatch[1];
      // Try D001 (财政信息) and D001-A001 (财政预决算)
      for (const num of ["D001-A001", "D001"]) {
        const url = `${base}/col/col${colNum}/index.html?number=${num}`;
        const html = await getText(url);
        if (html && html.length > 1000 && /预算|决算|财政/.test(html)) {
          return { ...t, status: "NUM_DISCOVERED", url, text: `number=${num}`, source: `col${colNum}` };
        }
      }
    }
  }

  return { ...t, status: "DOMAIN_ONLY", url: base, text: null };
}

async function main() {
  console.log(`Deep probing ${TARGETS.length} targets...\n`);
  const results = [];
  
  // Process 6 at a time
  for (let i = 0; i < TARGETS.length; i += 6) {
    const batch = TARGETS.slice(i, i + 6);
    const batchResults = await Promise.all(batch.map(probeTarget));
    results.push(...batchResults);
    for (const r of batchResults) {
      const icon = r.status.includes("FOUND") || r.status.includes("DISCOVERED") || r.status.includes("DIRECT") ? "✅" :
                   r.status === "DOMAIN_ONLY" ? "🏠" : "❌";
      console.log(`${icon} ${r.parent}/${r.name}: ${r.status} → ${r.url || "NONE"}${r.text ? ` [${r.text}]` : ""}`);
    }
    console.log();
  }

  const found = results.filter(r => !["DOMAIN_ONLY", "NO_DOMAIN"].includes(r.status));
  const remaining = results.filter(r => ["DOMAIN_ONLY", "NO_DOMAIN"].includes(r.status));
  console.log(`=== SUMMARY ===`);
  console.log(`✅ Found: ${found.length}`);
  console.log(`🏠 Remaining: ${remaining.length}`);
  if (remaining.length > 0) {
    console.log(`Remaining: ${remaining.map(r => `${r.name}(${r.domain})`).join(", ")}`);
  }

  const { writeFileSync } = await import("fs");
  const { dirname, join } = await import("path");
  const { fileURLToPath } = await import("url");
  writeFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "zj-deep-results.json"),
    JSON.stringify(results, null, 2), "utf-8"
  );
  console.log("\nSaved to scripts/zj-deep-results.json");
}

main();
