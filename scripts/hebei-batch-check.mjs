/**
 * Batch discover fiscal budget disclosure URLs for all 河北省 counties.
 * Phase 1: HEAD-check domain candidates (parallel, fast)
 * Phase 2: For alive domains, probe fiscal page paths
 */

import http from "http";
import https from "https";

// ── County Data: [county_name, pinyin, alt_pinyins?] ─────────────────────

const HEBEI_COUNTIES = {
  "石家庄市": [
    ["长安区", ["changan", "sjzca"]],
    ["桥西区", ["qiaoxi", "sjzqx"]],
    ["新华区", ["sjzxh", "xinhua"]],
    ["井陉矿区", ["jingxingkuang", "jxk"]],
    ["裕华区", ["yuhua", "sjzyh"]],
    ["藁城区", ["gaocheng"]],
    ["鹿泉区", ["luquan"]],
    ["栾城区", ["luancheng"]],
    ["井陉县", ["jingxing"]],
    ["正定县", ["zhengding"]],
    ["行唐县", ["xingtang"]],
    ["灵寿县", ["lingshou"]],
    ["高邑县", ["gaoyi"]],
    ["深泽县", ["shenze"]],
    ["赞皇县", ["zanhuang"]],
    ["无极县", ["wuji"]],
    ["平山县", ["pingshan"]],
    ["元氏县", ["yuanshi"]],
    ["赵县", ["zhaoxian"]],
    ["辛集市", ["xinji"]],
    ["晋州市", ["jinzhou"]],
    ["新乐市", ["xinle"]],
  ],
  "唐山市": [
    ["路南区", ["tsln", "lunan"]],
    ["路北区", ["tslb", "lubei"]],
    ["古冶区", ["guye"]],
    ["开平区", ["tskp", "kaiping"]],
    ["丰南区", ["fengnan"]],
    ["丰润区", ["fengrun"]],
    ["曹妃甸区", ["caofeidian"]],
    ["滦南县", ["luannan"]],
    ["乐亭县", ["laoting"]],
    ["迁西县", ["qianxi"]],
    ["玉田县", ["yutian"]],
    ["遵化市", ["zunhua"]],
    ["迁安市", ["qianan"]],
    ["滦州市", ["luanzhou"]],
  ],
  "秦皇岛市": [
    ["海港区", ["haigang", "qhdhg"]],
    ["山海关区", ["shanhaiguan", "shg"]],
    ["北戴河区", ["beidaihe", "bdh"]],
    ["抚宁区", ["funing"]],
    ["青龙满族自治县", ["qinglong"]],
    ["昌黎县", ["changli"]],
    ["卢龙县", ["lulong"]],
  ],
  "邯郸市": [
    ["邯山区", ["hanshan", "hdhs"]],
    ["丛台区", ["congtai"]],
    ["复兴区", ["fuxing", "hdfx"]],
    ["峰峰矿区", ["fengfeng"]],
    ["肥乡区", ["feixiang"]],
    ["永年区", ["yongnian"]],
    ["临漳县", ["linzhang"]],
    ["成安县", ["chengan"]],
    ["大名县", ["daming"]],
    ["涉县", ["shexian"]],
    ["磁县", ["cixian"]],
    ["邱县", ["qiuxian"]],
    ["鸡泽县", ["jize"]],
    ["广平县", ["guangping"]],
    ["馆陶县", ["guantao"]],
    ["魏县", ["weixian"]],
    ["曲周县", ["quzhou"]],
    ["武安市", ["wuan"]],
  ],
  "邢台市": [
    ["襄都区", ["xiangdu", "xtxd"]],
    ["信都区", ["xindu", "xtxindu"]],
    ["任泽区", ["renze"]],
    ["南和区", ["nanhe"]],
    ["临城县", ["lincheng"]],
    ["内丘县", ["neiqiu"]],
    ["柏乡县", ["baixiang"]],
    ["隆尧县", ["longyao"]],
    ["宁晋县", ["ningjin"]],
    ["巨鹿县", ["julu"]],
    ["新河县", ["xinhe"]],
    ["广宗县", ["guangzong"]],
    ["平乡县", ["pingxiang"]],
    ["威县", ["weixian"]],
    ["清河县", ["qinghe"]],
    ["临西县", ["linxi"]],
    ["南宫市", ["nangong"]],
    ["沙河市", ["shahe"]],
  ],
  "保定市": [
    ["竞秀区", ["jingxiu", "bdjx"]],
    ["莲池区", ["lianchi", "bdlc"]],
    ["满城区", ["mancheng"]],
    ["清苑区", ["qingyuan"]],
    ["徐水区", ["xushui"]],
    ["涞水县", ["laishui"]],
    ["阜平县", ["fuping"]],
    ["定兴县", ["dingxing"]],
    ["唐县", ["tangxian"]],
    ["高阳县", ["gaoyang"]],
    ["容城县", ["rongcheng"]],
    ["涞源县", ["laiyuan"]],
    ["望都县", ["wangdu"]],
    ["安新县", ["anxin"]],
    ["易县", ["yixian"]],
    ["曲阳县", ["quyang"]],
    ["蠡县", ["lixian"]],
    ["顺平县", ["shunping"]],
    ["博野县", ["boye"]],
    ["雄县", ["xiongxian"]],
    ["涿州市", ["zhuozhou"]],
    ["定州市", ["dingzhou"]],
    ["安国市", ["anguo"]],
    ["高碑店市", ["gaobeidian"]],
  ],
  "张家口市": [
    ["桥东区", ["zjkqd", "qiaodong"]],
    ["桥西区", ["zjkqx"]],
    ["宣化区", ["xuanhua"]],
    ["下花园区", ["xiahuayuan"]],
    ["万全区", ["wanquan"]],
    ["崇礼区", ["chongli"]],
    ["张北县", ["zhangbei"]],
    ["康保县", ["kangbao"]],
    ["沽源县", ["guyuan"]],
    ["尚义县", ["shangyi"]],
    ["蔚县", ["yuxian", "weixian"]],
    ["阳原县", ["yangyuan"]],
    ["怀安县", ["huaian"]],
    ["怀来县", ["huailai"]],
    ["涿鹿县", ["zhuolu"]],
    ["赤城县", ["chicheng"]],
  ],
  "承德市": [
    ["双桥区", ["shuangqiao", "cdsq"]],
    ["双滦区", ["shuangluan", "cdsl"]],
    ["鹰手营子矿区", ["yingshouyingzi", "ysyz"]],
    ["承德县", ["chengdexian", "cdx"]],
    ["兴隆县", ["xinglong"]],
    ["滦平县", ["luanping"]],
    ["隆化县", ["longhua"]],
    ["丰宁满族自治县", ["fengning"]],
    ["宽城满族自治县", ["kuancheng"]],
    ["围场满族蒙古族自治县", ["weichang"]],
    ["平泉市", ["pingquan"]],
  ],
  "沧州市": [
    ["新华区", ["czxh"]],
    ["运河区", ["czyh", "yunhe"]],
    ["沧县", ["cangxian"]],
    ["青县", ["qingxian"]],
    ["东光县", ["dongguang"]],
    ["海兴县", ["haixing"]],
    ["盐山县", ["yanshan"]],
    ["肃宁县", ["suning"]],
    ["南皮县", ["nanpi"]],
    ["吴桥县", ["wuqiao"]],
    ["献县", ["xianxian"]],
    ["孟村回族自治县", ["mengcun"]],
    ["泊头市", ["botou"]],
    ["任丘市", ["renqiu"]],
    ["黄骅市", ["huanghua"]],
    ["河间市", ["hejian"]],
  ],
  "廊坊市": [
    ["安次区", ["anci", "lfac"]],
    ["广阳区", ["guangyang", "lfgy"]],
    ["固安县", ["guan"]],
    ["永清县", ["yongqing"]],
    ["香河县", ["xianghe"]],
    ["大城县", ["dacheng", "daicheng"]],
    ["文安县", ["wenan"]],
    ["大厂回族自治县", ["dachang"]],
    ["霸州市", ["bazhou"]],
    ["三河市", ["sanhe"]],
  ],
  "衡水市": [
    ["桃城区", ["taocheng", "hstc"]],
    ["冀州区", ["jizhou"]],
    ["枣强县", ["zaoqiang"]],
    ["武邑县", ["wuyi"]],
    ["武强县", ["wuqiang"]],
    ["饶阳县", ["raoyang"]],
    ["安平县", ["anping"]],
    ["故城县", ["gucheng"]],
    ["景县", ["jingxian"]],
    ["阜城县", ["fucheng"]],
    ["深州市", ["shenzhou"]],
  ],
};

