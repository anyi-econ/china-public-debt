/**
 * v5 probe: HTTPS + longer timeout + follow redirects
 */
import https from 'https';
import http from 'http';

function request(url, timeout = 15000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve({ url, status: 'TIMEOUT', size: 0 }), timeout);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      rejectUnauthorized: false,
      timeout: 12000,
    }, res => {
      // Follow redirects
      if ([301, 302, 303, 307].includes(res.statusCode) && res.headers.location) {
        clearTimeout(timer);
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = `${u.protocol}//${u.host}${loc}`;
        }
        resolve({ url, status: res.statusCode, redirect: loc, size: 0 });
        return;
      }
      let data = '';
      res.on('data', c => { data += c; if (data.length > 60000) req.destroy(); });
      res.on('end', () => {
        clearTimeout(timer);
        const kw = ['预算', '决算', '财政', '预决算'];
        const kwCount = kw.reduce((n, k) => n + (data.includes(k) ? 1 : 0), 0);
        const isNotFound = (data.length < 500 && /not found|404|找不到/i.test(data)) || res.statusCode === 404;
        const isColRedirect = data.length === 1166 && data.includes('app.');
        resolve({
          url, status: res.statusCode, size: data.length, kwCount,
          isNotFound, isColRedirect,
          title: (data.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim()?.substring(0, 80) || '',
          fiscalLinks: [...data.matchAll(/href="([^"]*(?:czyjsgk|czzjly|sbjczyjs|预决算|czys|czzj)[^"]*)"/gi)]
            .map(m => m[1]).slice(0, 8),
        });
      });
      res.on('error', () => { clearTimeout(timer); resolve({ url, status: 'ERROR', size: 0 }); });
    });
    req.on('error', () => { clearTimeout(timer); resolve({ url, status: 'ERR', size: 0 }); });
    req.on('timeout', () => { req.destroy(); });
  });
}

const counties = [
  { name: '修水县', base: 'https://www.xiushui.gov.cn', paths: [
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/', '/xzfxxgk/czzjly/',
    '/xxgk/', '/xxgk/czyjsgk/', '/xxgk/czzjly/',
    '/fdzdxxgk/10/czyjsgk/', '/fdzdxxgk/10/czzjly/',
  ]},
  { name: '瑞昌市', base: 'https://www.ruichang.gov.cn', paths: [
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czzjly/',
    '/zwgk/zfxxgkml/', '/zwgk/zfxxgkml/czyjsgk/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/', '/fdzdxxgk/10/czzjly/',
    '/fdzdxxgk/01/04/01/',
  ]},
  { name: '浔阳区', base: 'https://www.xunyang.gov.cn', paths: [
    '/zwgk/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
    '/zwgk/zfxxgkzl/zfxxgkml/czyjsgk/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/wz/', '/wz/czyjsgk/',
  ]},
  { name: '湖口县', base: 'https://www.hukou.gov.cn', paths: [
    '/zw/', '/zw/czyjsgk/', '/zw/czzjly/',
    '/zw/zfxxgkzl/zfxxgkml/', '/zw/zfxxgkzl/zfxxgkml/czyjsgk/',
    '/zw/zfxxgkzl/fdzdgknr/czyjsgk/',
  ]},
  { name: '柴桑区', base: 'https://www.chaisang.gov.cn', paths: [
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czzjly/',
    '/zwgk/zfxxgk/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgk/czyjsgk/',
  ]},
  { name: '彭泽县', base: 'https://www.pengze.gov.cn', paths: [
    '/zw/', '/zw/czyjsgk/', '/zw/czzjly/',
    '/zw/zfxxgkzl/zfxxgkml/czyjsgk/',
  ]},
  { name: '共青城市', base: 'https://www.gongqing.gov.cn', paths: [
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/', '/fdzdxxgk/10/czzjly/',
    '/fdzdxxgk/01/04/01/',
  ]},
  { name: '武宁县', base: 'https://www.wuning.gov.cn', paths: [
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/', '/xxgk/', '/zwgk/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/',
  ]},
  { name: '永修县', base: 'https://www.yongxiu.gov.cn', paths: [
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/', '/xxgk/', '/zwgk/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/',
  ]},
  { name: '都昌县', base: 'https://www.duchang.gov.cn', paths: [
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/', '/xxgk/', '/zwgk/',
    '/zw/', '/xzfxxgk/',
  ]},
  { name: '德安县', base: 'https://www.dean.gov.cn', paths: [
    '/zwgk/czbg/', '/zwgk/czbg/czjs/', '/zwgk/czbg/czys/',
    '/zw/', '/zw/czyjsgk/',
  ]},
  // 萍乡 — Try czj subdomains directly
  { name: '湘东区_czj', base: 'http://czj.jxxd.gov.cn', paths: ['/', '/col/col2177/index.html']},
  { name: '莲花县_czj', base: 'http://czj.zglh.gov.cn', paths: ['/', '/col/col2241/index.html']},
  // 萍乡 — Try HTTPS col 
  { name: '湘东区', base: 'https://www.jxxd.gov.cn', paths: ['/col/col2830/index.html', '/col/col2177/index.html']},
  { name: '莲花县', base: 'https://www.zglh.gov.cn', paths: ['/col/col2830/index.html', '/col/col2241/index.html']},
  { name: '芦溪县', base: 'https://www.luxi.gov.cn', paths: ['/col/col2830/index.html', '/col/col2373/index.html']},
  { name: '上栗县', base: 'https://www.jxslx.gov.cn', paths: ['/col/col2830/index.html', '/col/col2373/index.html']},
  // 景德镇 — HTTPS
  { name: '昌江区', base: 'https://www.jdzcjq.gov.cn', paths: ['/col/col2830/index.html', '/col/col2373/index.html']},
  { name: '浮梁县', base: 'https://www.fuliang.gov.cn', paths: ['/col/col2830/index.html', '/col/col2373/index.html']},
];

async function main() {
  for (const c of counties) {
    console.log(`\n=== ${c.name} ===`);
    // Run all paths in parallel for each county
    const results = await Promise.all(c.paths.map(p => request(`${c.base}${p}`)));
    for (const r of results) {
      const path = r.url.replace(c.base, '');
      if (r.redirect) {
        console.log(`  → ${path} — ${r.status} → ${r.redirect}`);
      } else if (r.isNotFound) {
        console.log(`  ✗ ${path} — 404/${r.size}b`);
      } else if (r.isColRedirect) {
        console.log(`  ⊘ ${path} — COL_SPA`);
      } else if (r.status === 'TIMEOUT' || r.status === 'ERR' || r.status === 'ERROR') {
        console.log(`  ✗ ${path} — ${r.status}`);
      } else if (r.size > 300) {
        console.log(`  ✓ ${path} — ${r.size}b kw=${r.kwCount} "${r.title}"`);
        if (r.fiscalLinks.length > 0) r.fiscalLinks.forEach(l => console.log(`    📎 ${l}`));
      } else {
        console.log(`  ? ${path} — ${r.status}/${r.size}b`);
      }
    }
  }
}

main();
