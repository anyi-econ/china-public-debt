#!/usr/bin/env node
/**
 * batch-7prov.mjs — Discover city + county fiscal URLs for 7 western provinces
 * 贵州/云南/西藏/陕西/甘肃/青海/宁夏
 * 
 * Phase 1: Fill missing city fiscal URLs (domain pattern + sub-path probing)
 * Phase 2: Discover county domains from city portals (M4)
 * Phase 3: Probe fiscal sub-paths on county domains (M3)
 */

import http from "http";
import https from "https";
import { readFileSync, writeFileSync } from "fs";
import { URL } from "url";

const TARGET_PROVINCES = [
  "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区"
];

// ─── Pinyin mapping for cities that need URL discovery ───
const CITY_PINYIN = {
  // 贵州
  "贵阳市": "guiyang", "六盘水市": "lpssq", "遵义市": "zunyi",
  "安顺市": "anshun", "毕节市": "bijie", "铜仁市": "tongren",
  "黔西南布依族苗族自治州": "qxn", "黔东南苗族侗族自治州": "qdn",
  "黔南布依族苗族自治州": "qiannan",
  // 云南
  "昆明市": "kunming", "曲靖市": "qujing", "玉溪市": "yuxi",
  "保山市": "baoshan", "昭通市": "zhaotong", "丽江市": "lijiang",
  "普洱市": "puer", "临沧市": "lincang",
  "楚雄彝族自治州": "chuxiong", "红河哈尼族彝族自治州": "hh",
  "文山壮族苗族自治州": "wenshan",
  "西双版纳傣族自治州": "xsbn",
  "大理白族自治州": "dali", "德宏傣族景颇族自治州": "dehong",
  "怒江傈僳族自治州": "nujiang", "迪庆藏族自治州": "diqing",
  // 甘肃
  "兰州市": "lanzhou", "嘉峪关市": "jyg", "金昌市": "jinchang",
  "白银市": "baiyin", "天水市": "tianshui", "武威市": "wuwei",
  "张掖市": "zhangye", "平凉市": "pingliang", "酒泉市": "jiuquan",
  "庆阳市": "qingyang", "定西市": "dingxi", "陇南市": "longnan",
  "临夏回族自治州": "linxia", "甘南藏族自治州": "gannan",
  // 青海
  "西宁市": "xining", "海东市": "haidong",
  "海北藏族自治州": "haibei", "黄南藏族自治州": "huangnan",
  "海南藏族自治州": "hainan", "果洛藏族自治州": "guoluo",
  "玉树藏族自治州": "yushu", "海西蒙古族藏族自治州": "haixi",
  // 宁夏
  "银川市": "yinchuan", "石嘴山市": "shizuishan",
  "吴忠市": "wuzhong", "固原市": "guyuan", "中卫市": "zhongwei",
  // 西藏
  "拉萨市": "lasa", "日喀则市": "rikaze", "昌都市": "changdu",
  "林芝市": "linzhi", "山南市": "shannan", "那曲市": "naqu",
  "阿里地区": "ali",
  // 陕西
  "西安市": "xa", "铜川市": "tongchuan", "宝鸡市": "baoji",
  "咸阳市": "xianyang", "渭南市": "weinan", "延安市": "yanan",
  "汉中市": "hanzhong", "榆林市": "yulin", "安康市": "ankang",
  "商洛市": "shangluo",
};

// Common fiscal sub-paths to try on county/city domains
const FISCAL_PATHS = [
  "/zwgk/czyjsgk/",
  "/zwgk/zdlygk/czysjs/",
  "/zwgk/ysjs/",
  "/zwgk/czsj/",
  "/zwgk/czgk/",
  "/zwgk/gwgb/czys/",
  "/zfxxgk/fdzdgknr/czyjs/",
  "/zfxxgk/fdzdgknr/czxx/czyjs/",
  "/zwgk/zdlyxxgk/czys/",
  "/czyjs/",
  "/zwgk/czxx/",
  "/ygzw/czgk/",
  "/gk/czzj/",
  "/gk/fdzdgknr/czxx/czyjs/",
];

// Fiscal keywords for validating page content
const FISCAL_KEYWORDS = ["预算", "决算", "财政", "一般公共", "政府性基金"];

// ─── HTTP helpers ───

