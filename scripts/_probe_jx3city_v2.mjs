#!/usr/bin/env node
// V2 - probe fiscal URLs with more targeted paths based on CMS patterns discovered

import https from 'https';
import http from 'http';

const TIMEOUT = 15000;

function fetchUrl(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
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
      res.on('end', () => resolve({ status: res.statusCode, body, url }));
      res.on('error', () => resolve({ status: res.statusCode, body, url }));
    });
    req.on('error', e => resolve({ status: 0, body: '', url, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '', url, error: 'timeout' }); });
  });
}

function score(body) {
  const keywords = ['预算', '决算', '预决算', '预算公开', '决算公开', '一般公共预算', '政府性基金预算'];
  let s = 0;
  for (const k of keywords) {
    const matches = body.match(new RegExp(k, 'g'));
    if (matches) s += matches.length;
  }
  return s;
}

function findFiscalLinks(body, baseUrl) {
  const linkRegex = /href\s*=\s*["']([^"']+)["'][^>]*>[^<]*(?:预算|决算|财政预决算)[^<]*/gi;
  const links = [];
  let m;
  while ((m = linkRegex.exec(body)) !== null) {
    let href = m[1];
    if (href.startsWith('/')) href = new URL(baseUrl).origin + href;
    else if (href.startsWith('./')) href = baseUrl.replace(/\/$/, '') + href.substring(1);
    else if (!href.startsWith('http')) continue;
    links.push(href);
  }
  return [...new Set(links)];
}

// Nine county probes with targeted paths
const probes = [
  // 景德镇 - try Bing search approach
  { city: '景德镇市', county: '昌江区', domain: 'www.jdzcjq.gov.cn', paths: [
    '/zwgk/', '/zwgk/xxgkml/', '/zwgk/xxgkml/czxx/', '/zwgk/zdlyxx/czyjsgk/',
    '/xxgk/czxx/', '/xxgk/czyjs/', '/col/col100/index.html',
  ]},
  { city: '景德镇市', county: '浮梁县', domain: 'fuliang.gov.cn', paths: [
    '/xxgk/', '/xxgk/czjsgk/', '/xxgk/czxx/', '/xxgk/csyjsgk/',
    '/zwgk/czyjsgk/', '/zwgk/zdlyxx/', '/zwgk/zdlyxx/czyjsgk/',
  ]},
  { city: '景德镇市', county: '乐平市', domain: 'www.leping.gov.cn', paths: [ // try leping.gov.cn
    '/', '/zwgk/', '/zwgk/czyjsgk/', '/zwgk/zdlyxx/', '/xxgk/czxx/',
  ]},

  // 萍乡 - col CMS sites, scan col range to find 预决算
  // 安源区 confirmed: col2373 for fiscal. Other sites may use different numbers.
  // Try scanning nearby col numbers and art pattern
  { city: '萍乡市', county: '湘东区', domain: 'www.jxxd.gov.cn', paths: [
    '/art/2020/8/5/art_2830_445738.html', // Found in Baidu
    '/col/col2830/index.html',
    // Try col numbers in a wider range
    ...Array.from({length: 50}, (_, i) => `/col/col${2800 + i}/index.html`),
  ]},
  { city: '萍乡市', county: '芦溪县', domain: 'www.luxi.gov.cn', paths: [
    ...Array.from({length: 50}, (_, i) => `/col/col${2800 + i}/index.html`),
  ]},
  { city: '萍乡市', county: '莲花县', domain: 'www.zglh.gov.cn', paths: [
    // Found "县财政预决算公开" in 专题专栏
    ...Array.from({length: 50}, (_, i) => `/col/col${2800 + i}/index.html`),
  ]},
  { city: '萍乡市', county: '上栗县', domain: 'www.jxslx.gov.cn', paths: [
    ...Array.from({length: 50}, (_, i) => `/col/col${2800 + i}/index.html`),
  ]},

  // 九江 - standard CMS
  { city: '九江市', county: '浔阳区', domain: 'www.xunyang.gov.cn', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
    '/zwgk/zfxxgkzl/zfxxgkml/czzjly/',
    '/zwgk/zfxxgkzl/zfxxgkml/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/zfxxgkml/czzj/',
    '/zwgk/zfxxgkzl/zfxxgkml/czyjsgk/',
    '/zwgk/zfxxgkzl/zfxxgkml/czjj/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
  ]},
  { city: '九江市', county: '柴桑区', domain: 'www.chaisang.gov.cn', paths: [
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/sbjczyjs/',
    '/zwgk/zfxxgk/fdzdgknr/czzjly/',
    '/zwgk/zfxxgk/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czyjsgk/',
    '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czzj/',
    '/zwgk/czyjsgk/',
  ]},
  { city: '九江市', county: '武宁县', domain: 'www.wuning.gov.cn', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/', '/xxgk/csyjsgk/',
  ]},
  { city: '九江市', county: '修水县', domain: 'www.xiushui.gov.cn', paths: [
    '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/',
  ]},
  { city: '九江市', county: '永修县', domain: 'www.yongxiu.gov.cn', paths: [
    '/zw/', '/zw/czyjsgk/', '/zw/czbg/', '/zw/czjs/',
    '/xxgk/', '/xxgk/czxx/', '/xxgk/czbg/',
    '/zwgk_new/', '/zwgk_new/czyjsgk/',
  ]},
  { city: '九江市', county: '德安县', domain: 'www.dean.gov.cn', paths: [
    '/zwgk/czbg/', '/zwgk/czbg/czjs/', '/zwgk/czbg/czys/',
    '/zw/czyjsgk/', '/zw/czyjsgk/sbjczyjs/',
    '/zw/zfxxgk/fdzdgknr/czyjsgk/',
    '/zw/zfxxgk/fdzdgknr/czyjsgk/sbjczyjs/',
    '/zw/zfxxgk/fdzdgknr/czzjly/sbjczyjs/',
  ]},
  { city: '九江市', county: '都昌县', domain: 'www.duchang.gov.cn', paths: [
    '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/',
  ]},
  { city: '九江市', county: '湖口县', domain: 'www.hukou.gov.cn', paths: [
    '/xxgk/zdly/czxx/', '/xxgk/zdly/czbg/', '/xxgk/zdly/czyjsgk/',
    '/xxgk/ksll/czxx/', '/xxgk/ksll/czbg/',
    '/zwgk/zfxxgk/fdzdgknr/czyjsgk/',
  ]},
  { city: '九江市', county: '彭泽县', domain: 'www.pengze.gov.cn', paths: [
    '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/',
  ]},
  { city: '九江市', county: '瑞昌市', domain: 'www.ruichang.gov.cn', paths: [
    '/zwgk/zfxxgkzl/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/',
  ]},
  { city: '九江市', county: '共青城市', domain: 'www.gongqing.gov.cn', paths: [
    '/zwgk/zfxxgkzl/zfxxgkml/', '/zwgk/zfxxgkzl/fdzdgknr/',
    '/zwgk/zfxxgkzl/fdzdgknr/czzjly/', '/zwgk/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
    '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    '/xxgk/', '/xxgk/czxx/',
  ]},
];

