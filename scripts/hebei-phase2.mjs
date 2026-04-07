/**
 * Phase 2: Deeper probing for 河北 county fiscal URLs.
 * 1. Try more fiscal page paths on the 95 domain-only counties
 * 2. Try more domain patterns for the 61 missing counties
 * 3. GET homepage of domains and search for fiscal links
 */

import http from "http";
import https from "https";
import { readFileSync, writeFileSync } from "fs";

// Load Phase 1 results
const phase1 = JSON.parse(readFileSync("scripts/hebei-county-results.json", "utf-8"));

// All counties from the batch check script (for the missing 61)
const MISSING_EXTRA_PATTERNS = {
  // 石家庄市 - try sjz-prefixed and hb-prefixed patterns
  "石家庄市|井陉矿区": ["jxkq", "sjzjxk", "hbjx"],
  "石家庄市|藁城区": ["sjzgc", "hbgc", "gaocheng"],
  "石家庄市|鹿泉区": ["sjzlq", "hblq", "luquan"],
  "石家庄市|井陉县": ["hbjx", "sjzjx", "jingxing"],
  "石家庄市|正定县": ["sjzzd", "hbzd", "zhengding"],
  "石家庄市|高邑县": ["sjzgy", "hbgy"],
  "石家庄市|辛集市": ["hbxj", "sjzxj"],
  "石家庄市|晋州市": ["hbjz", "sjzjz"],
  // 唐山市
  "唐山市|路南区": ["tsln"],
  "唐山市|古冶区": ["tsgy", "hbgy"],
  "唐山市|丰南区": ["tsfn", "hbfn"],
  "唐山市|丰润区": ["tsfr", "hbfr"],
  "唐山市|遵化市": ["hbzh", "tszh"],
  "唐山市|迁安市": ["hbqa", "tsqa"],
  "唐山市|滦州市": ["hblz", "tslz"],
  // 秦皇岛市
  "秦皇岛市|海港区": ["qhdhg", "haigang"],
  "秦皇岛市|抚宁区": ["qhdfn", "funing"],
  "秦皇岛市|青龙满族自治县": ["hbql", "qhdql", "qinglong"],
  "秦皇岛市|昌黎县": ["hbcl", "qhdcl"],
  "秦皇岛市|卢龙县": ["hbll", "qhdll"],
  // 邯郸市
  "邯郸市|丛台区": ["hdct", "congtai"],
  "邯郸市|峰峰矿区": ["hdff", "fengfeng"],
  "邯郸市|肥乡区": ["hdfx2", "feixiang"],
  "邯郸市|永年区": ["hdyn", "yongnian"],
  "邯郸市|成安县": ["hdca", "chengan"],
  "邯郸市|广平县": ["hdgp", "guangping"],
  "邯郸市|曲周县": ["hdqz", "quzhou"],
  // 邢台市
  "邢台市|内丘县": ["nqx", "neiqiu"],
  "邢台市|柏乡县": ["hbbx", "baixiang"],
  "邢台市|新河县": ["hbxh", "xinhe"],
  "邢台市|广宗县": ["hbgz", "guangzong"],
  "邢台市|清河县": ["hbqh", "qinghe"],
  "邢台市|沙河市": ["hbsh", "shahe"],
  // 保定市
  "保定市|定兴县": ["hbdx", "dingxing"],
  "保定市|易县": ["hbyx", "yixian"],
  "保定市|顺平县": ["hbsp", "shunping"],
  "保定市|博野县": ["hbby", "boye"],
  "保定市|定州市": ["hbdz", "dingzhou"],
  // 张家口市
  "张家口市|桥西区": ["zjkqx"],
  "张家口市|宣化区": ["zjkxh", "hbxh", "xuanhua"],
  "张家口市|下花园区": ["zjkxhy"],
  "张家口市|万全区": ["zjkwq", "wanquan"],
  "张家口市|崇礼区": ["zjkcl", "chongli"],
  "张家口市|张北县": ["hbzb", "zhangbei"],
  "张家口市|康保县": ["hbkb", "kangbao"],
  "张家口市|沽源县": ["hbgy2", "guyuan"],
  "张家口市|尚义县": ["hbsy", "shangyi"],
  "张家口市|蔚县": ["hbwx", "yuxian", "weixian"],
  "张家口市|阳原县": ["hbyy", "yangyuan"],
  "张家口市|涿鹿县": ["hbzl", "zhuolu"],
  "张家口市|赤城县": ["hbcc", "chicheng"],
  // 承德市
  "承德市|双桥区": ["cdsq", "shuangqiao"],
  "承德市|双滦区": ["cdsl", "shuangluan"],
  "承德市|兴隆县": ["cdxl", "xinglong"],
  "承德市|滦平县": ["cdlp", "luanping"],
  "承德市|隆化县": ["cdlh", "longhua"],
  "承德市|宽城满族自治县": ["cdkc", "kuancheng"],
  // 廊坊市
  "廊坊市|固安县": ["lfga", "guan"],
  "廊坊市|大厂回族自治县": ["lfdc", "dachang"],
  "廊坊市|三河市": ["lfsh", "sanhe"],
  // 衡水市
  "衡水市|阜城县": ["hsfc", "fucheng"],
};