function fetchHead(urlStr, timeout = 8000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const mod = u.protocol === "https:" ? https : http;
      const req = mod.request(u, { method: "HEAD", timeout }, (res) => {
        resolve({ url: urlStr, status: res.statusCode, location: res.headers.location });
      });
      req.on("error", () => resolve({ url: urlStr, status: 0 }));
      req.on("timeout", () => { req.destroy(); resolve({ url: urlStr, status: 0 }); });
      req.end();
    } catch { resolve({ url: urlStr, status: 0 }); }
  });
}

function fetchGet(urlStr, timeout = 12000, _depth = 0) {
  return new Promise((resolve) => {
    if (_depth > 5) { resolve({ url: urlStr, status: 0, body: "" }); return; }
    try {
      const u = new URL(urlStr);
      const mod = u.protocol === "https:" ? https : http;
      const req = mod.request(u, { method: "GET", timeout, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        // Follow redirects (max 5)
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith("/")) loc = `${u.protocol}//${u.host}${loc}`;
          res.resume();
          fetchGet(loc, timeout, _depth + 1).then(resolve);
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => { data += c; if (data.length > 200000) res.destroy(); });
        res.on("end", () => resolve({ url: urlStr, status: res.statusCode, body: data }));
      });
      req.on("error", () => resolve({ url: urlStr, status: 0, body: "" }));
      req.on("timeout", () => { req.destroy(); resolve({ url: urlStr, status: 0, body: "" }); });
      req.end();
    } catch { resolve({ url: urlStr, status: 0, body: "" }); }
  });
}

// Batch promises with concurrency limit
async function batchRun(tasks, limit = 6) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

// Timeout wrapper for async operations
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ─── Data file parsing ───

function parseDataFile() {
  const raw = readFileSync("data/fiscal-budget-links.ts", "utf8");
  const provinces = [];
  const lines = raw.split("\n");
  
  let currentProv = null;
  let currentCity = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Province: indent ~2-4 spaces, name field
    const provMatch = line.match(/^(\s{2,6})name:\s*"([^"]+)"/);
    if (provMatch) {
      const indent = provMatch[1].length;
      const name = provMatch[2];
      
      if (indent <= 4 && TARGET_PROVINCES.includes(name)) {
        const urlLine = lines[i + 1] || "";
        const urlM = urlLine.match(/url:\s*"([^"]*)"/);
        currentProv = { name, url: urlM ? urlM[1] : "", cities: [], lineStart: i };
        provinces.push(currentProv);
        currentCity = null;
        continue;
      }
    }
    
    if (!currentProv) continue;
    
    // City: indent ~8 spaces
    const cityMatch = line.match(/^(\s{6,10})name:\s*"([^"]+)"/);
    if (cityMatch && cityMatch[1].length >= 6 && cityMatch[1].length <= 10) {
      const name = cityMatch[2];
      const urlLine = lines[i + 1] || "";
      const urlM = urlLine.match(/url:\s*"([^"]*)"/);
      currentCity = { name, url: urlM ? urlM[1] : "", counties: [], line: i };
      currentProv.cities.push(currentCity);
      continue;
    }
    
    // County: indent ~10+ spaces
    if (currentCity) {
      const countyMatch = line.match(/^\s{10,}\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]*)"/);
      if (countyMatch) {
        currentCity.counties.push({ name: countyMatch[1], url: countyMatch[2], line: i });
        continue;
      }
    }
    
    // End of province block
    if (currentProv && line.match(/^\s{2,4}\},?\s*$/) && !line.match(/^\s{6,}/)) {
      if (currentProv.cities.length > 0) {
        currentProv = null;
        currentCity = null;
      }
    }
  }
  
  return provinces;
}

// ─── Phase 1: Find missing city fiscal URLs ───

