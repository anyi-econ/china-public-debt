import http from 'http';
import https from 'https';

function probe(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000, rejectUnauthorized: false
    }, (res) => {
      let body = '';
      res.on('data', d => { if (body.length < 120000) body += d.toString(); });
      res.on('end', () => {
        const links = [];
        const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let m;
        while ((m = re.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/预[决]?算|czyjs|czyjsxx|预决算|财政信息/.test(href + text)) {
            links.push({ href, text: text.substring(0, 80) });
          }
        }
        // Also search for broader fiscal keywords
        const czLinks = [];
        const re2 = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((m = re2.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/财政|czxx|caizheng/.test(href + text) && text.length < 30) {
            czLinks.push({ href, text: text.substring(0, 80) });
          }
        }
        resolve({
          url, status: res.statusCode,
          loc: res.headers.location || '',
          links, czLinks,
          title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || ''
        });
      });
    });
    req.on('error', e => resolve({ url, status: 'ERR:' + e.code, links: [], czLinks: [] }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', links: [], czLinks: [] }); });
  });
}

// Follow redirect
async function probeFollow(url, depth = 0) {
  const r = await probe(url);
  if (depth < 3 && r.loc && (r.status === 301 || r.status === 302)) {
    const next = r.loc.startsWith('http') ? r.loc : new URL(r.loc, url).href;
    console.log(`  Redirect: ${url} -> ${next}`);
    return probeFollow(next, depth + 1);
  }
  return r;
}

// Haikou districts
const haikouUrls = [
  'http://xiuying.haikou.gov.cn/',
  'http://longhua.haikou.gov.cn/',
  'http://qsqzf.haikou.gov.cn/',
  'http://ml.haikou.gov.cn/',
];

// Sanya districts
const sanyaUrls = [
  'https://ht.sanya.gov.cn/',
  'https://jy.sanya.gov.cn/',
  'http://ty.sanya.gov.cn/',
  'https://yz.sanya.gov.cn/',
];

// County-level cities/counties
const countyUrls = [
  'https://www.wzs.gov.cn/',
  'https://www.wenchang.gov.cn/',
  'https://qionghai.hainan.gov.cn/',
  'https://www.wanning.gov.cn/',
  'https://www.dongfang.gov.cn/',
  'https://www.dingan.gov.cn/',
  'https://www.tunchang.gov.cn/',
  'https://www.chengmai.gov.cn/',
  'https://www.lingao.gov.cn/',
  'https://www.baisha.gov.cn/',
  'https://www.changjiang.gov.cn/',
  'https://www.ledong.gov.cn/',
  'https://www.lingshui.gov.cn/',
  'https://www.baoting.gov.cn/',
  'https://www.qiongzhong.gov.cn/',
];

async function main() {
  console.log('=== HAIKOU DISTRICTS ===');
  for (const url of haikouUrls) {
    const r = await probeFollow(url);
    console.log(`\n--- ${r.url} ---`);
    console.log(`Status: ${r.status} | Title: ${r.title}`);
    if (r.links.length) r.links.forEach(l => console.log(`  YJS: ${l.text} => ${l.href}`));
    if (r.czLinks.length) r.czLinks.slice(0, 5).forEach(l => console.log(`  CZ: ${l.text} => ${l.href}`));
    if (!r.links.length && !r.czLinks.length) console.log('  (no fiscal links on homepage)');
  }

  console.log('\n\n=== SANYA DISTRICTS ===');
  for (const url of sanyaUrls) {
    const r = await probeFollow(url);
    console.log(`\n--- ${r.url} ---`);
    console.log(`Status: ${r.status} | Title: ${r.title}`);
    if (r.links.length) r.links.forEach(l => console.log(`  YJS: ${l.text} => ${l.href}`));
    if (r.czLinks.length) r.czLinks.slice(0, 5).forEach(l => console.log(`  CZ: ${l.text} => ${l.href}`));
    if (!r.links.length && !r.czLinks.length) console.log('  (no fiscal links on homepage)');
  }

  console.log('\n\n=== COUNTY-LEVEL CITIES/COUNTIES ===');
  for (const url of countyUrls) {
    const r = await probeFollow(url);
    console.log(`\n--- ${r.url} ---`);
    console.log(`Status: ${r.status} | Title: ${r.title}`);
    if (r.links.length) r.links.forEach(l => console.log(`  YJS: ${l.text} => ${l.href}`));
    if (r.czLinks.length) r.czLinks.slice(0, 5).forEach(l => console.log(`  CZ: ${l.text} => ${l.href}`));
    if (!r.links.length && !r.czLinks.length) console.log('  (no fiscal links on homepage)');
  }
}

main().catch(console.error);
