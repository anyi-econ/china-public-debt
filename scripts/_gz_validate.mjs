// Targeted fiscal URL validation for Guizhou 4 prefectures
import https from 'https';
import http from 'http';

function probe(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      timeout, rejectUnauthorized: false,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    }, (res) => {
      let body = '';
      res.on('data', d => { body += d; if(body.length > 8000) res.destroy(); });
      res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 5000), loc: res.headers.location }));
      res.on('error', () => resolve({ status: res.statusCode, body: '', loc: res.headers.location }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.code }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'TIMEOUT' }); });
  });
}

const tests = [
  { county: "碧江区", city: "铜仁市", urls: [
    "https://www.bjq.gov.cn/zwgk/zdlyxx/czzj/",
    "https://www.bjq.gov.cn/zwgk/zfxxgk/fdzdgknr/ysjs/",
    "https://www.bjq.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "万山区", city: "铜仁市", urls: [
    "http://www.trws.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.trws.gov.cn/zwgk/zfxxgk/fdzdgknr/ysjs/",
    "http://www.trws.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "石阡县", city: "铜仁市", urls: [
    "http://www.shiqian.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.shiqian.gov.cn/zwgk/zfxxgkzl/fdzdgknr/czzj/",
    "http://www.shiqian.gov.cn/zwgk/zdlygk/cwyjsgk/",
    "http://www.shiqian.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "思南县", city: "铜仁市", urls: [
    "https://www.sinan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.sinan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "沿河土家族自治县", city: "铜仁市", urls: [
    "https://www.yanhe.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.yanhe.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "贞丰县", city: "黔西南州", urls: [
    "https://zhenfeng.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://zhenfeng.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "晴隆县", city: "黔西南州", urls: [
    "https://ql.qxn.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://ql.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "https://ql.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "望谟县", city: "黔西南州", urls: [
    "https://wangmo.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://wangmo.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "册亨县", city: "黔西南州", urls: [
    "https://ceheng.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://ceheng.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "安龙县", city: "黔西南州", urls: [
    "https://anlong.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://anlong.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "凯里市", city: "黔东南州", urls: [
    "http://www.kaili.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.kaili.gov.cn/zwgk/zfxxgk/fdzdgknr/ysjs/",
    "http://www.kaili.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "黄平县", city: "黔东南州", urls: [
    "https://www.qdnhp.gov.cn/xxgk/zdxxgk/czzj/",
    "https://www.qdnhp.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "施秉县", city: "黔东南州", urls: [
    "https://www.gzsb.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.gzsb.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "三穗县", city: "黔东南州", urls: [
    "https://www.gzsansui.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.gzsansui.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "镇远县", city: "黔东南州", urls: [
    "https://www.zhenyuan.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.zhenyuan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "岑巩县", city: "黔东南州", urls: [
    "http://cg.qdn.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://cg.qdn.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "天柱县", city: "黔东南州", urls: [
    "https://www.tianzhu.gov.cn/zwgk/zdlygk/czzj_5861029/",
    "https://www.tianzhu.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.tianzhu.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "锦屏县", city: "黔东南州", urls: [
    "http://www.jinping.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.jinping.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "剑河县", city: "黔东南州", urls: [
    "http://jh.qdn.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://jh.qdn.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "台江县", city: "黔东南州", urls: [
    "https://www.gztaijiang.gov.cn/zwgk/zdlyxx/czzj/",
    "https://www.gztaijiang.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "黎平县", city: "黔东南州", urls: [
    "http://lp.qdn.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://lp.qdn.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "榕江县", city: "黔东南州", urls: [
    "https://www.rongjiang.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.rongjiang.gov.cn/zwgk/zdlyxx/czzj/",
    "https://www.rongjiang.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "从江县", city: "黔东南州", urls: [
    "http://www.congjiang.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.congjiang.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "雷山县", city: "黔东南州", urls: [
    "http://www.leishan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.leishan.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "麻江县", city: "黔东南州", urls: [
    "http://www.majiang.gov.cn/zfxxgk/fdzdgknr/ysjs/",
    "http://www.majiang.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "丹寨县", city: "黔东南州", urls: [
    "https://www.qdndz.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.qdndz.gov.cn/zwgk/zdlyxx/czzj/",
    "https://www.qdndz.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "都匀市", city: "黔南州", urls: [
    "https://www.duyun.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "福泉市", city: "黔南州", urls: [
    "http://www.fuquan.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.fuquan.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "荔波县", city: "黔南州", urls: [
    "http://www.libo.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.libo.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "贵定县", city: "黔南州", urls: [
    "http://www.guiding.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.guiding.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "独山县", city: "黔南州", urls: [
    "http://www.dushan.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.dushan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "瓮安县", city: "黔南州", urls: [
    "http://www.wengan.gov.cn/zwgk/zdlygk/czzj/",
    "http://www.wengan.gov.cn/zfxxgk/fdzdgknr/ysjs/",
  ]},
  { county: "平塘县", city: "黔南州", urls: [
    "http://www.pingtang.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.pingtang.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "龙里县", city: "黔南州", urls: [
    "http://www.longli.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.longli.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "罗甸县", city: "黔南州", urls: [
    "http://www.luodian.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.luodian.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "惠水县", city: "黔南州", urls: [
    "http://www.huishui.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.huishui.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "长顺县", city: "黔南州", urls: [
    "http://www.changshun.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.changshun.gov.cn/zwgk/zdlygk/czzj/",
  ]},
  { county: "三都水族自治县", city: "黔南州", urls: [
    "http://www.sandu.gov.cn/zwgk/zdlygk/czzj/",
    "https://www.sandu.gov.cn/zwgk/zdlygk/czzj/",
  ]},
];

