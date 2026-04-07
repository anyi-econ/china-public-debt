#!/usr/bin/env node
// Batch probe fiscal budget URLs for 景德镇, 萍乡, 九江 counties

import https from 'https';
import http from 'http';

const TIMEOUT = 12000;

function fetchUrl(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = u.origin + loc;
        }
        return resolve(fetchUrl(loc, maxRedirects - 1));
      }
      let body = '';
      res.on('data', d => body += d.toString());
      res.on('end', () => resolve({ status: res.statusCode, body, url: res.responseUrl || url }));
      res.on('error', () => resolve({ status: res.statusCode, body, url }));
    });
    req.on('error', e => resolve({ status: 0, body: '', url, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '', url, error: 'timeout' }); });
  });
}

function score(body) {
  const keywords = ['预算', '决算', '预决算', '财政预算', '财政决算', '预算公开', '决算公开', '一般公共预算', '政府性基金预算'];
  let s = 0;
  for (const k of keywords) {
    const matches = body.match(new RegExp(k, 'g'));
    if (matches) s += matches.length;
  }
  return s;
}

// Define all counties and their probe URLs
const counties = [
  // 景德镇市
  { city: '景德镇市', county: '昌江区', govUrl: 'http://www.jdzcjq.gov.cn/', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/czxx/', '/zwgk/czzj/', '/zwgk/czyjsgk/', '/zwgk/',
    '/zfxxgk/fdzdgknr/czyjs/', '/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czzj/'
  ]},
  { city: '景德镇市', county: '浮梁县', govUrl: 'https://fuliang.gov.cn/', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/czxx/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zfxxgk/fdzdgknr/czyjs/', '/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czzj/'
  ]},
  { city: '景德镇市', county: '乐平市', govUrl: 'http://www.lepingshi.gov.cn/', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/czxx/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zfxxgk/fdzdgknr/czyjs/', '/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czzj/'
  ]},

  // 萍乡市 (col CMS)
  { city: '萍乡市', county: '湘东区', govUrl: 'http://www.jxxd.gov.cn/', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html', '/col/col2375/index.html',
    '/col/col2181/index.html', '/col/col2182/index.html', '/col/col2183/index.html',
    '/col/col2184/index.html', '/col/col2185/index.html', '/col/col2186/index.html',
    '/col/col2187/index.html', '/col/col2188/index.html', '/col/col2189/index.html',
    '/col/col2190/index.html', '/col/col2191/index.html', '/col/col2192/index.html',
    '/col/col2193/index.html', '/col/col2194/index.html', '/col/col2195/index.html',
    '/col/col2196/index.html', '/col/col2197/index.html', '/col/col2198/index.html',
    '/col/col2199/index.html', '/col/col2200/index.html',
  ]},
  { city: '萍乡市', county: '莲花县', govUrl: 'http://www.zglh.gov.cn/', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html', '/col/col2375/index.html',
    '/col/col2241/index.html', '/col/col2242/index.html', '/col/col2243/index.html',
    '/col/col2244/index.html', '/col/col2245/index.html', '/col/col2246/index.html',
    '/col/col2247/index.html', '/col/col2248/index.html', '/col/col2249/index.html',
    '/col/col2250/index.html', '/col/col2251/index.html', '/col/col2252/index.html',
    '/col/col2253/index.html', '/col/col2254/index.html', '/col/col2255/index.html',
    '/col/col2256/index.html', '/col/col2257/index.html', '/col/col2258/index.html',
    '/col/col2259/index.html', '/col/col2260/index.html',
  ]},
  { city: '萍乡市', county: '上栗县', govUrl: 'http://www.jxslx.gov.cn/', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html', '/col/col2375/index.html',
    '/col/col2181/index.html', '/col/col2182/index.html', '/col/col2183/index.html',
    '/col/col2184/index.html', '/col/col2185/index.html', '/col/col2186/index.html',
    '/col/col2187/index.html', '/col/col2188/index.html', '/col/col2189/index.html',
    '/col/col2190/index.html', '/col/col2191/index.html', '/col/col2192/index.html',
    '/col/col2193/index.html', '/col/col2194/index.html', '/col/col2195/index.html',
    '/col/col2196/index.html', '/col/col2197/index.html', '/col/col2198/index.html',
    '/col/col2199/index.html', '/col/col2200/index.html',
  ]},
  { city: '萍乡市', county: '芦溪县', govUrl: 'http://www.luxi.gov.cn/', paths: [
    '/col/col2373/index.html', '/col/col2374/index.html', '/col/col2375/index.html',
    '/col/col2181/index.html', '/col/col2182/index.html', '/col/col2183/index.html',
    '/col/col2184/index.html', '/col/col2185/index.html', '/col/col2186/index.html',
    '/col/col2187/index.html', '/col/col2188/index.html', '/col/col2189/index.html',
    '/col/col2190/index.html', '/col/col2191/index.html', '/col/col2192/index.html',
    '/col/col2193/index.html', '/col/col2194/index.html', '/col/col2195/index.html',
    '/col/col2196/index.html', '/col/col2197/index.html', '/col/col2198/index.html',
    '/col/col2199/index.html', '/col/col2200/index.html',
  ]},

  // 九江市
  { city: '九江市', county: '浔阳区', govUrl: 'http://www.xunyang.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/2026n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgkzl/zfxxgkml/czxx/', '/zwgk/zfxxgkzl/zfxxgkml/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/zfxxgkzl/zfxxgkml/czyjs/',
  ]},
  { city: '九江市', county: '柴桑区', govUrl: 'https://www.chaisang.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/2026n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czzj/',
  ]},
  { city: '九江市', county: '武宁县', govUrl: 'http://www.wuning.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '修水县', govUrl: 'http://www.xiushui.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '永修县', govUrl: 'http://www.yongxiu.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '德安县', govUrl: 'http://www.dean.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '都昌县', govUrl: 'http://www.duchang.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '湖口县', govUrl: 'http://www.hukou.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '彭泽县', govUrl: 'http://www.pengze.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '瑞昌市', govUrl: 'http://www.ruichang.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '共青城市', govUrl: 'http://www.gongqing.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
  { city: '九江市', county: '庐山市', govUrl: 'http://www.lushan.gov.cn/', paths: [
    '/yjs/2025n/', '/yjs/', '/zwgk/czzj/', '/zwgk/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
  ]},
];

