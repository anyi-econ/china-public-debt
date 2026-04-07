import http from 'node:http';
import https from 'node:https';

const COUNTIES = [
  // 德州市
  { city: "德州市", county: "宁津县", govUrl: "http://sdningjin.gov.cn" },
  { city: "德州市", county: "庆云县", govUrl: "http://www.qingyun.gov.cn" },
  { city: "德州市", county: "临邑县", govUrl: "http://www.linyixian.gov.cn" },
  { city: "德州市", county: "齐河县", govUrl: "http://www.qihe.gov.cn" },
  { city: "德州市", county: "平原县", govUrl: "http://www.zgpingyuan.gov.cn" },
  { city: "德州市", county: "夏津县", govUrl: "http://www.xiajin.gov.cn" },
  { city: "德州市", county: "武城县", govUrl: "http://www.wucheng.gov.cn" },
  { city: "德州市", county: "禹城市", govUrl: "http://www.yucheng.gov.cn" },
  { city: "德州市", county: "乐陵市", govUrl: "http://www.laoling.gov.cn" },
  // 聊城市
  { city: "聊城市", county: "东昌府区", govUrl: "http://www.dongchangfu.gov.cn" },
  { city: "聊城市", county: "茌平区", govUrl: "http://www.chiping.gov.cn" },
  { city: "聊城市", county: "阳谷县", govUrl: "http://www.yanggu.gov.cn" },
  { city: "聊城市", county: "莘县", govUrl: "http://www.shenxian.gov.cn" },
  { city: "聊城市", county: "东阿县", govUrl: "http://www.donge.gov.cn" },
  { city: "聊城市", county: "冠县", govUrl: "http://www.guanxian.gov.cn" },
  { city: "聊城市", county: "高唐县", govUrl: "http://www.gaotang.gov.cn" },
  // 滨州市
  { city: "滨州市", county: "滨城区", govUrl: "http://www.bincheng.gov.cn" },
  { city: "滨州市", county: "沾化区", govUrl: "http://www.zhanhua.gov.cn" },
  { city: "滨州市", county: "惠民县", govUrl: "http://www.huimin.gov.cn" },
  { city: "滨州市", county: "阳信县", govUrl: "http://www.yangxin.gov.cn" },
  { city: "滨州市", county: "无棣县", govUrl: "http://www.wudi.gov.cn" },
  { city: "滨州市", county: "博兴县", govUrl: "http://www.boxing.gov.cn" },
  { city: "滨州市", county: "邹平市", govUrl: "http://www.zouping.gov.cn" },
  // 菏泽市
  { city: "菏泽市", county: "牡丹区", govUrl: "http://www.mudan.gov.cn" },
  { city: "菏泽市", county: "定陶区", govUrl: "http://www.dingtao.gov.cn" },
  { city: "菏泽市", county: "曹县", govUrl: "http://www.caoxian.gov.cn" },
  { city: "菏泽市", county: "单县", govUrl: "http://www.shanxian.gov.cn" },
  { city: "菏泽市", county: "成武县", govUrl: "http://www.chengwu.gov.cn" },
  { city: "菏泽市", county: "巨野县", govUrl: "http://www.juye.gov.cn" },
  { city: "菏泽市", county: "郓城县", govUrl: "http://www.yuncheng.gov.cn" },
  { city: "菏泽市", county: "鄄城县", govUrl: "http://www.juancheng.gov.cn" },
  { city: "菏泽市", county: "东明县", govUrl: "http://www.dongming.gov.cn" },
];

// Common fiscal sub-paths to try on county gov sites
const FISCAL_PATHS = [
  '/zwgk/czyjsgk/',
  '/zwgk/czzj/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/',
  '/zwgk/czxx/',
  '/czyjs/',
  '/czxx/',
  '/gk/zfxxgk/fdzdgknr/czxx/',
  '/gk/zfxxgk/fdzdgknr/czxx.htm',
  '/zwgk/fdzdgknr/czyjs/',
  '/xxgk/czyjs/',
  '/xxgk/czxx/',
];

function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      timeout, 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ status: res.statusCode, redirect: res.headers.location, body: '' });
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; if (body.length > 50000) res.destroy(); });
      res.on('end', () => resolve({ status: res.statusCode, body }));
      res.on('error', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout', body: '' }); });
  });
}