async function findMissingCityUrls(provinces) {
  console.log("\n=== Phase 1: Finding missing city fiscal URLs ===\n");
  const results = [];
  
  for (const prov of provinces) {
    const missing = prov.cities.filter(c => !c.url);
    if (missing.length === 0) continue;
    
    console.log(`${prov.name}: ${missing.length} cities need URLs`);
    
    for (const city of missing) {
      const py = CITY_PINYIN[city.name];
      if (!py) {
        console.log(`  ⚠ No pinyin for ${city.name}`);
        continue;
      }
      
      // Try common city fiscal bureau domain patterns
      const candidates = [
        `http://czj.${py}.gov.cn/`,
        `http://czt.${py}.gov.cn/`,
        `http://czj.${py}.gov.cn/zwgk/czyjsgk/`,
        `http://czj.${py}.gov.cn/zfxxgk/fdzdgknr/czyjs/`,
        `http://www.${py}.gov.cn/zwgk/czyjsgk/`,
        `http://www.${py}.gov.cn/zfxxgk/fdzdgknr/czyjs/`,
        `http://www.${py}.gov.cn/zwgk/czsj/`,
        `http://www.${py}.gov.cn/zwgk/zdlygk/czysjs/`,
      ];
      
      const tasks = candidates.map(url => () => fetchHead(url));
      const heads = await batchRun(tasks, 4);
      
      const alive = heads.filter(h => h.status >= 200 && h.status < 400);
      if (alive.length > 0) {
        // Verify the best candidate with GET
        const best = alive[0];
        const page = await fetchGet(best.url);
        const kw = FISCAL_KEYWORDS.filter(k => page.body.includes(k));
        if (kw.length >= 2) {
          console.log(`  ✓ ${city.name}: ${best.url} (${kw.length} keywords)`);
          results.push({ province: prov.name, city: city.name, url: best.url, line: city.line });
        } else {
          // Try GET on other alive candidates
          for (const alt of alive.slice(1)) {
            const p2 = await fetchGet(alt.url);
            const kw2 = FISCAL_KEYWORDS.filter(k => p2.body.includes(k));
            if (kw2.length >= 2) {
              console.log(`  ✓ ${city.name}: ${alt.url} (${kw2.length} keywords)`);
              results.push({ province: prov.name, city: city.name, url: alt.url, line: city.line });
              break;
            }
          }
        }
      }
      
      if (!results.find(r => r.city === city.name)) {
        console.log(`  ✗ ${city.name}: no URL found`);
      }
    }
  }
  
  return results;
}

// ─── Phase 2: Discover county domains from city portals (M4) ───

function extractGovLinks(html, hostname) {
  const links = [];
  // Match <a> tags with gov.cn hrefs
  const re = /<a\s[^>]*href=["']([^"']*\.gov\.cn[^"']*)["'][^>]*>([^<]*)</gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let url = m[1];
    const text = m[2].trim();
    if (url && text) {
      // Normalize URL
      if (url.startsWith("//")) url = "http:" + url;
      if (!url.startsWith("http")) continue;
      try {
        const u = new URL(url);
        // Skip non-gov.cn, same-host, and common non-county links
        if (!u.hostname.endsWith(".gov.cn")) continue;
        if (u.hostname === hostname) continue;
        if (u.hostname.includes("www.gov.cn")) continue;
        if (u.hostname.includes("jl.gov.cn")) continue; // provincial
        links.push({ url: `${u.protocol}//${u.hostname}/`, text, hostname: u.hostname });
      } catch {}
    }
  }
  return links;
}

function getCityHomepage(city) {
  const py = CITY_PINYIN[city.name];
  if (!py) return null;
  
  // If city has a fiscal URL, try to derive homepage domain
  if (city.url) {
    try {
      const u = new URL(city.url);
      const host = u.hostname;
      // czj.xxx.gov.cn → www.xxx.gov.cn
      if (host.startsWith("czj.") || host.startsWith("czt.")) {
        return `http://www.${host.slice(4)}/`;
      }
      // www.xxx.gov.cn/path → www.xxx.gov.cn/
      return `${u.protocol}//${host}/`;
    } catch {}
  }
  
  return `http://www.${py}.gov.cn/`;
}

