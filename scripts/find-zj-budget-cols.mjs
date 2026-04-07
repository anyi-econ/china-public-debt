// Find budget column URLs for Zhejiang counties by scraping their homepages
import https from 'https';
import http from 'http';

function fetchPage(url, timeout = 10000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    try {
      const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        if ([301, 302].includes(res.statusCode) && res.headers.location) {
          const target = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
          fetchPage(target, timeout).then(resolve);
          res.destroy();
          return;
        }
        let data = '';
        res.on('data', chunk => { data += chunk; if (data.length > 200000) res.destroy(); });
        res.on('end', () => resolve(data));
        res.on('close', () => resolve(data));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => { req.destroy(); resolve(''); });
    } catch { resolve(''); }
  });
}

function extractBudgetLinks(html, baseUrl) {
  // Find all href/text pairs matching budget keywords
  const linkPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*(?:预[决算]|决算|财政预|预算公开)[^<]*)<\/a>/gi;
  const results = [];
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    let href = match[1];
    const text = match[2].trim();
    if (href.startsWith('/')) href = new URL(href, baseUrl).href;
    if (href.includes('.gov.cn') && !href.includes('mof.gov.cn') && !href.includes('www.gov.cn')) {
      results.push({ href, text });
    }
  }
  
  // Also look for col/col URLs near budget keywords
  const colPattern = /(?:预[决算]|决算|预算公开|财政预决算)[^]*?\/col\/col(\d+)\/index\.html|\/col\/col(\d+)\/index\.html[^]*?(?:预[决算]|决算|预算公开|财政预决算)/gi;
  while ((match = colPattern.exec(html)) !== null) {
    const colId = match[1] || match[2];
    results.push({ href: `${baseUrl}col/col${colId}/index.html`, text: `col${colId}` });
  }
  
  return results;
}

const counties = [
  // ZJ cities missing URLs
  { name: "绍兴市", url: "https://www.shaoxing.gov.cn/", city: true },
  { name: "丽水市", url: "https://www.lishui.gov.cn/", city: true },
  // Hangzhou counties
  { name: "西湖区", url: "http://www.xihu.gov.cn/" },
  { name: "余杭区", url: "https://www.yuhang.gov.cn/" },
  { name: "临平区", url: "https://www.linping.gov.cn/" },
  { name: "临安区", url: "https://www.linan.gov.cn/" },
  { name: "建德市", url: "https://www.jiande.gov.cn/" },
  // Jiaxing counties
  { name: "秀洲区", url: "https://www.xiuzhou.gov.cn/" },
  { name: "嘉善县", url: "https://www.jiashan.gov.cn/" },
  { name: "海盐县", url: "https://www.haiyan.gov.cn/" },
  { name: "海宁市", url: "https://www.haining.gov.cn/" },
  { name: "桐乡市", url: "https://www.tx.gov.cn/" },
  // Huzhou counties
  { name: "吴兴区", url: "https://www.wuxing.gov.cn/" },
  { name: "南浔区", url: "https://www.nanxun.gov.cn/" },
  { name: "德清县", url: "https://www.deqing.gov.cn/" },
  { name: "长兴县", url: "https://www.zjcx.gov.cn/" },
  { name: "安吉县", url: "https://www.anji.gov.cn/" },
  // Jinhua counties
  { name: "婺城区", url: "http://www.wucheng.gov.cn/" },
  { name: "浦江县", url: "https://www.pujiang.gov.cn/" },
  { name: "磐安县", url: "https://www.panan.gov.cn/" },
  { name: "兰溪市", url: "http://www.lanxi.gov.cn/" },
  // Quzhou counties
  { name: "江山市", url: "https://www.jiangshan.gov.cn/" },
  // Zhoushan counties
  { name: "定海区", url: "https://www.dinghai.gov.cn/" },
  { name: "普陀区", url: "https://www.putuo.gov.cn/" },
  { name: "岱山县", url: "https://www.daishan.gov.cn/" },
  { name: "嵊泗县", url: "https://www.shengsi.gov.cn/" },
  // Taizhou counties
  { name: "三门县", url: "https://www.sanmen.gov.cn/" },
  { name: "温岭市", url: "https://www.wl.gov.cn/" },
  { name: "临海市", url: "https://www.linhai.gov.cn/" },
  // Lishui counties
  { name: "莲都区", url: "https://www.liandu.gov.cn/" },
];

async function main() {
  console.log("Searching for budget disclosure links on county government sites...\n");
  
  let found = 0;
  let notFound = 0;
  
  for (const { name, url, city } of counties) {
    const html = await fetchPage(url);
    if (!html || html.length < 500) {
      console.log(`❌ ${name}: Failed to fetch ${url}`);
      notFound++;
      continue;
    }
    
    const links = extractBudgetLinks(html, url);
    
    // Also search for any `/col/col` URL patterns in the HTML
    const colMatches = [...html.matchAll(/\/col\/col(\d+)\/index\.html/g)];
    
    if (links.length > 0) {
      console.log(`✅ ${name}: Found ${links.length} budget link(s):`);
      for (const l of links) {
        console.log(`   → ${l.text}: ${l.href}`);
      }
      found++;
    } else {
      // Try secondary: look for 财政 in link text
      const fiscalPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>[^<]*(?:财政|czj)[^<]*<\/a>/gi;
      const fiscalLinks = [];
      let m;
      while ((m = fiscalPattern.exec(html)) !== null) {
        fiscalLinks.push(m[1]);
      }
      
      if (fiscalLinks.length > 0) {
        console.log(`⚠️  ${name}: No direct budget link, but found ${fiscalLinks.length} fiscal link(s):`);
        for (const l of fiscalLinks.slice(0, 3)) console.log(`   → ${l}`);
      } else {
        console.log(`❌ ${name}: No budget/fiscal links found (page size: ${html.length})`);
      }
      notFound++;
    }
  }
  
  console.log(`\nSummary: ${found} found, ${notFound} not found out of ${counties.length}`);
}

main().catch(console.error);