// Extra fiscal paths to try (deeper probing)
const EXTRA_FISCAL_PATHS = [
  "/zfxxgk/fdzdgknr/czzj/",
  "/zwgk/czsjxx/",
  "/jcgk/czyjsgk/",
  "/czyjsgk/",
  "/zwgk/czgk/",
  "/zfxxgk/czsjgk/",
  "/zfxxgk/czyjsgk/",
  "/col/col1/index.html",
  "/zwgk/fdzdgknr/czyjs/",
  "/zwgk/fdzdgknr/czxx/",
  "/zwgk/jcgk/czyjsgk/",
  "/zfxxgk/fdzdgknr/czyjsgk/",
  "/xxgk/czyjs/",
  "/zdlyxxgk/czyjsgk/",
  "/zdlyxxgk/czzj/",
  "/zfxxgk/fdzdgknr/czysgk/",
];

function headCheck(url, timeout = 5000) {
  return new Promise((resolve) => {
    const proto = url.startsWith("https") ? https : http;
    const timer = setTimeout(() => { req.destroy(); resolve(null); }, timeout);
    const req = proto.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      clearTimeout(timer);
      resolve({ status: res.statusCode, location: res.headers.location || null });
    });
    req.on("error", () => { clearTimeout(timer); resolve(null); });
    req.end();
  });
}

function getCheck(url, timeout = 8000) {
  return new Promise((resolve) => {
    const proto = url.startsWith("https") ? https : http;
    const timer = setTimeout(() => { req.destroy(); resolve(null); }, timeout);
    const req = proto.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; if (body.length > 100000) { req.destroy(); } });
      res.on("end", () => { clearTimeout(timer); resolve({ status: res.statusCode, body, location: res.headers.location }); });
    });
    req.on("error", () => { clearTimeout(timer); resolve(null); });
    req.end();
  });
}

