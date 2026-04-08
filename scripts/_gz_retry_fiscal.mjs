// Retry probe for Guizhou counties - try alternate URL schemes + more paths
import https from 'https';
import http from 'http';

// Counties that were GOV UNREACHABLE - try alternate URLs
const unreachable = [
  { county: "碧江区", city: "铜仁市", urls: ["http://www.bijiang.gov.cn", "https://www.bijiang.gov.cn", "http://bijiang.gov.cn", "https://bijiang.gov.cn"] },
  { county: "思南县", city: "铜仁市", urls: ["http://www.sinan.gov.cn", "https://www.sinan.gov.cn", "http://sinan.gov.cn", "https://sinan.gov.cn"] },
  { county: "沿河土家族自治县", city: "铜仁市", urls: ["http://www.yanhe.gov.cn", "https://www.yanhe.gov.cn", "http://yanhe.gov.cn", "https://yanhe.gov.cn"] },
  { county: "贞丰县", city: "黔西南州", urls: ["https://zhenfeng.gov.cn", "http://zhenfeng.gov.cn", "https://www.zhenfeng.gov.cn", "http://www.zhenfeng.gov.cn"] },
  { county: "晴隆县", city: "黔西南州", urls: ["https://ql.qxn.gov.cn", "http://ql.qxn.gov.cn", "https://www.ql.qxn.gov.cn", "https://qinglong.gov.cn", "http://www.qinglong.gov.cn"] },
  { county: "望谟县", city: "黔西南州", urls: ["https://wangmo.gov.cn", "http://wangmo.gov.cn", "https://www.wangmo.gov.cn", "http://www.wangmo.gov.cn"] },
  { county: "册亨县", city: "黔西南州", urls: ["https://ceheng.gov.cn", "http://ceheng.gov.cn", "https://www.ceheng.gov.cn", "http://www.ceheng.gov.cn"] },
  { county: "安龙县", city: "黔西南州", urls: ["https://anlong.gov.cn", "http://anlong.gov.cn", "https://www.anlong.gov.cn", "http://www.anlong.gov.cn"] },
  { county: "凯里市", city: "黔东南州", urls: ["https://www.qdnkaili.gov.cn", "http://www.qdnkaili.gov.cn", "https://qdnkaili.gov.cn", "http://qdnkaili.gov.cn", "https://www.kaili.gov.cn", "http://www.kaili.gov.cn"] },
  { county: "施秉县", city: "黔东南州", urls: ["https://www.gzsb.gov.cn", "http://www.gzsb.gov.cn", "https://gzsb.gov.cn", "http://gzsb.gov.cn"] },
  { county: "三穗县", city: "黔东南州", urls: ["https://www.gzsansui.gov.cn", "http://www.gzsansui.gov.cn", "https://gzsansui.gov.cn", "http://gzsansui.gov.cn"] },
  { county: "岑巩县", city: "黔东南州", urls: ["https://www.qdncengong.gov.cn", "http://www.qdncengong.gov.cn", "https://qdncengong.gov.cn", "http://qdncengong.gov.cn"] },
  { county: "镇远县", city: "黔东南州", urls: ["https://www.qdnzhenyuan.gov.cn", "http://www.qdnzhenyuan.gov.cn", "https://qdnzhenyuan.gov.cn", "http://qdnzhenyuan.gov.cn"] },
  { county: "天柱县", city: "黔东南州", urls: ["https://www.gz-tj.gov.cn", "http://www.gz-tj.gov.cn", "https://gz-tj.gov.cn", "http://gz-tj.gov.cn"] },
  { county: "剑河县", city: "黔东南州", urls: ["https://www.qdnjianhe.gov.cn", "http://www.qdnjianhe.gov.cn", "https://qdnjianhe.gov.cn", "http://qdnjianhe.gov.cn"] },
  { county: "锦屏县", city: "黔东南州", urls: ["https://www.qdnjp.gov.cn", "http://www.qdnjp.gov.cn", "https://qdnjp.gov.cn", "http://qdnjp.gov.cn"] },
  { county: "黎平县", city: "黔东南州", urls: ["https://www.qdnlp.gov.cn", "http://www.qdnlp.gov.cn", "https://qdnlp.gov.cn", "http://qdnlp.gov.cn"] },
  { county: "从江县", city: "黔东南州", urls: ["https://www.qdncongjiang.gov.cn", "http://www.qdncongjiang.gov.cn", "https://qdncongjiang.gov.cn", "http://qdncongjiang.gov.cn"] },
  { county: "雷山县", city: "黔东南州", urls: ["https://www.gzleishan.gov.cn", "http://www.gzleishan.gov.cn", "https://gzleishan.gov.cn", "http://gzleishan.gov.cn"] },
  { county: "麻江县", city: "黔东南州", urls: ["https://www.gzmajiang.gov.cn", "http://www.gzmajiang.gov.cn", "https://gzmajiang.gov.cn", "http://gzmajiang.gov.cn"] },
  { county: "都匀市", city: "黔南州", urls: ["http://www.douyun.gov.cn", "https://www.douyun.gov.cn", "http://douyun.gov.cn", "https://douyun.gov.cn", "http://www.duyun.gov.cn", "https://www.duyun.gov.cn"] },
  { county: "福泉市", city: "黔南州", urls: ["http://www.fuquan.gov.cn", "https://www.fuquan.gov.cn", "http://fuquan.gov.cn", "https://fuquan.gov.cn"] },
  { county: "荔波县", city: "黔南州", urls: ["http://www.libo.gov.cn", "https://www.libo.gov.cn", "http://libo.gov.cn", "https://libo.gov.cn"] },
  { county: "平塘县", city: "黔南州", urls: ["http://www.pingtang.gov.cn", "https://www.pingtang.gov.cn", "http://pingtang.gov.cn", "https://pingtang.gov.cn"] },
  { county: "龙里县", city: "黔南州", urls: ["http://www.longli.gov.cn", "https://www.longli.gov.cn", "http://longli.gov.cn", "https://longli.gov.cn"] },
  { county: "罗甸县", city: "黔南州", urls: ["http://www.luodian.gov.cn", "https://www.luodian.gov.cn", "http://luodian.gov.cn", "https://luodian.gov.cn"] },
  { county: "惠水县", city: "黔南州", urls: ["http://www.huishui.gov.cn", "https://www.huishui.gov.cn", "http://huishui.gov.cn", "https://huishui.gov.cn"] },
  { county: "长顺县", city: "黔南州", urls: ["http://www.changshun.gov.cn", "https://www.changshun.gov.cn", "http://changshun.gov.cn", "https://changshun.gov.cn"] },
  { county: "三都水族自治县", city: "黔南州", urls: ["http://www.sandu.gov.cn", "https://www.sandu.gov.cn", "http://sandu.gov.cn", "https://sandu.gov.cn"] },
];

