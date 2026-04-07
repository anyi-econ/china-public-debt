import http from 'http';
import https from 'https';

const targetCities = [
  { name: '宿州市', urls: [
    'https://www.ahsz.gov.cn/zwgk/czzj/',
    'http://cz.ahsz.gov.cn/',
  ]},
  { name: '九江市', urls: [
    'http://czj.jiujiang.gov.cn/',
    'https://czj.jiujiang.gov.cn/',
    'https://www.jiujiang.gov.cn/zwgk/czzj/',
  ]},
  { name: '宜春市', urls: [
    'http://czj.yichun.gov.cn/',
    'https://www.yichun.gov.cn/zwgk/czzj/',
  ]},
  { name: '抚州市', urls: [
    'http://czj.jxfz.gov.cn/',
    'https://www.jxfz.gov.cn/zwgk/czzj/',
  ]},
  { name: '上饶市', urls: [
    'http://czj.shangrao.gov.cn/',
    'https://www.shangrao.gov.cn/zwgk/czzj/',
    'http://czj.sr.gov.cn/',
  ]},
  { name: '枣庄市', urls: [
    'http://czj.zaozhuang.gov.cn/',
    'https://www.zaozhuang.gov.cn/zwgk/czzj/',
  ]},
  { name: '东营市', urls: [
    'http://czj.dongying.gov.cn/',
    'https://www.dongying.gov.cn/zwgk/czzj/',
  ]},
  { name: '菏泽市', urls: [
    'http://czj.heze.gov.cn/',
    'https://www.heze.gov.cn/zwgk/czzj/',
  ]},
];

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    try {
      const req = lib.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; if (body.length > 5000) req.destroy(); });
        res.on('end', () => {
          const status = res.statusCode;
          const len = body.length;
          if ([301, 302, 303, 307].includes(status) && res.headers.location) {
            resolve({ url, status, redirect: res.headers.location, ok: false });
          } else if (status >= 200 && status < 400 && len > 500) {
            resolve({ url, status, len, ok: true });
          } else {
            resolve({ url, status, len, ok: false });
          }
        });
      });
      req.on('error', (e) => resolve({ url, ok: false, error: e.code }));
      req.on('timeout', () => { req.destroy(); resolve({ url, ok: false, timeout: true }); });
    } catch { resolve({ url, ok: false, error: true }); }
  });
}

async function main() {
  for (const city of targetCities) {
    const checks = await Promise.all(city.urls.map(u => checkUrl(u)));
    let found = false;
    for (const r of checks) {
      if (r.ok) { console.log(`✓ ${city.name}: ${r.url}`); found = true; break; }
      if (r.redirect && r.redirect.includes('gov.cn')) { console.log(`✓ ${city.name}: ${r.redirect} (redirect)`); found = true; break; }
    }
    if (!found) {
      const details = checks.map(r => r.error || (r.timeout ? 'TIMEOUT' : `${r.status}(${r.len})`)).join(', ');
      console.log(`✗ ${city.name}: [${details}]`);
    }
  }
}
main();