async function probeCounty(c) {
  // First check gov homepage
  const home = await fetchUrl(c.govUrl);
  const govOk = home.status >= 200 && home.status < 400;
  console.log(`[${c.city}>${c.county}] homepage: ${home.status}${home.error ? ' ERR:'+home.error : ''} (${home.body.length}b)`);
  
  if (!govOk) return { ...c, govStatus: 'FAIL', fiscalUrl: '', fiscalStatus: 'SKIP', notes: `homepage ${home.status} ${home.error||''}` };

  // Extract homepage links containing fiscal keywords
  const linkRegex = /href=["']([^"']+)["'][^>]*>([^<]*(?:预算|决算|财政资金|预决算)[^<]*)/gi;
  const homeLinks = [];
  let m;
  while ((m = linkRegex.exec(home.body)) !== null) {
    homeLinks.push({ href: m[1], text: m[2].trim() });
  }
  if (homeLinks.length > 0) {
    console.log(`  Found ${homeLinks.length} fiscal links on homepage:`);
    homeLinks.forEach(l => console.log(`    ${l.text}: ${l.href}`));
  }

  // Probe paths
  const results = [];
  const origin = new URL(c.govUrl).origin;
  
  for (const path of c.paths) {
    const url = origin + path;
    const r = await fetchUrl(url);
    const s = score(r.body);
    const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (r.status >= 200 && r.status < 400 && s > 0) {
      results.push({ url, status: r.status, score: s, title, bodyLen: r.body.length });
      console.log(`  ✓ ${path} => status=${r.status} score=${s} title="${title}" (${r.body.length}b)`);
    } else if (r.status >= 200 && r.status < 400) {
      // Check if it's just the homepage redirect
      if (r.body.length > 1000 && r.body.length !== home.body.length) {
        console.log(`  ? ${path} => status=${r.status} score=0 title="${title}" (${r.body.length}b)`);
      }
    }
  }

  // Also check homepage links
  for (const link of homeLinks.slice(0, 5)) {
    let href = link.href;
    if (href.startsWith('/')) href = origin + href;
    else if (!href.startsWith('http')) continue;
    if (href.includes('javascript:') || href === 'about:blank') continue;
    
    const r = await fetchUrl(href);
    const s = score(r.body);
    const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (r.status >= 200 && r.status < 400 && s > 2) {
      results.push({ url: href, status: r.status, score: s, title, bodyLen: r.body.length });
      console.log(`  ✓ [homepage link] ${href} => score=${s} title="${title}"`);
    }
  }

  // Pick best
  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  
  if (best && best.score >= 3) {
    return { ...c, govStatus: 'OK', fiscalUrl: best.url, fiscalStatus: 'FOUND', score: best.score, title: best.title, notes: '' };
  } else {
    return { ...c, govStatus: 'OK', fiscalUrl: '', fiscalStatus: 'NOT_FOUND', 
      notes: results.length > 0 ? `best: ${results[0].url} score=${results[0].score}` : 'no fiscal keywords found' };
  }
}

async function main() {
  const results = [];
  // Process sequentially to avoid overwhelming servers
  for (const c of counties) {
    try {
      const r = await probeCounty(c);
      results.push(r);
      console.log(`=> ${r.city}>${r.county}: ${r.fiscalStatus} ${r.fiscalUrl || '(none)'}\n`);
    } catch (e) {
      results.push({ ...c, govStatus: 'ERROR', fiscalUrl: '', fiscalStatus: 'ERROR', notes: e.message });
      console.log(`=> ${c.city}>${c.county}: ERROR ${e.message}\n`);
    }
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.city} > ${r.county}: ${r.fiscalStatus} ${r.fiscalUrl} ${r.notes || ''}`);
  }
  
  // Write results
  const fs = await import('fs');
  fs.writeFileSync('scripts/_jx3city_results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to scripts/_jx3city_results.json');
}

main().catch(console.error);