async function runBatch(items, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function main() {
  // Classify Phase 1 results
  const domainOnly = phase1.filter(r => r.type === "domain-only");
  const withFiscal = phase1.filter(r => r.type !== "domain-only");

  // Find counties not in Phase 1 results at all
  const foundKeys = new Set(phase1.map(r => `${r.city}|${r.county}`));

  console.log(`Phase 1 results: ${withFiscal.length} fiscal, ${domainOnly.length} domain-only\n`);

  // ── Step 1: Try more domain patterns for missing counties ──
  console.log("═══ Step 1: Extra domain patterns for missing counties ═══\n");

  const extraCandidates = [];
  for (const [key, pinyins] of Object.entries(MISSING_EXTRA_PATTERNS)) {
    if (foundKeys.has(key)) continue; // Already found
    const [city, county] = key.split("|");
    for (const py of pinyins) {
      extraCandidates.push({ city, county, pinyin: py, url: `http://www.${py}.gov.cn/` });
    }
  }

  console.log(`Testing ${extraCandidates.length} extra domain candidates...\n`);

  const newDomains = new Map();
  const extraResults = await runBatch(extraCandidates, 20, async (c) => {
    const res = await headCheck(c.url, 5000);
    if (res && res.status >= 200 && res.status < 400) {
      return { ...c, alive: true };
    }
    return { ...c, alive: false };
  });

  for (const r of extraResults) {
    if (r.alive) {
      const key = `${r.city}|${r.county}`;
      if (!newDomains.has(key)) {
        newDomains.set(key, r.url);
        console.log(`  ✅ ${r.city} ${r.county}: ${r.url}`);
      }
    }
  }
  console.log(`\nFound ${newDomains.size} new domains.\n`);

  // ── Step 2: Deeper fiscal path probing on all known domains ──
  console.log("═══ Step 2: Deeper fiscal path probing ═══\n");

  // Combine domain-only from Phase 1 + newly found domains
  const allDomains = [];
  for (const r of domainOnly) {
    allDomains.push({ city: r.city, county: r.county, baseUrl: r.url.replace(/\/$/, "") });
  }
  for (const [key, url] of newDomains) {
    const [city, county] = key.split("|");
    allDomains.push({ city, county, baseUrl: url.replace(/\/$/, "") });
  }

  const probeItems = [];
  for (const d of allDomains) {
    for (const path of EXTRA_FISCAL_PATHS) {
      probeItems.push({ ...d, path, url: `${d.baseUrl}${path}` });
    }
  }

  console.log(`Probing ${probeItems.length} extra fiscal paths...\n`);

  const newFiscalMap = new Map();
  const probeResults2 = await runBatch(probeItems, 20, async (p) => {
    const res = await headCheck(p.url, 5000);
    if (res && res.status >= 200 && res.status < 300) {
      return { ...p, found: true };
    }
    return { ...p, found: false };
  });

  for (const r of probeResults2) {
    if (r.found) {
      const key = `${r.city}|${r.county}`;
      if (!newFiscalMap.has(key)) {
        newFiscalMap.set(key, r.url);
        console.log(`  ✅ ${r.city} ${r.county}: ${r.url}`);
      }
    }
  }
  console.log(`\nFound ${newFiscalMap.size} new fiscal pages.\n`);

  // ── Step 3: Homepage link crawl for top domain-only counties ──
  console.log("═══ Step 3: Homepage link crawl (sample) ═══\n");

  // For counties that still only have domain, try GET homepage and extract fiscal links
  const stillDomainOnly = allDomains.filter(d => {
    const key = `${d.city}|${d.county}`;
    return !newFiscalMap.has(key) && !withFiscal.find(f => f.city === d.city && f.county === d.county);
  });

  console.log(`Crawling ${Math.min(stillDomainOnly.length, 60)} homepages for fiscal links...\n`);

  const homepageCrawl = await runBatch(stillDomainOnly.slice(0, 60), 8, async (d) => {
    const res = await getCheck(d.baseUrl + "/", 8000);
    if (!res || !res.body) return { ...d, links: [] };

    // Extract links that mention fiscal/budget keywords
    const linkRe = /href=["']([^"']*(?:czz[jJ]|czzj|czyjs|czyjsgk|czxx|czgk|czzjxx|czsjgk|预决算|财政)[^"']*?)["']/gi;
    const links = [];
    let m;
    while ((m = linkRe.exec(res.body)) !== null) {
      let link = m[1];
      if (link.startsWith("/")) link = d.baseUrl + link;
      else if (!link.startsWith("http")) link = d.baseUrl + "/" + link;
      links.push(link);
    }
    return { ...d, links };
  });

  for (const h of homepageCrawl) {
    if (h.links && h.links.length > 0) {
      const key = `${h.city}|${h.county}`;
      if (!newFiscalMap.has(key)) {
        newFiscalMap.set(key, h.links[0]);
        console.log(`  🔗 ${h.city} ${h.county}: ${h.links[0]}`);
      }
    }
  }

  // ── Combine all results ──
  console.log("\n═══ FINAL COMBINED RESULTS ═══\n");

  const finalResults = new Map();

  // Phase 1 fiscal URLs (fix double slashes)
  for (const r of withFiscal) {
    finalResults.set(`${r.city}|${r.county}`, r.url.replace(/([^:])\/\//g, "$1/"));
  }

  // Phase 2 new fiscal URLs
  for (const [key, url] of newFiscalMap) {
    if (!finalResults.has(key)) {
      finalResults.set(key, url);
    }
  }

  // Domain-only fallbacks (just homepage)
  for (const r of domainOnly) {
    const key = `${r.city}|${r.county}`;
    if (!finalResults.has(key)) {
      finalResults.set(key, r.url);
    }
  }

  // Newly discovered domains (no fiscal path found)
  for (const [key, url] of newDomains) {
    if (!finalResults.has(key)) {
      finalResults.set(key, url);
    }
  }

  // Output
  let fiscalCount = 0, domainOnlyCount = 0, missingCount = 0;

  const output = [];
  for (const [key, url] of finalResults) {
    const [city, county] = key.split("|");
    const isFiscal = url.includes("czz") || url.includes("czyj") || url.includes("czgk") || url.includes("czxx") || url.includes("czsjgk");
    output.push({ city, county, url, type: isFiscal ? "fiscal" : "domain-only" });
    if (isFiscal) fiscalCount++;
    else domainOnlyCount++;
    console.log(`  ${isFiscal ? "✅" : "🔵"} ${city} ${county}: ${url}`);
  }

  console.log(`\n── STILL MISSING ──`);
  // List counties still not found
  const allKeys = new Set();
  for (const [city, counties] of Object.entries(JSON.parse(readFileSync("scripts/hebei-batch-check.mjs", "utf-8").match(/HEBEI_COUNTIES = ({[\s\S]*?});/)?.[1] || "{}"))) {
    // Skip - we can't easily re-parse the script
  }

  // Use Phase 1 missing list heuristic
  const foundKeysNow = new Set(finalResults.keys());
  for (const [key] of Object.entries(MISSING_EXTRA_PATTERNS)) {
    if (!foundKeysNow.has(key)) {
      const [city, county] = key.split("|");
      console.log(`  ❌ ${city} ${county}`);
      missingCount++;
    }
  }

  console.log(`\n── SUMMARY ──`);
  console.log(`Fiscal URL: ${fiscalCount}`);
  console.log(`Domain only: ${domainOnlyCount}`);
  console.log(`Still missing: ${missingCount}`);

  // Save final results
  writeFileSync("scripts/hebei-county-final.json", JSON.stringify(output, null, 2), "utf-8");
  console.log("\nSaved to scripts/hebei-county-final.json");
}

main().catch(console.error);
