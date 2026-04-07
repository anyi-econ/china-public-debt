import http from 'node:http';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ status: res.statusCode, body: '', redirect: res.headers.location });
        res.resume();
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function findFiscal(domain) {
  console.log(`\n=== ${domain} ===`);
  
  // Fetch homepage and collect ALL unique UUID column links
  try {
    const hp = await fetchPage(`http://www.${domain}`);
    
    // Extract all unique column UUIDs
    const uuidRegex = /columns\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g;
    const uuids = new Set();
    let match;
    while ((match = uuidRegex.exec(hp.body)) !== null) {
      uuids.add(match[1]);
    }
    
    console.log(`  Found ${uuids.size} unique column UUIDs on homepage`);
    
    // Check each column for fiscal content
    for (const uuid of uuids) {
      try {
        const url = `http://www.${domain}/columns/${uuid}/index.html`;
        const r = await fetchPage(url);
        if (r.status === 200 && /财政预决算|预算公开|财政信息|部门预算/.test(r.body) && !/页面不存在|抱歉/.test(r.body)) {
          // Extract the title from the page
          const titleMatch = r.body.match(/<title>([^<]*)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : '(no title)';
          console.log(`  *** FISCAL PAGE: /columns/${uuid}/index.html - Title: ${title}`);
          
          // Look for sub-links (预算, 决算 categories)
          const subLinks = r.body.match(/href=["'][^"']*["'][^>]*>[^<]*(?:预算|决算)[^<]*/g);
          if (subLinks) {
            subLinks.slice(0, 5).forEach(l => console.log(`    Sub-link: ${l}`));
          }
        }
      } catch(e) {
        // continue
      }
    }
  } catch(e) {
    console.log(`  Error: ${e.message}`);
  }
}

async function main() {
  const domains = [
    'sjzca.gov.cn',    // 长安区
    'xhqsjz.gov.cn',   // 新华区
    'sjzkq.gov.cn',    // 井陉矿区
    'yuhuaqu.gov.cn',  // 裕华区
    'gc.gov.cn',       // 藁城区
    'zd.gov.cn',       // 正定县
    'gyx.gov.cn',      // 高邑县
    'jzs.gov.cn',      // 晋州市
  ];
  for (const d of domains) {
    await findFiscal(d);
  }
}

main();