async function discoverCountyDomains(provinces) {
  console.log("\n=== Phase 2: Discovering county domains from city portals (M4) ===\n");
  const countyDomains = {}; // cityName → { countyName → domain }
  
  for (const prov of provinces) {
    console.log(`\n--- ${prov.name} ---`);
    
    for (const city of prov.cities) {
      const emptyCounties = city.counties.filter(c => !c.url);
      if (emptyCounties.length === 0) continue;
      
      const homepage = getCityHomepage(city);
      if (!homepage) {
        console.log(`  ⚠ Cannot determine homepage for ${city.name}`);
        continue;
      }
      
      console.log(`  ${city.name} (${emptyCounties.length} empty counties) → ${homepage}`);
      
      try {
        const page = await withTimeout(fetchGet(homepage, 10000), 15000, { url: homepage, status: 0, body: "" });
        if (!page.body || page.status !== 200) {
          // Try https
          const httpsUrl = homepage.replace("http://", "https://");
          const page2 = await withTimeout(fetchGet(httpsUrl, 10000), 15000, { url: httpsUrl, status: 0, body: "" });
          if (!page2.body || page2.status !== 200) {
            console.log(`    ✗ Homepage not accessible`);
            continue;
          }
          page.body = page2.body;
        }
        
        const hostname = new URL(homepage).hostname;
        const govLinks = extractGovLinks(page.body, hostname);
        
        // Match county names to discovered links
        const matched = {};
        for (const county of emptyCounties) {
          // Try to match county name to link text
          const shortName = county.name
            .replace(/市$/, "").replace(/县$/, "").replace(/区$/, "")
            .replace(/自治县$/, "").replace(/自治州$/, "").replace(/自治区$/, "")
            .replace(/[蒙古族藏族回族苗族彝族壮族布依族侗族瑶族白族土家族哈尼族傣族黎族傈僳族佤族畲族高山族拉祜族水族东乡族纳西族景颇族柯尔克孜族土族达斡尔族仫佬族羌族布朗族撒拉族毛南族仡佬族锡伯族阿昌族普米族朝鲜族塔吉克族怒族乌孜别克族俄罗斯族鄂温克族德昂族保安族裕固族京族塔塔尔族独龙族鄂伦春族赫哲族门巴族珞巴族基诺族各]+/g, "");
          
          for (const link of govLinks) {
            if (link.text.includes(shortName) || link.text.includes(county.name.slice(0, 2))) {
              matched[county.name] = link.hostname;
              break;
            }
          }
        }
        
        const matchCount = Object.keys(matched).length;
        if (matchCount > 0) {
          console.log(`    Found ${matchCount}/${emptyCounties.length} county domains`);
          countyDomains[city.name] = matched;
        } else {
          // Try sitemap page
          const sitemapUrls = [
            homepage + "wzdt/", homepage + "sitemap/", homepage + "wzdh/",
          ];
          for (const smUrl of sitemapUrls) {
            try {
              const sm = await fetchGet(smUrl, 8000);
              if (sm.body && sm.status === 200) {
                const smLinks = extractGovLinks(sm.body, hostname);
                for (const county of emptyCounties) {
                  const shortName = county.name.slice(0, 2);
                  for (const link of smLinks) {
                    if (link.text.includes(shortName)) {
                      if (!matched[county.name]) {
                        matched[county.name] = link.hostname;
                      }
                    }
                  }
                }
                const newCount = Object.keys(matched).length;
                if (newCount > matchCount) {
                  console.log(`    Sitemap: found ${newCount}/${emptyCounties.length} county domains`);
                  countyDomains[city.name] = matched;
                  break;
                }
              }
            } catch (e) {
              // skip sitemap errors
            }
          }
          
          if (Object.keys(matched).length === 0) {
            console.log(`    ✗ No county domains found from portal`);
          }
        }
      } catch (err) {
        console.log(`    ✗ Error: ${err.message}`);
      }
    }
  }
  
  return countyDomains;
}

// ─── Phase 3: Probe fiscal sub-paths on county domains (M3) ───