// Fiscal page paths to probe on alive domains
const FISCAL_PATHS = [
  "/zwgk/czzj/",
  "/zfxxgk/fdzdgknr/czxx/",
  "/zfxxgk/fdzdgknr/czyjs/",
  "/xxgk/czxx/",
  "/xxgk/czzj/",
  "/zdlyxxgk/czxx/",
  "/zdlyxxgk/czyjs/",
  "/zwgk/zdlyxxgk/czyjs/",
  "/zwgk/zdlyxxgk/czxx/",
  "/czj/",
];

// ── HTTP helpers ─────────────────────────────────────────────────────────

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
      res.on("data", (chunk) => { body += chunk; if (body.length > 50000) { req.destroy(); } });
      res.on("end", () => { clearTimeout(timer); resolve({ status: res.statusCode, body, location: res.headers.location }); });
    });
    req.on("error", () => { clearTimeout(timer); resolve(null); });
    req.end();
  });
}

// Score content for fiscal budget relevance
function scoreFiscal(html) {
  const keywords = ["预决算", "财政预算", "财政决算", "预算公开", "决算公开", "财政局", "一般公共预算", "政府性基金预算"];
  let score = 0;
  for (const kw of keywords) {
    if (html.includes(kw)) score++;
  }
  return score;
}

