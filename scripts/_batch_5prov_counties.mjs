#!/usr/bin/env node
/**
 * Batch probe county fiscal disclosure URLs for target provinces.
 * Reads county domains from gov-website-links.ts, identifies gaps in fiscal-budget-links.ts,
 * and tries common fiscal sub-paths on each county domain.
 */
import https from 'https';
import http from 'http';
import fs from 'fs';

const TIMEOUT = 8000;
const CONCURRENCY = 8;
const FISCAL_KEYWORDS = ['预算', '决算', '财政预决算', '预决算公开'];

// Target provinces - top 5 by county gap count
// Start with 山东省 as pilot, then expand
const TARGET_PROVINCES = process.argv[2] ? [process.argv[2]] : ['山东省', '河南省', '云南省', '湖南省', '黑龙江省'];

// Common fiscal page sub-paths, ordered by likelihood
const FISCAL_PATHS = [
  '/zwgk/czyjsgk/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/czysjs/',
  '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/',
  '/zwgk/xxgkml/czyjsgk/',
  '/zwgk/zfxxgkml/czyjsgk/',
  '/zwgk/gkml/czyjsjsgjf/',
  '/zwgk/ysjs/',
  '/zwgk/czxx/',
  '/zwgk/czsj/',
  '/xxgk/czysjs/',
  '/xxgk/czzj/',
  '/xxgk/zfxxgkml/czyjs/',
  '/__sys_block__/czyjs.html',
  '/czysindex.html',        
];

// ─── Parse data files ───

// Gov-website-links uses multi-line format:
//   { name: "XX省", url: "...", children: [
//     { name: "XX市", url: "...", children: [
//       { name: "XX区", url: "..." }
function extractGovDomains() {
  const content = fs.readFileSync('data/gov-website-links.ts', 'utf8');
  const map = {}; // { "省>市>县": "domain" }
  const lines = content.split('\n');
  let prov = '', city = '', depth = 0;
  // Track nesting by counting braces
  let braceStack = 0;
  let lastNameAtDepth = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Count opening/closing braces to track depth
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    
    // Extract name on any line
    const nm = line.match(/name:\s*"(.+?)"/);
    if (nm) {
      const name = nm[1];
      // Check next line(s) for url
      let url = '';
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const um = lines[j].match(/url:\s*"(https?:\/\/[^"]*)"/);
        if (um) { url = um[1]; break; }
        if (lines[j].match(/name:/)) break;
      }
      
      // Determine level by indentation
      const indent = line.match(/^\s*/)[0].length;
      if (indent <= 4 && name.endsWith('省')) {
        prov = name;
        city = '';
      } else if (indent <= 8 && /[市州地区盟]$/.test(name)) {
        city = name;
      } else if (prov && city && url) {
        // County-level entry with URL
        map[`${prov}>${city}>${name}`] = url.replace(/\/$/, '');
      }
    }
  }
  return map;
}

// Fiscal-budget-links uses single-line county format:
//   { name: "XX区", url: "" },
// But city names are on separate lines (multi-line format)
function extractFiscalGaps() {
  const content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
  const gaps = []; // [{ prov, city, county }]
  let prov = '', city = '';
  for (const line of content.split('\n')) {
    const pm = line.match(/═══════\s+(.+?)\s+═══════/);
    if (pm) { prov = pm[1]; continue; }
    
    // County entries are single-line: { name: "X", url: "" }
    // Check this FIRST to avoid misidentifying "市中区" as a city
    const em = line.match(/\{\s*name:\s*"(.+?)",\s*url:\s*""\s*\}/);
    if (em && prov && city && TARGET_PROVINCES.includes(prov)) {
      gaps.push({ prov, city, county: em[1] });
      continue;
    }
    
    // City names are on separate lines with higher-level indentation
    // They do NOT start with { on the same line
    if (!line.match(/\{.*name:/)) {
      const cm = line.match(/name:\s*"(.+?[市州地区盟])"/);
      if (cm) { city = cm[1]; }
    }
  }
  return gaps;
}

// ─── HTTP probing ───

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => resolve({ status: 0, url }), TIMEOUT);
    try {
      const req = mod.get(url, {
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
        rejectUnauthorized: false,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          clearTimeout(timer);
          resolve({ status: res.statusCode, redirect: res.headers.location, url });
          res.resume();
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', d => { if (body.length < 60000) body += d; });
        res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, body, url }); });
        res.on('error', () => { clearTimeout(timer); resolve({ status: res.statusCode, body, url }); });
      });
      req.on('error', () => { clearTimeout(timer); resolve({ status: 0, url }); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ status: 0, url }); });
    } catch (e) { clearTimeout(timer); resolve({ status: 0, url }); }
  });
}

