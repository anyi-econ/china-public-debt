// Find Zhejiang missing URLs: 2 cities + 38 counties
import https from 'https';
import http from 'http';

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    try {
      const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; if (data.length > 10000) res.destroy(); });
        res.on('end', () => resolve({ url, status: res.statusCode, size: data.length, location: res.headers.location, hasBudget: /预[决算]|决算|[决预]算公开|财政/.test(data) }));
        res.on('close', () => resolve({ url, status: res.statusCode, size: data.length, location: res.headers.location, hasBudget: /预[决算]|决算|[决预]算公开|财政/.test(data) }));
      });
      req.on('error', () => resolve({ url, status: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0 }); });
    } catch { resolve({ url, status: 0 }); }
  });
}

// === Part 1: Missing city URLs ===
const cityTests = [
  { name: "绍兴市", urls: [
    "https://czj.shaoxing.gov.cn/",
    "http://czj.shaoxing.gov.cn/",
    "https://czt.shaoxing.gov.cn/",
    "http://cz.shaoxing.gov.cn/",
    "https://czj.sx.gov.cn/"
  ]},
  { name: "丽水市", urls: [
    "https://czj.lishui.gov.cn/",
    "http://czj.lishui.gov.cn/",
    "https://czt.lishui.gov.cn/",
    "http://cz.lishui.gov.cn/",
    "https://czj.ls.gov.cn/"
  ]},
];

// === Part 2: County URL discovery ===
// For each empty county, try the county gov site with common /col/ budget patterns
const countyTests = [
  // 杭州市 8 missing
  { name: "上城区", domain: "www.shangcheng.gov.cn" },
  { name: "西湖区", domain: "www.xihu.gov.cn" },
  { name: "滨江区", domain: "www.binjiang.gov.cn" },
  { name: "余杭区", domain: "www.yuhang.gov.cn" },
  { name: "临平区", domain: "www.linping.gov.cn" },
  { name: "临安区", domain: "www.linan.gov.cn" },
  { name: "淳安县", domain: "www.chunan.gov.cn" },
  { name: "建德市", domain: "www.jiande.gov.cn" },
  // 嘉兴市 5 missing
  { name: "秀洲区", domain: "www.xiuzhou.gov.cn" },
  { name: "嘉善县", domain: "www.jiashan.gov.cn" },
  { name: "海盐县", domain: "www.haiyan.gov.cn" },
  { name: "海宁市", domain: "www.haining.gov.cn" },
  { name: "桐乡市", domain: "www.tx.gov.cn" },
  // 湖州市 5 missing
  { name: "吴兴区", domain: "www.wuxing.gov.cn" },
  { name: "南浔区", domain: "www.nanxun.gov.cn" },
  { name: "德清县", domain: "www.deqing.gov.cn" },
  { name: "长兴县", domain: "www.zjcx.gov.cn" },
  { name: "安吉县", domain: "www.anji.gov.cn" },
  // 金华市 6 missing
  { name: "婺城区", domain: "www.wucheng.gov.cn" },
  { name: "武义县", domain: "www.wuyi.gov.cn" },
  { name: "浦江县", domain: "www.pujiang.gov.cn" },
  { name: "磐安县", domain: "www.panan.gov.cn" },
  { name: "兰溪市", domain: "www.lanxi.gov.cn" },
  { name: "永康市", domain: "www.yongkang.gov.cn" },
  // 衢州市 3 missing
  { name: "衢江区", domain: "www.qujiang.gov.cn" },
  { name: "常山县", domain: "www.changshan.gov.cn" },
  { name: "江山市", domain: "www.jiangshan.gov.cn" },
  // 舟山市 4 missing
  { name: "定海区", domain: "www.dinghai.gov.cn" },
  { name: "普陀区", domain: "www.putuo.gov.cn" },
  { name: "岱山县", domain: "www.daishan.gov.cn" },
  { name: "嵊泗县", domain: "www.shengsi.gov.cn" },
  // 台州市 6 missing
  { name: "黄岩区", domain: "www.huangyan.gov.cn" },
  { name: "三门县", domain: "www.sanmen.gov.cn" },
  { name: "天台县", domain: "www.tt.gov.cn" },
  { name: "仙居县", domain: "www.xianju.gov.cn" },
  { name: "温岭市", domain: "www.wl.gov.cn" },
  { name: "临海市", domain: "www.linhai.gov.cn" },
  // 丽水市 1 missing
  { name: "莲都区", domain: "www.liandu.gov.cn" },
];

// Budget column path patterns seen in existing ZJ data
const budgetPaths = [
  "/col/col1229", // common prefix - but we need exact col numbers
];

async function findCityUrls() {
  console.log("=== Finding missing city fiscal bureau URLs ===\n");
  for (const { name, urls } of cityTests) {
    let found = null;
    for (const url of urls) {
      const r = await checkUrl(url);
      if (r.status === 200 && r.size > 500) {
        found = { url, hasBudget: r.hasBudget };
        break;
      }
      if ([301, 302].includes(r.status) && r.location) {
        const target = r.location.startsWith('http') ? r.location : new URL(r.location, url).href;
        const r2 = await checkUrl(target);
        if (r2.status === 200 && r2.size > 500) {
          found = { url: target, hasBudget: r2.hasBudget };
          break;
        }
      }
    }
    if (found) {
      console.log(`✅ ${name}: ${found.url} (budget: ${found.hasBudget})`);
    } else {
      console.log(`❌ ${name}: no fiscal bureau found`);
    }
  }
}

async function findCountyDomains() {
  console.log("\n=== Checking county government domains ===\n");
  const results = [];
  
  // Batch check: just test if domain is reachable
  for (const { name, domain } of countyTests) {
    const httpsUrl = `https://${domain}/`;
    const httpUrl = `http://${domain}/`;
    
    let r = await checkUrl(httpsUrl, 6000);
    if (r.status === 200 && r.size > 500) {
      console.log(`✅ ${name}: ${httpsUrl} (budget: ${r.hasBudget})`);
      results.push({ name, url: httpsUrl, hasBudget: r.hasBudget });
      continue;
    }
    if ([301, 302].includes(r.status) && r.location) {
      const target = r.location.startsWith('http') ? r.location : new URL(r.location, httpsUrl).href;
      console.log(`✅ ${name}: ${target} (redirect)`);
      results.push({ name, url: target, hasBudget: false });
      continue;
    }
    
    r = await checkUrl(httpUrl, 6000);
    if (r.status === 200 && r.size > 500) {
      console.log(`✅ ${name}: ${httpUrl} (budget: ${r.hasBudget})`);
      results.push({ name, url: httpUrl, hasBudget: r.hasBudget });
      continue;
    }
    if ([301, 302].includes(r.status) && r.location) {
      const target = r.location.startsWith('http') ? r.location : new URL(r.location, httpUrl).href;
      console.log(`✅ ${name}: ${target} (redirect)`);
      results.push({ name, url: target, hasBudget: false });
      continue;
    }
    
    console.log(`❌ ${name}: ${domain} unreachable`);
  }
  
  console.log(`\nReachable: ${results.length}/${countyTests.length}`);
  return results;
}

async function main() {
  await findCityUrls();
  await findCountyDomains();
}

main().catch(console.error);
