/**
 * v4 targeted probe for Jiangxi 3-city counties.
 * Based on Sogou search clues + CMS structure analysis.
 */
import http from 'http';
import https from 'https';

const targets = [
  // 修水县 — /xzfxxgk/ path existed (didn't 404); Sogou shows /x... paths with 546 fiscal pages
  { name: '修水县', domain: 'www.xiushui.gov.cn', paths: [
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/', '/xzfxxgk/czyjsgk/sbjczyjs/',
    '/xzfxxgk/czzjly/', '/xzfxxgk/czzjly/sbjczyjs/',
    '/xzfxxgk/czyjsgk/czyjsgk/', '/xzfxxgk/czyjsgk/bmczykgk/',
    '/xzfxxgk/czxx/', '/xzfxxgk/czxx/czyjsgk/',
    '/xxgk/czyjsgk/', '/xxgk/czyjsgk/sbjczyjs/',
    '/xxgk/czzjly/', '/xxgk/czzjly/sbjczyjs/',
  ]},
  // 瑞昌市 — Sogou: 157 results, dept files under /zwgk/zfxxgkml/bmxxgk/
  { name: '瑞昌市', domain: 'www.ruichang.gov.cn', paths: [
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
    '/zwgk/czzjly/', '/zwgk/czzjly/sbjczyjs/',
    '/zwgk/zfxxgk/', '/zwgk/zfxxgk/fdzdgknr/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/', '/zwgk/zfxxgk/fdzdgknr/czzjly/',
    '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zfxxgkml/czzjly/',
    '/fdzdxxgk/01/', '/fdzdxxgk/01/04/', '/fdzdxxgk/01/04/01/',
    '/fdzdxxgk/10/czzjly/', '/fdzdxxgk/10/czzjly/sbjczyjs/',
  ]},
  // 浔阳区 — Sogou: 195 results, "Failed to extract" /zwgk/zfxxgkzl/zfxxgkml/czxx/
  { name: '浔阳区', domain: 'www.xunyang.gov.cn', paths: [
    '/zwgk/', '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
    '/zwgk/zfxxgkzl/zfxxgkml/czyjsgk/', '/zwgk/zfxxgkzl/zfxxgkml/czyjsgk/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/', '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/czyjsgk/',
    '/wz/czyjsgk/', '/wz/czyjsgk/sbjczyjs/',
  ]},
  // 湖口县 — Sogou: 337 results, "财政预决算 - 湖口县人民政府" at /s... path
  { name: '湖口县', domain: 'www.hukou.gov.cn', paths: [
    '/zw/', '/zw/czyjsgk/', '/zw/czyjsgk/sbjczyjs/',
    '/zw/czzjly/', '/zw/czzjly/sbjczyjs/',
    '/zw/zfxxgkzl/zfxxgkml/', '/zw/zfxxgkzl/zfxxgkml/czyjsgk/',
    '/zw/zfxxgkzl/zfxxgkml/czyjsgk/sbjczyjs/',
    '/zw/zfxxgkzl/zfxxgkml/czxx/',
    '/sbjczyjs/', '/czyjsgk/',
    '/search.htm?searchword=%E9%A2%84%E5%86%B3%E7%AE%97',
  ]},
  // 柴桑区 — 基层政务公开 section has "财政预决算" topic link
  { name: '柴桑区', domain: 'www.chaisang.gov.cn', paths: [
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/', '/zwgk/zfxxgk/fdzdgknr/czzjly/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/sbjczyjs/',
    '/zwgk/zfxxgk/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
  ]},
  // 德安县 — old path /zwgk/czbg/czjs/ works; new path /zw/ exists
  { name: '德安县', domain: 'www.dean.gov.cn', paths: [
    '/zw/czyjsgk/', '/zw/czyjsgk/sbjczyjs/',
    '/zw/czzjly/', '/zw/czzjly/sbjczyjs/',
    '/zw/zfxxgkzl/', '/zw/zfxxgkzl/fdzdgknr/',
    '/zw/zfxxgkzl/fdzdgknr/czyjsgk/', '/zw/zfxxgkzl/fdzdgknr/czzjly/',
    '/zw/zfxxgkzl/zfxxgkml/', '/zw/zfxxgkzl/zfxxgkml/czyjsgk/',
    '/zwgk/czbg/', '/zwgk/czbg/czys/',
  ]},
  // 彭泽县 — /zw/ page exists (22KB, "政务公开")
  { name: '彭泽县', domain: 'www.pengze.gov.cn', paths: [
    '/zw/czyjsgk/', '/zw/czyjsgk/sbjczyjs/',
    '/zw/czzjly/', '/zw/czzjly/sbjczyjs/',
    '/zw/zfxxgkzl/zfxxgkml/czyjsgk/', '/zw/zfxxgkzl/zfxxgkml/czyjsgk/sbjczyjs/',
    '/zw/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  // 共青城市 — /fdzdxxgk/10/ exists (344b)
  { name: '共青城市', domain: 'www.gongqing.gov.cn', paths: [
    '/fdzdxxgk/01/04/', '/fdzdxxgk/01/04/01/',
    '/fdzdxxgk/10/czyjsgk/', '/fdzdxxgk/10/czyjsgk/sbjczyjs/',
    '/fdzdxxgk/10/czzjly/', '/fdzdxxgk/10/czzjly/sbjczyjs/',
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
  ]},
  // 武宁县
  { name: '武宁县', domain: 'www.wuning.gov.cn', paths: [
    '/xxgk/', '/xxgk/czyjsgk/', '/xxgk/czyjsgk/sbjczyjs/',
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/',
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/',
  ]},
  // 永修县
  { name: '永修县', domain: 'www.yongxiu.gov.cn', paths: [
    '/xxgk/', '/xxgk/czyjsgk/', '/xxgk/czyjsgk/sbjczyjs/',
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/',
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/',
  ]},
  // 都昌县
  { name: '都昌县', domain: 'www.duchang.gov.cn', paths: [
    '/xxgk/', '/xxgk/czyjsgk/', '/xxgk/czyjsgk/sbjczyjs/',
    '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/czyjsgk/sbjczyjs/',
    '/fdzdxxgk/10/', '/fdzdxxgk/10/czyjsgk/',
    '/xzfxxgk/', '/xzfxxgk/czyjsgk/',
    '/zw/', '/zw/czyjsgk/',
  ]},
  // 萍乡4 — col CMS, try direct col numbers + czj sub-domain
  { name: '湘东区', domain: 'www.jxxd.gov.cn', paths: [
    '/col/col2177/index.html', '/col/col2830/index.html',
    '/col/col2373/index.html', '/col/col2374/index.html',
  ]},
  { name: '莲花县', domain: 'www.zglh.gov.cn', paths: [
    '/col/col2241/index.html', '/col/col2830/index.html',
    '/col/col2373/index.html', '/col/col2374/index.html',
  ]},
  { name: '芦溪县', domain: 'www.luxi.gov.cn', paths: [
    '/col/col2830/index.html', '/col/col2373/index.html',
    '/col/col2374/index.html', '/col/col2375/index.html',
  ]},
  { name: '上栗县', domain: 'www.jxslx.gov.cn', paths: [
    '/col/col2830/index.html', '/col/col2373/index.html',
    '/col/col2374/index.html', '/col/col2375/index.html',
  ]},
  // 景德镇2 col CMS
  { name: '昌江区', domain: 'www.jdzcjq.gov.cn', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html',
    '/col/col2830/index.html', '/zwgk/czyjsgk/',
  ]},
  { name: '浮梁县', domain: 'www.fuliang.gov.cn', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html',
    '/col/col2830/index.html', '/zwgk/czyjsgk/',
  ]},
];