async function probeCounty(c) {
  const origin = `http://${c.domain}`;
  const results = [];
  let homeLen = 0;
  
  // Check homepage first
  const home = await fetchUrl(origin + '/');
  if (home.status === 0) {
    // Try https
    const homeS = await fetchUrl(`https://${c.domain}/`);
    if (homeS.status >= 200 && homeS.status < 400) {
      homeLen = homeS.body.length;
      console.log(`[${c.county}] homepage: https OK (${homeLen}b)`);
    } else {
      console.log(`[${c.county}] homepage: FAIL ${home.error || ''}`);
      return { city: c.city, county: c.county, govStatus: 'FAIL', results: [] };
    }
  } else {
    homeLen = home.body.length;
    console.log(`[${c.county}] homepage: ${home.status} (${homeLen}b)`);
  }

  // Extract fiscal links from homepage
  const homeLinks = findFiscalLinks(home.body, origin);
  if (homeLinks.length > 0) {
    console.log(`  Homepage fiscal links: ${homeLinks.join(', ')}`);
  }

  // Probe paths (batch of 5 concurrently)
  for (let i = 0; i < c.paths.length; i += 5) {
    const batch = c.paths.slice(i, i + 5);
    const responses = await Promise.all(batch.map(p => {
      const url = (p.startsWith('http') ? p : origin + p);
      return fetchUrl(url);
    }));
    
    for (const r of responses) {
      if (r.status >= 200 && r.status < 400) {
        const s = score(r.body);
        // Skip if same size as homepage (redirect to homepage)
        if (Math.abs(r.body.length - homeLen) < 100) continue;
        if (r.body.length < 200) continue; // Too small
        
        const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().substring(0, 60) : '';
        
        if (s > 0) {
          results.push({ url: r.url, status: r.status, score: s, title, bodyLen: r.body.length });
        }
      }
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  if (results.length > 0) {
    console.log(`  TOP results:`);
    results.slice(0, 3).forEach(r => {
      console.log(`    ✓ ${r.url} score=${r.score} title="${r.title}" (${r.bodyLen}b)`);
    });
  } else {
    console.log(`  No fiscal keywords found`);
  }
  
  return { city: c.city, county: c.county, govStatus: 'OK', results, homeLinks };
}

async function main() {
  const allResults = [];
  
  for (const p of probes) {
    try {
      const r = await probeCounty(p);
      allResults.push(r);
      console.log('');
    } catch (e) {
      console.error(`ERROR ${p.county}: ${e.message}`);
      allResults.push({ city: p.city, county: p.county, govStatus: 'ERROR', results: [], error: e.message });
    }
  }

  console.log('\n=== SUMMARY ===');
  for (const r of allResults) {
    const best = r.results?.[0];
    const status = best ? `FOUND score=${best.score} ${best.url}` : 'NOT_FOUND';
    const links = r.homeLinks?.length ? ` [${r.homeLinks.length} homepage links]` : '';
    console.log(`${r.city} > ${r.county}: ${r.govStatus} ${status}${links}`);
  }

  const fs = await import('fs');
  fs.writeFileSync('scripts/_jx3city_v2_results.json', JSON.stringify(allResults, null, 2));
  console.log('\nSaved to scripts/_jx3city_v2_results.json');
}

main().catch(console.error);