async function probeCounty(county) {
  const base = county.govUrl.replace(/\/$/, '');
  const results = [];
  
  // First: fetch homepage and scan for fiscal-related links
  const home = await fetchUrl(base + '/', 10000);
  let homeFiscalLinks = [];
  
  if (home.status === 200 && home.body) {
    // Search for links containing fiscal keywords
    const linkRegex = /href=["']([^"']*?)["'][^>]*>([^<]*(?:财政|预算|决算|预决算|czxx|czyjs|财政信息|财政资金)[^<]*)/gi;
    let m;
    while ((m = linkRegex.exec(home.body)) !== null) {
      homeFiscalLinks.push({ href: m[1], text: m[2].trim() });
    }
    // Also search by URL patterns
    const urlRegex = /href=["']((?:[^"']*?)(?:czxx|czyjs|czyjsgk|czzj)(?:[^"']*?))["']/gi;
    while ((m = urlRegex.exec(home.body)) !== null) {
      if (!homeFiscalLinks.find(l => l.href === m[1])) {
        homeFiscalLinks.push({ href: m[1], text: '(url-match)' });
      }
    }
    // Also search for n{number} patterns that contain 财政
    const nPathRegex = /href=["']([^"']*?\/n\d+\/n\d+\/n\d+\/index\.html)["'][^>]*>[^<]*(?:财政信息|财政预决算|财政资金)/gi;
    while ((m = nPathRegex.exec(home.body)) !== null) {
      if (!homeFiscalLinks.find(l => l.href === m[1])) {
        homeFiscalLinks.push({ href: m[1], text: '(n-path fiscal)' });
      }
    }
  }
  
  // Second: try common fiscal sub-paths
  const pathResults = [];
  for (const path of FISCAL_PATHS) {
    const url = base + path;
    const res = await fetchUrl(url, 6000);
    if (res.status === 200 && res.body && res.body.length > 1000) {
      const hasKeywords = /预算|决算|预决算|财政预决算/.test(res.body);
      const isHomepage = /<title>[^<]*(首页|门户|网站)[^<]*<\/title>/i.test(res.body);
      if (hasKeywords && !isHomepage) {
        pathResults.push({ path, len: res.body.length, keywords: true });
      }
    }
  }
  
  return {
    city: county.city,
    county: county.county,
    govUrl: county.govUrl,
    homeStatus: home.status,
    homeLen: home.body?.length || 0,
    homeFiscalLinks,
    pathResults,
  };
}

// Run in batches of 4
async function main() {
  const allResults = [];
  for (let i = 0; i < COUNTIES.length; i += 4) {
    const batch = COUNTIES.slice(i, i + 4);
    console.log(`\n--- Batch ${Math.floor(i/4)+1}: ${batch.map(c => c.county).join(', ')} ---`);
    const results = await Promise.all(batch.map(c => probeCounty(c)));
    for (const r of results) {
      allResults.push(r);
      console.log(`\n${r.city} > ${r.county}: home=${r.homeStatus} (${r.homeLen}b)`);
      if (r.homeFiscalLinks.length > 0) {
        console.log(`  Homepage fiscal links:`);
        r.homeFiscalLinks.forEach(l => console.log(`    ${l.text}: ${l.href}`));
      }
      if (r.pathResults.length > 0) {
        console.log(`  Path hits:`);
        r.pathResults.forEach(p => console.log(`    ${p.path} (${p.len}b, keywords=${p.keywords})`));
      }
      if (r.homeFiscalLinks.length === 0 && r.pathResults.length === 0) {
        console.log('  No fiscal links found');
      }
    }
  }
  
  // Summary
  console.log('\n\n=== SUMMARY ===');
  const found = allResults.filter(r => r.homeFiscalLinks.length > 0 || r.pathResults.length > 0);
  const notFound = allResults.filter(r => r.homeFiscalLinks.length === 0 && r.pathResults.length === 0);
  console.log(`Found: ${found.length}, Not found: ${notFound.length}`);
  console.log('\nFound:');
  found.forEach(r => {
    const link = r.homeFiscalLinks[0]?.href || r.pathResults[0]?.path;
    console.log(`  ${r.city} > ${r.county}: ${link}`);
  });
  console.log('\nNot found:');
  notFound.forEach(r => console.log(`  ${r.city} > ${r.county} (home=${r.homeStatus})`));
  
  // Save full results
  const fs = await import('fs');
  fs.writeFileSync('scripts/shandong-batch-results.json', JSON.stringify(allResults, null, 2));
  console.log('\nResults saved to scripts/shandong-batch-results.json');
}

main().catch(console.error);