async function testCounty(entry) {
  for (const url of entry.urls) {
    const r = await probe(url, 10000);
    const hasFiscal = r.body && (r.body.includes('预算') || r.body.includes('决算') || r.body.includes('财政'));
    if (r.status === 200 && hasFiscal) {
      return { county: entry.county, city: entry.city, url, status: "FOUND", title: r.body.match(/<title[^>]*>([^<]+)/)?.[1]?.trim() || "" };
    }
    if (r.status === 200 && !hasFiscal) {
      return { county: entry.county, city: entry.city, url, status: "PAGE_OK_NO_FISCAL", title: r.body.match(/<title[^>]*>([^<]+)/)?.[1]?.trim() || "" };
    }
    if (r.status >= 301 && r.status <= 302) {
      // Follow redirect
      const loc = r.loc;
      if (loc) {
        const r2 = await probe(loc.startsWith('http') ? loc : new URL(loc, url).href, 8000);
        const h2 = r2.body && (r2.body.includes('预算') || r2.body.includes('决算') || r2.body.includes('财政'));
        if (r2.status === 200 && h2) {
          return { county: entry.county, city: entry.city, url: loc.startsWith('http') ? loc : new URL(loc, url).href, status: "FOUND_REDIRECT", title: r2.body.match(/<title[^>]*>([^<]+)/)?.[1]?.trim() || "" };
        }
      }
    }
  }
  // All failed - check last error
  const lastUrl = entry.urls[0];
  const r = await probe(lastUrl, 5000);
  return { county: entry.county, city: entry.city, url: "", status: r.status === 0 ? `UNREACHABLE_${r.error}` : `HTTP_${r.status}`, title: "" };
}

const results = [];
let idx = 0;
async function worker() {
  while (idx < tests.length) {
    const i = idx++;
    console.error(`[${i+1}/${tests.length}] ${tests[i].county}...`);
    results[i] = await testCounty(tests[i]);
    console.error(`  -> ${results[i].status} ${results[i].url}`);
  }
}
await Promise.all(Array.from({length: 8}, worker));
console.log(JSON.stringify(results, null, 2));