// ── Main ─────────────────────────────────────────────────────────────────

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
  console.log("═══ Phase 1: Domain Discovery (HEAD check) ═══\n");

  // Generate all candidate URLs
  const candidates = [];
  for (const [city, counties] of Object.entries(HEBEI_COUNTIES)) {
    for (const [county, pinyins] of counties) {
      for (const py of pinyins) {
        candidates.push({
          city,
          county,
          pinyin: py,
          url_http: `http://www.${py}.gov.cn/`,
          url_https: `https://www.${py}.gov.cn/`,
        });
      }
    }
  }

  console.log(`Testing ${candidates.length} domain candidates...\n`);

  // Phase 1: HEAD check all candidates
  const aliveMap = new Map(); // county → { domain, url }

  const headResults = await runBatch(candidates, 25, async (c) => {
    // Try HTTP first (most gov.cn sites)
    let res = await headCheck(c.url_http, 4000);
    if (res && res.status >= 200 && res.status < 400) {
      return { ...c, alive: true, proto: "http", status: res.status };
    }
    // Try HTTPS
    res = await headCheck(c.url_https, 4000);
    if (res && res.status >= 200 && res.status < 400) {
      return { ...c, alive: true, proto: "https", status: res.status };
    }
    return { ...c, alive: false };
  });

  // Collect alive domains (first match per county wins)
  for (const r of headResults) {
    if (r.alive && !aliveMap.has(`${r.city}|${r.county}`)) {
      const baseUrl = r.proto === "https" ? r.url_https : r.url_http;
      aliveMap.set(`${r.city}|${r.county}`, { domain: `www.${r.pinyin}.gov.cn`, baseUrl, pinyin: r.pinyin, status: r.status });
    }
  }

  console.log(`Found ${aliveMap.size} alive domains out of 167 counties.\n`);

  // Phase 2: Probe fiscal paths on alive domains
  console.log("═══ Phase 2: Fiscal Page Discovery ═══\n");

  const fiscalResults = new Map(); // county → best fiscal URL

  const probeItems = [];
  for (const [key, info] of aliveMap) {
    for (const path of FISCAL_PATHS) {
      probeItems.push({ key, path, baseUrl: info.baseUrl.replace(/\/$/, ""), ...info });
    }
  }

  console.log(`Probing ${probeItems.length} fiscal page candidates...\n`);

  const probeResults = await runBatch(probeItems, 15, async (p) => {
    const url = `${p.baseUrl}${p.path}`;
    const res = await headCheck(url, 5000);
    if (res && res.status >= 200 && res.status < 300) {
      return { ...p, url, found: true };
    }
    return { ...p, found: false };
  });

  // Collect best fiscal URL per county
  for (const r of probeResults) {
    if (r.found && !fiscalResults.has(r.key)) {
      fiscalResults.set(r.key, r.url);
    }
  }

  // Phase 3: For fiscal URLs found, GET and score them
  console.log("═══ Phase 3: Content Scoring ═══\n");

  const scoredItems = [...fiscalResults.entries()];
  const scoreResults = await runBatch(scoredItems, 10, async ([key, url]) => {
    const res = await getCheck(url, 8000);
    if (res && res.body) {
      const score = scoreFiscal(res.body);
      return { key, url, score, status: res.status };
    }
    return { key, url, score: 0, status: 0 };
  });

  // ── Output Results ─────────────────────────────────────────────────────

  console.log("\n═══ RESULTS ═══\n");

  // Sort by city
  const allCounties = [];
  for (const [city, counties] of Object.entries(HEBEI_COUNTIES)) {
    for (const [county] of counties) {
      const key = `${city}|${county}`;
      const fiscal = fiscalResults.get(key);
      const domain = aliveMap.get(key);
      const scored = scoreResults?.find(s => s?.key === key);
      allCounties.push({
        city,
        county,
        domain: domain?.domain || null,
        domainUrl: domain?.baseUrl || null,
        fiscalUrl: fiscal || null,
        score: scored?.score || 0,
      });
    }
  }

  // Print results grouped by status
  let found = 0, domainOnly = 0, notFound = 0;

  console.log("── FISCAL URL FOUND (score > 0) ──");
  for (const c of allCounties) {
    if (c.fiscalUrl && c.score > 0) {
      console.log(`  ✅ ${c.city} ${c.county}: ${c.fiscalUrl} (score: ${c.score})`);
      found++;
    }
  }

  console.log("\n── FISCAL URL FOUND (score = 0, may be redirect/generic) ──");
  for (const c of allCounties) {
    if (c.fiscalUrl && c.score === 0) {
      console.log(`  ⚠️ ${c.city} ${c.county}: ${c.fiscalUrl} (score: 0)`);
      found++;
    }
  }

  console.log("\n── DOMAIN ALIVE, NO FISCAL PAGE ──");
  for (const c of allCounties) {
    if (c.domain && !c.fiscalUrl) {
      console.log(`  🔵 ${c.city} ${c.county}: ${c.domainUrl}`);
      domainOnly++;
    }
  }

  console.log("\n── DOMAIN NOT FOUND ──");
  for (const c of allCounties) {
    if (!c.domain) {
      console.log(`  ❌ ${c.city} ${c.county}`);
      notFound++;
    }
  }

  console.log(`\n── SUMMARY ──`);
  console.log(`Fiscal URL found: ${found}`);
  console.log(`Domain only (no fiscal page): ${domainOnly}`);
  console.log(`Domain not found: ${notFound}`);
  console.log(`Total: ${found + domainOnly + notFound}`);

  // Output as JSON for easy processing
  const output = allCounties
    .filter(c => c.fiscalUrl || c.domainUrl)
    .map(c => ({
      city: c.city,
      county: c.county,
      url: c.fiscalUrl || c.domainUrl,
      type: c.fiscalUrl ? (c.score > 0 ? "fiscal" : "fiscal-unscored") : "domain-only",
      score: c.score,
    }));

  const { writeFileSync } = await import("fs");
  writeFileSync("scripts/hebei-county-results.json", JSON.stringify(output, null, 2), "utf-8");
  console.log("\nResults saved to scripts/hebei-county-results.json");
}

main().catch(console.error);