async function probeFiscalUrls(provinces, countyDomains) {
  console.log("\n=== Phase 3: Probing fiscal sub-paths on county domains ===\n");
  const results = [];
  
  for (const prov of provinces) {
    for (const city of prov.cities) {
      const domains = countyDomains[city.name];
      if (!domains) continue;
      
      for (const county of city.counties) {
        if (county.url) continue;
        const domain = domains[county.name];
        if (!domain) continue;
        
        try {
          // Try all fiscal paths
          const candidates = FISCAL_PATHS.map(path => `http://${domain}${path}`);
          const tasks = candidates.map(url => () => fetchHead(url));
          const heads = await batchRun(tasks, 4);
          
          const alive = heads.filter(h => h.status >= 200 && h.status < 400);
          
          let found = false;
          for (const a of alive) {
            const page = await fetchGet(a.url);
            const kw = FISCAL_KEYWORDS.filter(k => page.body.includes(k));
            if (kw.length >= 2) {
              console.log(`  ✓ ${county.name}: ${a.url} (${kw.length} kw)`);
              results.push({
                province: prov.name,
                city: city.name,
                county: county.name,
                url: a.url,
                line: county.line,
                keywords: kw.length,
              });
              found = true;
              break;
            }
          }
          
          if (!found && alive.length > 0) {
            console.log(`  ? ${county.name}: ${alive[0].url} (alive, no keyword confirm)`);
            results.push({
              province: prov.name,
              city: city.name,
              county: county.name,
              url: alive[0].url,
              line: county.line,
              keywords: 0,
              unconfirmed: true,
            });
          }
          
          if (!found && alive.length === 0) {
            const homePage = await fetchGet(`http://${domain}/`);
            if (homePage.body) {
              const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>[^<]*(预算|决算|财政预决算|预决算公开|czyjs)[^<]*<\/a>/gi;
              let m;
              while ((m = re.exec(homePage.body)) !== null) {
                let linkUrl = m[1];
                if (linkUrl.startsWith("/")) linkUrl = `http://${domain}${linkUrl}`;
                if (!linkUrl.startsWith("http")) continue;
                try {
                  const lu = new URL(linkUrl);
                  if (!lu.hostname.includes(domain) && !lu.hostname.includes("gov.cn")) continue;
                } catch { continue; }
                
                console.log(`  ✓ ${county.name}: ${linkUrl} (M5 homepage link)`);
                results.push({
                  province: prov.name,
                  city: city.name,
                  county: county.name,
                  url: linkUrl,
                  line: county.line,
                  keywords: 1,
                  source: "M5",
                });
                found = true;
                break;
              }
            }
          }
        } catch (err) {
          console.log(`  ✗ ${county.name}: Error - ${err.message}`);
        }
      }
    }
  }
  
  return results;
}

// ─── Apply results to data file ───

function applyResults(cityResults, countyResults) {
  let raw = readFileSync("data/fiscal-budget-links.ts", "utf8");
  const lines = raw.split("\n");
  let applied = 0;
  
  // Apply city results
  for (const r of cityResults) {
    const line = lines[r.line + 1]; // URL is on next line after name
    if (line && line.includes('url: ""')) {
      lines[r.line + 1] = line.replace('url: ""', `url: "${r.url}"`);
      applied++;
    }
  }
  
  // Apply confirmed county results (keywords >= 2)
  const confirmed = countyResults.filter(r => r.keywords >= 2);
  for (const r of confirmed) {
    const line = lines[r.line];
    if (line && line.includes('url: ""')) {
      lines[r.line] = line.replace('url: ""', `url: "${r.url}"`);
      applied++;
    }
  }
  
  writeFileSync("data/fiscal-budget-links.ts", lines.join("\n"));
  console.log(`\nApplied ${applied} URLs (${cityResults.length} cities + ${confirmed.length} confirmed counties)`);
  
  const unconfirmed = countyResults.filter(r => r.keywords < 2);
  if (unconfirmed.length > 0) {
    console.log(`${unconfirmed.length} unconfirmed county URLs NOT applied (need manual review)`);
  }
}

// ─── Main ───

async function main() {
  console.log("Parsing data file...");
  const provinces = parseDataFile();
  
  console.log(`Found ${provinces.length} target provinces:`);
  for (const p of provinces) {
    const cities = p.cities.length;
    const emptyCities = p.cities.filter(c => !c.url).length;
    const counties = p.cities.reduce((s, c) => s + c.counties.length, 0);
    const emptyCounties = p.cities.reduce((s, c) => s + c.counties.filter(x => !x.url).length, 0);
    console.log(`  ${p.name}: ${cities} cities (${emptyCities} empty), ${counties} counties (${emptyCounties} empty)`);
  }
  
  // Phase 1: City URLs
  const cityResults = await findMissingCityUrls(provinces);
  console.log(`\nPhase 1 complete: found ${cityResults.length} city URLs`);
  
  // Phase 2: County domains
  const countyDomains = await discoverCountyDomains(provinces);
  const totalDomains = Object.values(countyDomains).reduce((s, d) => s + Object.keys(d).length, 0);
  console.log(`\nPhase 2 complete: found ${totalDomains} county domains`);
  
  // Phase 3: Fiscal URLs
  const countyResults = await probeFiscalUrls(provinces, countyDomains);
  console.log(`\nPhase 3 complete: found ${countyResults.length} county fiscal URLs`);
  
  // Save results
  const allResults = { cityResults, countyResults, countyDomains };
  writeFileSync("scripts/batch-7prov-results.json", JSON.stringify(allResults, null, 2));
  console.log("\nResults saved to scripts/batch-7prov-results.json");
  
  // Apply confirmed results  
  applyResults(cityResults, countyResults);
}

main().catch(console.error);
