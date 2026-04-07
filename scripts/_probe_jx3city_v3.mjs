#!/usr/bin/env node
// V3 - deep probe: extract col numbers from raw HTML, and find /fdzdxxgk/ sub-paths

import https from 'https';
import http from 'http';

const TIMEOUT = 12000;

function fetchRaw(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) { const u = new URL(url); loc = u.origin + loc; }
        return resolve(fetchRaw(loc, maxRedirects - 1));
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

// PART 1: Extract col numbers from 萍乡 raw HTML
async function extractColNumbers() {
  console.log('=== PART 1: Extract col numbers from 萍乡 sites ===\n');
  
  const sites = [
    { county: '湘东区', url: 'http://www.jxxd.gov.cn/' },
    { county: '芦溪县', url: 'http://www.luxi.gov.cn/' },
    { county: '莲花县', url: 'http://www.zglh.gov.cn/' },
    { county: '上栗县', url: 'http://www.jxslx.gov.cn/' },
  ];
  
  for (const s of sites) {
    const r = await fetchRaw(s.url);
    if (r.status !== 200) {
      console.log(`[${s.county}] FAIL: ${r.status}`);
      continue;
    }
    
    // Look for col references in raw HTML
    const colRefs = new Set();
    const colRegex = /col\/col(\d+)/g;
    let m;
    while ((m = colRegex.exec(r.body)) !== null) {
      colRefs.add(parseInt(m[1]));
    }
    
    // Look for 预决算 or 财政 near col references
    const fiscalColRegex = /(?:预决算|财政预决算|预算公开|决算公开)[\s\S]{0,200}?col\/col(\d+)|col\/col(\d+)[\s\S]{0,200}?(?:预决算|财政预决算|预算公开|决算公开)/g;
    const fiscalCols = new Set();
    while ((m = fiscalColRegex.exec(r.body)) !== null) {
      if (m[1]) fiscalCols.add(parseInt(m[1]));
      if (m[2]) fiscalCols.add(parseInt(m[2]));
    }
    
    // Extract all link text + col pairs
    const linkColRegex = /href\s*=\s*["'](?:[^"']*?)col\/col(\d+)[^"']*["'][^>]*>([^<]*)</gi;
    const linkPairs = [];
    while ((m = linkColRegex.exec(r.body)) !== null) {
      if (m[2].trim()) linkPairs.push({ col: parseInt(m[1]), text: m[2].trim() });
    }
    
    console.log(`[${s.county}] ${colRefs.size} col refs found: ${[...colRefs].sort((a,b)=>a-b).join(', ')}`);
    if (fiscalCols.size > 0) {
      console.log(`  FISCAL cols: ${[...fiscalCols].join(', ')}`);
    }
    // Print link pairs with fiscal keywords
    const fiscalLinks = linkPairs.filter(p => /预决算|财政|预算公开|决算公开/.test(p.text));
    if (fiscalLinks.length > 0) {
      console.log(`  Fiscal link-text pairs:`);
      fiscalLinks.forEach(p => console.log(`    col${p.col}: "${p.text}"`));
    }
    // Print ALL link pairs for reference
    if (linkPairs.length > 0) {
      console.log(`  All named links (${linkPairs.length}):`);
      linkPairs.forEach(p => console.log(`    col${p.col}: "${p.text}"`));
    }
    console.log('');
  }
}

// PART 2: Deep probe /fdzdxxgk/ paths for 修水、瑞昌 and other九江 counties
async function probeDeepPaths() {
  console.log('=== PART 2: Deep probe fiscal paths for 九江 counties ===\n');
  
  const counties = [
    { county: '修水县', base: 'https://www.xiushui.gov.cn', paths: [
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/sbjczyjs/',
      '/fdzdxxgk/10/fdzdgknr/zdlyxx/',
      '/fdzdxxgk/10/fdzdgknr/zdlyxx/czyjsgk/',
      '/xxgk/bmxxgk/czj/',
      '/fdzdxxgk/czj/',
    ]},
    { county: '瑞昌市', base: 'http://www.ruichang.gov.cn', paths: [
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/sbjczyjs/',
      '/fdzdxxgk/10/fdzdgknr/zdlyxx/',
      '/fdzdxxgk/10/fdzdgknr/zdlyxx/czyjsgk/',
    ]},
    { county: '浔阳区', base: 'http://www.xunyang.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/sbjczyjs/',
      '/zwgk/zfxxgkzl/zfxxgkml/czzjly/',
      '/zwgk/zfxxgkzl/zfxxgkml/czxx/',
      '/zwgk/zfxxgkzl/fdzdgknr/czzjly/',
      '/zwgk/zfxxgkzl/fdzdgknr/czyjsgk/',
    ]},
    { county: '柴桑区', base: 'https://www.chaisang.gov.cn', paths: [
      '/zwgk/zfxxgk/fdzdgknr/zdlyxx/',
      '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czyjsgk/',
      '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czzjly/',
      '/zwgk/zfxxgk/fdzdgknr/zdlyxx/czzjly/sbjczyjs/',
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
    ]},
    { county: '德安县', base: 'http://www.dean.gov.cn', paths: [
      '/zw/zfxxgkzl/',
      '/zw/zfxxgkzl/fdzdgknr/',
      '/zw/zfxxgkzl/fdzdgknr/czyjsgk/',
      '/zw/zfxxgkzl/fdzdgknr/czzjly/',
      '/zw/zfxxgkzl/fdzdgknr/czzjly/sbjczyjs/',
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/',
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/czyjsgk/',
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
    ]},
    { county: '湖口县', base: 'https://www.hukou.gov.cn', paths: [
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/',
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/czyjsgk/',
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/czzjly/',
      '/zw/zfxxgkzl/fdzdgknr/zdlyxx/czzjly/sbjczyjs/',
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
    ]},
    { county: '武宁县', base: 'http://www.wuning.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/fdzdxxgk/10/fdzdgknr/czzjly/',
      '/xxgk/',
    ]},
    { county: '永修县', base: 'http://www.yongxiu.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/xxgk/',
      '/zw/',
    ]},
    { county: '都昌县', base: 'http://www.duchang.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/xxgk/',
      '/zw/',
    ]},
    { county: '彭泽县', base: 'http://www.pengze.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/xxgk/',
      '/zw/',
    ]},
    { county: '共青城市', base: 'http://www.gongqing.gov.cn', paths: [
      '/fdzdxxgk/10/',
      '/fdzdxxgk/10/fdzdgknr/',
      '/fdzdxxgk/10/fdzdgknr/czyjsgk/',
      '/xxgk/',
      '/zw/',
    ]},
  ];

  const keywords = ['预算', '决算', '预决算', '一般公共预算', '政府性基金'];
  
  for (const c of counties) {
    console.log(`--- ${c.county} ---`);
    let homeLen = 0;
    const home = await fetchRaw(c.base + '/');
    if (home.status >= 200 && home.status < 400) homeLen = home.body.length;
    
    for (const p of c.paths) {
      const r = await fetchRaw(c.base + p);
      if (r.status >= 200 && r.status < 400) {
        if (Math.abs(r.body.length - homeLen) < 200) continue; // Skip redirects to home
        if (r.body.length < 300) continue;
        
        let s = 0;
        for (const k of keywords) {
          const ms = r.body.match(new RegExp(k, 'g'));
          if (ms) s += ms.length;
        }
        
        const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().substring(0, 80) : '';
        
        console.log(`  ${p} -> ${r.status} (${r.body.length}b) score=${s} "${title}"`);
      }
    }
    console.log('');
  }
}

