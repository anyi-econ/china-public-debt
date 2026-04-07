import http from 'http';
import https from 'https';

function get(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
      rejectUnauthorized: false
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = new URL(url).origin + loc;
        res.resume();
        return get(loc, maxRedirects - 1).then(resolve);
      }
      let body = '';
      res.on('data', d => { if (body.length < 300000) body += d.toString(); });
      res.on('end', () => resolve({ url, status: res.statusCode, loc: res.headers.location || '', len: body.length, body }));
    });
    req.on('error', e => resolve({ url, status: 'ERR:' + e.code, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', body: '' }); });
  });
}

const counties = [
  { name: '昌江区', base: 'http://www.jdzcjq.gov.cn' },
  { name: '浮梁县', base: 'https://fuliang.gov.cn' },
  { name: '乐平市', base: 'http://www.lepingshi.gov.cn' },
];

const fiscalPaths = [
  '/zwgk/zfxxgkzl/zfxxgkml/czxx/',     // 珠山区 pattern
  '/zwgk/czzj/',
  '/zwgk/czxx/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/xxgk/czzj/',
  '/xxgk/czxx/',
  '/czyjs/',
  '/czyjsgk/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zfxxgk/zfxxgkzl/zfxxgkml/czxx/',
  '/zwgk/zfxxgk/czxx/',
  '/zwgk/zfxxgkzl/czxx/',
];

async function probeCounty(county) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Probing: ${county.name} (${county.base})`);
  console.log('='.repeat(60));

  // 1. Fetch homepage
  const home = await get(county.base + '/');
  console.log(`Homepage: status=${home.status}, len=${home.len}`);

  // 2. Extract fiscal links from homepage
  const fiscalKeyRe = /href=["']([^"']+)["'][^>]*>[^<]*(?:预算|决算|财政|预决算)[^<]*<\/a>/gi;
  const hrefKeyRe = /href=["']([^"']*(?:czxx|czzj|czyjs|czyjsgk|yusuan|budget)[^"']*)["']/gi;
  
  const found = new Map();
  let m;
  while ((m = fiscalKeyRe.exec(home.body)) !== null) {
    found.set(m[1], 'text-match');
  }
  while ((m = hrefKeyRe.exec(home.body)) !== null) {
    if (!found.has(m[1])) found.set(m[1], 'href-match');
  }

  if (found.size > 0) {
    console.log('\nFiscal links from homepage:');
    for (const [href, type] of found) {
      console.log(`  [${type}] ${href}`);
    }
  }

  // 3. Also look for 政务公开 / 信息公开 links
  const zwgkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:政务公开|信息公开|重点领域)[^<]*<\/a>/gi;
  const zwgkLinks = [];
  while ((m = zwgkRe.exec(home.body)) !== null) {
    zwgkLinks.push(m[1]);
  }
  if (zwgkLinks.length > 0) {
    console.log('\n政务公开 links:');
    zwgkLinks.forEach(l => console.log('  ', l));
  }

  // 4. Probe fiscal sub-paths
  console.log('\nProbing fiscal sub-paths:');
  for (const path of fiscalPaths) {
    const url = county.base + path;
    const r = await get(url);
    const has预算 = /预算|决算|预决算/.test(r.body);
    const has财政 = /财政/.test(r.body);
    const hasDoc = /20\d{2}年.*(?:预算|决算)|(?:预算|决算).*公开|一般公共预算/.test(r.body);
    if (r.status === 200 && r.len > 500) {
      console.log(`  ✓ ${path}  status=${r.status} len=${r.len} 预算=${has预算} 财政=${has财政} docs=${hasDoc}`);
      if (hasDoc) {
        // Extract some document titles
        const titleRe = /<a[^>]*>[^<]*(\d{4}年[^<]*(?:预算|决算)[^<]*)<\/a>/gi;
        const titles = [];
        let tm;
        while ((tm = titleRe.exec(r.body)) !== null && titles.length < 5) {
          titles.push(tm[1].trim());
        }
        if (titles.length > 0) {
          console.log(`    Sample docs: ${titles.join(' | ')}`);
        }
      }
    } else if (r.status === 200) {
      console.log(`  ? ${path}  status=${r.status} len=${r.len} (short page)`);
    } else {
      // Only show non-404 errors
      if (r.status !== 404 && r.status !== 'ERR:ECONNRESET') {
        console.log(`  ✗ ${path}  status=${r.status}`);
      }
    }
  }

  // 5. If no fiscal paths found, crawl deeper - check 政务公开 page
  const zwgkPaths = ['/zwgk/', '/zfxxgk/', '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/zfxxgkml/'];
  console.log('\nChecking 政务公开 pages for fiscal sub-links:');
  for (const path of zwgkPaths) {
    const url = county.base + path;
    const r = await get(url);
    if (r.status === 200 && r.len > 500) {
      const subFound = new Map();
      const re1 = /href=["']([^"']+)["'][^>]*>[^<]*(?:预算|决算|财政|预决算公开)[^<]*<\/a>/gi;
      const re2 = /href=["']([^"']*(?:czxx|czzj|czyjs)[^"']*)["']/gi;
      while ((m = re1.exec(r.body)) !== null) subFound.set(m[1], 'text');
      while ((m = re2.exec(r.body)) !== null) if (!subFound.has(m[1])) subFound.set(m[1], 'href');
      
      if (subFound.size > 0) {
        console.log(`  ${path} (status=${r.status}, len=${r.len}):`);
        for (const [href, type] of subFound) {
          console.log(`    [${type}] ${href}`);
        }
      }
    }
  }
}

async function main() {
  for (const county of counties) {
    await probeCounty(county);
  }
  console.log('\nDone!');
}

main().catch(console.error);