// Counties GOV reachable but fiscal not found - try more paths
const notFound = [
  { county: "石阡县", city: "铜仁市", govUrl: "http://www.shiqian.gov.cn" },
  { county: "万山区", city: "铜仁市", govUrl: "http://www.trws.gov.cn" },
  { county: "兴义市", city: "黔西南州", govUrl: "https://www.gzxy.gov.cn" },
  { county: "黄平县", city: "黔东南州", govUrl: "https://www.qdnhp.gov.cn" },
  { county: "台江县", city: "黔东南州", govUrl: "https://www.gztaijiang.gov.cn" },
  { county: "榕江县", city: "黔东南州", govUrl: "https://www.rongjiang.gov.cn" },
  { county: "丹寨县", city: "黔东南州", govUrl: "https://www.qdndz.gov.cn" },
  { county: "贵定县", city: "黔南州", govUrl: "http://www.guiding.gov.cn" },
  { county: "独山县", city: "黔南州", govUrl: "http://www.dushan.gov.cn" },
  { county: "瓮安县", city: "黔南州", govUrl: "http://www.wengan.gov.cn" },
];

const fiscalPaths = [
  '/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/xxgkml/zdlyxxgk/czxx/',
  '/zwgk/xxgkml/zdlyxxgk/czxx/czyjsjsgjf/',
  '/xxgk/zdlyxxgk/czxx/',
  '/zfxxgk/zfxxgkml/czys/',
  '/zfxxgk/czgk/',
  '/zfxxgk/fdzdgknr/ysjs/czyjs/',
  '/xxgk/zdlyxxgk/czyjsgk/',
  '/zfxxgk/zdlygk/cwyjsgk/',
  '/xxgk/ysjs/',
];