function probe(domain, path, timeout = 8000) {
  return new Promise(resolve => {
    const url = `http://${domain}${path}`;
    const timer = setTimeout(() => resolve({ path, status: 'TIMEOUT', size: 0 }), timeout);
    const req = http.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => { data += c; if (data.length > 50000) req.destroy(); });
      res.on('end', () => {
        clearTimeout(timer);
        const kw = ['预算', '决算', '财政', 'czyjsgk', 'sbjczyjs', '预决算公开'];
        const kwCount = kw.reduce((n, k) => n + (data.includes(k) ? 1 : 0), 0);
        // Check for "Not Found" or very small redirect pages
        const isNotFound = data.length < 200 && /not found|404|找不到/i.test(data);
        const isRedirect = data.length === 1166; // col CMS redirect
        resolve({
          path,
          status: res.statusCode,
          size: data.length,
          kwCount,
          isNotFound,
          isRedirect,
          // Extract title if present
          title: (data.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim()?.substring(0, 80) || '',
          // Look for sub-links containing fiscal keywords
          fiscalLinks: [...data.matchAll(/href="([^"]*(?:czyjsgk|czzjly|sbjczyjs|预决算|预算公开|决算公开)[^"]*)"/gi)]
            .map(m => m[1]).slice(0, 5),
        });
      });
      res.on('error', () => { clearTimeout(timer); resolve({ path, status: 'ERROR', size: 0 }); });
    });
    req.on('error', () => { clearTimeout(timer); resolve({ path, status: 'ERROR', size: 0 }); });
  });
}

async function main() {
  const results = {};
  for (const t of targets) {
    console.log(`\n=== ${t.name} (${t.domain}) ===`);
    const probes = await Promise.all(t.paths.map(p => probe(t.domain, p)));
    const good = probes.filter(p => 
      p.status === 200 && !p.isNotFound && !p.isRedirect && p.size > 300
    ).sort((a, b) => b.kwCount - a.kwCount || b.size - a.size);
    
    for (const p of good) {
      console.log(`  ✓ ${p.path} — ${p.size}b, kw=${p.kwCount}, title="${p.title}"`);
      if (p.fiscalLinks.length > 0) {
        p.fiscalLinks.forEach(l => console.log(`    → ${l}`));
      }
    }
    
    const bad = probes.filter(p => !good.includes(p));
    for (const p of bad) {
      console.log(`  ✗ ${p.path} — ${p.status}, ${p.size}b${p.isRedirect ? ' [COL REDIRECT]' : ''}`);
    }
    
    results[t.name] = { domain: t.domain, good, bad: bad.map(b => ({ path: b.path, status: b.status, size: b.size })) };
  }
  
  // Summary
  console.log('\n\n========== SUMMARY ==========');
  for (const [name, r] of Object.entries(results)) {
    if (r.good.length > 0) {
      const best = r.good[0];
      console.log(`${name}: BEST=${best.path} (${best.size}b, kw=${best.kwCount}) title="${best.title}"`);
      if (best.fiscalLinks.length > 0) best.fiscalLinks.forEach(l => console.log(`  → ${l}`));
    } else {
      console.log(`${name}: NO GOOD PATHS FOUND`);
    }
  }
}

main();