function scoreBody(body) {
  if (!body || body.length < 200) return 0;
  // Reject error pages
  if (body.length < 5000 && (body.includes('404') || body.includes('找不到') || body.includes('不存在'))) return 0;
  return FISCAL_KEYWORDS.filter(kw => body.includes(kw)).length;
}

async function probeCounty(domain, countyName) {
  // Determine scheme - try https first
  let scheme = 'https';
  const homeRes = await fetchUrl(`https://${new URL(domain).hostname}/`);
  if (homeRes.status === 0) {
    const httpRes = await fetchUrl(`http://${new URL(domain).hostname}/`);
    if (httpRes.status === 0) return null;
    scheme = 'http';
  }
  
  const host = new URL(domain).hostname;
  let bestUrl = null, bestScore = 0;
  
  for (const path of FISCAL_PATHS) {
    const url = `${scheme}://${host}${path}`;
    const res = await fetchUrl(url);
    
    if (res.status === 200 && res.body) {
      const score = scoreBody(res.body);
      if (score >= 3) return { url, score, confirmed: true };
      if (score > bestScore) { bestScore = score; bestUrl = url; }
    }
    
    // Follow redirect
    if (res.redirect) {
      let redir = res.redirect;
      if (redir.startsWith('/')) redir = `${scheme}://${host}${redir}`;
      if (redir.startsWith('http')) {
        const res2 = await fetchUrl(redir);
        if (res2.status === 200 && res2.body) {
          const score = scoreBody(res2.body);
          if (score >= 3) return { url: redir, score, confirmed: true };
          if (score > bestScore) { bestScore = score; bestUrl = redir; }
        }
      }
    }
  }
  
  if (bestUrl && bestScore >= 2) return { url: bestUrl, score: bestScore, confirmed: true };
  if (bestUrl && bestScore >= 1) return { url: bestUrl, score: bestScore, confirmed: false };
  return null;
}

// ─── Batch processing with concurrency control ───

async function runBatch(items, handler, concurrency) {
  const results = [];
  let idx = 0;
  
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const result = await handler(items[i], i);
      results.push(result);
    }
  }
  
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── Main ───

async function main() {
  const govDomains = extractGovDomains();
  const gaps = extractFiscalGaps();
  
  console.log(`Found ${gaps.length} county gaps across ${TARGET_PROVINCES.join(', ')}`);
  console.log(`Gov domain map has ${Object.keys(govDomains).length} entries\n`);
  
  // Match gaps to domains
  const probeList = [];
  const noDomain = [];
  for (const gap of gaps) {
    const key = `${gap.prov}>${gap.city}>${gap.county}`;
    const domain = govDomains[key];
    if (domain) {
      probeList.push({ ...gap, domain });
    } else {
      noDomain.push(gap);
    }
  }
  
  console.log(`Probing ${probeList.length} counties (${noDomain.length} have no domain)\n`);
  
  // Group by province for progress tracking
  const confirmed = [];
  const partial = [];
  const notFound = [];
  const unreachable = [];
  let done = 0;
  
  const results = await runBatch(probeList, async (item) => {
    const result = await probeCounty(item.domain, item.county);
    done++;
    const pct = Math.round(done / probeList.length * 100);
    if (result?.confirmed) {
      console.log(`[${pct}%] ✅ ${item.prov} > ${item.city} > ${item.county}: ${result.url} (kw=${result.score})`);
      confirmed.push({ ...item, url: result.url, score: result.score });
    } else if (result) {
      console.log(`[${pct}%] ⚡ ${item.prov} > ${item.city} > ${item.county}: ${result.url} (kw=${result.score})`);
      partial.push({ ...item, url: result.url, score: result.score });
    } else {
      process.stdout.write(`[${pct}%] ❌ ${item.county}\n`);
      notFound.push(item);
    }
    return result;
  }, CONCURRENCY);
  
  // Summary
  console.log('\n\n═══════ RESULTS ═══════');
  console.log(`\nCONFIRMED (kw≥2): ${confirmed.length}`);
  for (const c of confirmed) {
    console.log(`  ${c.prov} > ${c.city} > ${c.county}: ${c.url}`);
  }
  console.log(`\nPARTIAL (kw=1): ${partial.length}`);
  for (const c of partial) {
    console.log(`  ${c.prov} > ${c.city} > ${c.county}: ${c.url}`);
  }
  console.log(`\nNOT FOUND: ${notFound.length}`);
  console.log(`NO DOMAIN: ${noDomain.length}`);
  
  // Save results
  const output = { confirmed, partial, notFound, noDomain, timestamp: new Date().toISOString() };
  fs.writeFileSync('scripts/_county_probe_5prov.json', JSON.stringify(output, null, 2));
  console.log('\nResults saved to scripts/_county_probe_5prov.json');
}

main().catch(console.error);