// PART 3: Try 景德镇 with different approaches
async function probeJDZ() {
  console.log('=== PART 3: 景德镇 deep probe ===\n');
  
  // Try HTTPS for all 景德镇
  const sites = [
    { county: '昌江区', urls: [
      'http://www.jdzcjq.gov.cn/', 'https://www.jdzcjq.gov.cn/',
      'http://jdzcjq.gov.cn/', 'https://jdzcjq.gov.cn/',
    ]},
    { county: '浮梁县', urls: [
      'http://www.fuliang.gov.cn/', 'https://www.fuliang.gov.cn/',
      'http://fuliang.gov.cn/', 'https://fuliang.gov.cn/',
    ]},
    { county: '乐平市', urls: [
      'http://www.leping.gov.cn/', 'https://www.leping.gov.cn/',
      'http://www.lepingshi.gov.cn/', 'https://www.lepingshi.gov.cn/',
      'http://leping.gov.cn/', 'https://lepingshi.gov.cn/',
    ]},
  ];
  
  for (const s of sites) {
    console.log(`--- ${s.county} ---`);
    for (const url of s.urls) {
      const r = await fetchRaw(url);
      if (r.status >= 200 && r.status < 400 && r.body.length > 500) {
        const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().substring(0, 60) : '';
        console.log(`  ✓ ${url} -> ${r.status} (${r.body.length}b) "${title}"`);
      } else {
        console.log(`  ✗ ${url} -> ${r.status} ${r.error || ''} (${r.body.length}b)`);
      }
    }
    console.log('');
  }
}

async function main() {
  await extractColNumbers();
  await probeDeepPaths();
  await probeJDZ();
}

main().catch(console.error);