function probe(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      timeout, 
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    }, (res) => {
      let body = '';
      res.on('data', d => { body += d; if(body.length > 5000) res.destroy(); });
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body: body.substring(0, 3000) }));
      res.on('error', () => resolve({ status: res.statusCode, location: res.headers.location, body: '' }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.code || e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'TIMEOUT' }); });
  });
}

async function probeCountyUnreachable(entry) {
  // Phase1: find a working gov base URL
  let workingUrl = null;
  for (const url of entry.urls) {
    const r = await probe(url);
    if (r.status >= 200 && r.status < 400) {
      workingUrl = url;
      break;
    }
    // Follow redirect
    if (r.status >= 300 && r.status < 400 && r.location) {
      const loc = r.location.startsWith('http') ? r.location : url + r.location;
      workingUrl = loc.replace(/\/$/, '');
      break;
    }
  }
  
  if (!workingUrl) {
    return { county: entry.county, city: entry.city, govUrl: entry.urls[0], govStatus: "unreachable", fiscalUrl: "", fiscalStatus: "gov_unreachable", notes: "all URL variants tried" };
  }
  
  // Phase2: try fiscal paths on working URL
  const base = workingUrl.replace(/\/$/, '');
  for (const path of fiscalPaths) {
    const fiscUrl = base + path;
    const r = await probe(fiscUrl);
    if (r.status === 200 && (r.body.includes('预算') || r.body.includes('决算') || r.body.includes('财政'))) {
      return { county: entry.county, city: entry.city, govUrl: base, govStatus: "ok", fiscalUrl: fiscUrl, fiscalStatus: "found", notes: "" };
    }
  }
  
  return { county: entry.county, city: entry.city, govUrl: base, govStatus: "ok", fiscalUrl: "", fiscalStatus: "not_found", notes: "" };
}

async function probeCountyNotFound(entry) {
  const base = entry.govUrl.replace(/\/$/, '');
  // Also try http/https flip
  const altBase = base.startsWith('https') ? base.replace('https', 'http') : base.replace('http', 'https');
  
  for (const b of [base, altBase]) {
    for (const path of fiscalPaths) {
      const fiscUrl = b + path;
      const r = await probe(fiscUrl);
      if (r.status === 200 && (r.body.includes('预算') || r.body.includes('决算') || r.body.includes('财政'))) {
        return { county: entry.county, city: entry.city, govUrl: entry.govUrl, govStatus: "ok", fiscalUrl: fiscUrl, fiscalStatus: "found", notes: "" };
      }
    }
  }
  
  return { county: entry.county, city: entry.city, govUrl: entry.govUrl, govStatus: "ok", fiscalUrl: "", fiscalStatus: "not_found", notes: "all extended paths tried" };
}

// Concurrency limiter
async function runBatch(items, fn, concurrency = 5) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      console.error(`[${i+1}/${items.length}] ${item.county}...`);
      results[i] = await fn(item);
      console.error(`  -> ${results[i].govStatus} | ${results[i].fiscalStatus}`);
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, worker));
  return results;
}

console.error("=== Phase 1: Retry unreachable counties ===");
const unreachableResults = await runBatch(unreachable, probeCountyUnreachable, 5);

console.error("\n=== Phase 2: Extended probe for not-found counties ===");
const notFoundResults = await runBatch(notFound, probeCountyNotFound, 5);

// Combine results
const allResults = [...unreachableResults, ...notFoundResults];
console.log(JSON.stringify(allResults, null, 2));
