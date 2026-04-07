/**
 * Quick targeted probe for specific county URLs discovered via fetch_webpage navigation.
 * Tests specific paths + variations on known gov portal domains.
 */
import http from 'http';
import https from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';

function probe(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 6000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode)) {
          res.resume();
          const loc = res.headers.location || '';
          clearTimeout(timer);
          if (loc) {
            const full = loc.startsWith('http') ? loc : new URL(loc, url).href;
            resolve({ status: res.statusCode, redirect: full, url });
          } else {
            resolve({ status: res.statusCode, url });
          }
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          clearTimeout(timer);
          resolve({ status: res.statusCode, url });
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', ch => { body += ch; if (body.length > 40000) res.destroy(); });
        res.on('end', () => {
          clearTimeout(timer);
          const fiscal = /预[算决]算|预决算|部门预算|政府预算|财政决算|财政预算/.test(body);
          const czTitle = /财政资金|财政信息|财政局/.test(body);
          resolve({
            status: 200, url, len: body.length, fiscal, czTitle,
            title: (body.match(/<title[^>]*>([^<]+)/i) || [])[1]?.trim() || ''
          });
        });
        res.on('error', () => { clearTimeout(timer); resolve(null); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(null); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(null); });
    } catch { clearTimeout(timer); resolve(null); }
  });
}

// Test URLs - discovered patterns to verify
const tests = [
  // 厦门市 districts - try multiple fiscal paths
  ...['siming', 'haicang', 'huli', 'jimei', 'xmta', 'xiangan'].flatMap(d => {
    const base = d === 'xmta' ? `https://www.${d}.gov.cn` : `https://www.${d}.gov.cn`;
    return [
      `${base}/zwgk/xzdgk/czzj/`,
      `${base}/zwgk/zdlyxxgk/czzj/`,
      `${base}/zwgk/czzj/`,
      `${base}/xjwz/zwgk/zfxxgkzdgz/czzj/`,
      `${base}/zwgk/zdxxgk/czzj/`,
    ];
  }),
  // Some Fujian counties with patterns
  'https://www.siming.gov.cn/zwgk/zfxxgkzl/zfxxgkml/',
  'https://www.haicang.gov.cn/zwgk/zfxxgkzl/zfxxgkml/',
  'https://www.jimei.gov.cn/zwgk/zfxxgkzl/zfxxgkml/',
  'https://www.xmta.gov.cn/zwgk/zfxxgkzl/zfxxgkml/',
  'https://www.xiangan.gov.cn/zwgk/zfxxgkzl/zfxxgkml/',
];

console.log(`Testing ${tests.length} URLs...\n`);

for (let i = 0; i < tests.length; i += 10) {
  const batch = tests.slice(i, i + 10);
  const results = await Promise.all(batch.map(u => probe(u)));
  for (const r of results) {
    if (!r) {
      console.log(`  FAIL ${batch[results.indexOf(r)]}`);
    } else if (r.status === 200) {
      const flag = r.fiscal ? '✓ FISCAL' : r.czTitle ? '~ CZ' : '';
      if (flag || r.len > 1000) {
        console.log(`  ${r.status} ${flag} [${r.len}b] ${r.url} - ${r.title}`);
      }
    } else if (r.redirect) {
      console.log(`  ${r.status} -> ${r.redirect}`);
    }
  }
}

console.log('\nDone.');
