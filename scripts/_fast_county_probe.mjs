/**
 * Fast province-specific county fiscal URL probe.
 * Probes ALL patterns for each county in PARALLEL (race for first hit).
 * Limits patterns to top generalizable ones per province + universal set.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import http from 'http';
import https from 'https';

function loadData(file) {
  let src = readFileSync(file, 'utf8');
  src = src.replace(/export interface \w+ \{[\s\S]*?\}/g, '');
  src = src.replace(/export const \w+(?::\s*\w+\[\])?\s*=/, 'return ');
  return new Function(src)();
}

const fiscal = loadData('data/fiscal-budget-links.ts');
const gov = loadData('data/gov-website-links.ts');

const govMap = new Map();
for (const p of gov)
  for (const c of (p.children || []))
    for (const d of (c.children || []))
      if (d.url) govMap.set(`${p.name}/${c.name}/${d.name}`, d.url);

// Universal fiscal paths (common across many provinces)
const UNIVERSAL_PATHS = [
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/zdly/czzj/',
  '/zwgk/czzj/',
  '/zwgk/czxx/',
  '/zwgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zfxxgkzdgz/czzj/',
  '/xjwz/zwgk/zfxxgkzdgz/czzj/',
  '/xjwz/zwgk/zdlyxxgk/czzj/',
  '/xxgk/fdzdgk/czzj/',
  '/xxgk/fdzdgknr/czzj/',
  '/xxgk/czyjsgk/',
  '/xxgk/fdzdgk/czxx/',
  '/xxgk/fdzdgknr/czxx/',
  '/gk/fdzdgknr/czxx/czyjs/',
  '/zwgk/czyjs/',
  '/czyjs/',
  '/zfxxgk/fdzdgknr/zdlyxxgk/czyjs/',
  '/zwgk/czgk/czyjs/',
  '/ztzl/czyjs/',
  '/zwgk/zdxxgk/czzj/',
  '/xjwz/xxgk/czzj/',
  '/xjwz/zwgkml/zdlyxxgk/czzj/',
  '/xxgk/xxgkml/zdlyxxgk/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/publicity/qzfxx/czyjs/',
  '/publicity/xzfxx/czyjs/',
  '/zfxxgk/fdzdgknr/jcxxgk/czxx/',
  '/zwgk/czyjs/index.html',
  '/xxgk/fdzdgk/czzj/',
  '/zwgk/gkml/czzj/',
];

// Per province path extraction (generalizable only)
function extractPatterns(prov) {
  const paths = new Map();
  for (const city of (prov.children || []))
    for (const county of (city.children || []))
      if (county.url) {
        try {
          const u = new URL(county.url);
          const path = u.pathname;
          // Skip county-specific paths:
          if (/\/columns\/|\/col\/col|\/\d{6,}\/|\/art\/\d{4}\/|content_\d+|\.news\.|\.dhtml|hmzf|rmzf.*\/bm|rmzf.*list|qrmzf|\.asp$/.test(path)) continue;
          if (path === '/' || path === '/home') continue;
          paths.set(path, (paths.get(path)||0)+1);
        } catch {}
      }
  // Sort by count (most common first), limit
  return [...paths.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 10).map(([p])=>p);
}

// Build probe list: universal + province-specific
const allTargets = [];
for (const prov of fiscal) {
  const provPaths = extractPatterns(prov);
  const paths = [...new Set([...provPaths, ...UNIVERSAL_PATHS])];
  
  for (const city of (prov.children || []))
    for (const county of (city.children || []))
      if (!county.url) {
        const govUrl = govMap.get(`${prov.name}/${city.name}/${county.name}`);
        if (govUrl) {
          try {
            const u = new URL(govUrl);
            allTargets.push({
              prov: prov.name, city: city.name, county: county.name,
              base: `${u.protocol}//${u.hostname}`,
              paths
            });
          } catch {}
        }
      }
}

console.log(`Total targets: ${allTargets.length}`);

// Fast probe: race all paths for a county
function probeUrl(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
        // Follow redirect once
        if ([301,302,307,308].includes(res.statusCode)) {
          res.resume();
          const loc = res.headers.location;
          if (loc && !loc.includes('404') && !loc.includes('error')) {
            const full = loc.startsWith('http') ? loc : new URL(loc, url).href;
            probeBody(full).then(r => { clearTimeout(timer); resolve(r); });
            return;
          }
          clearTimeout(timer); resolve(null); return;
        }
        if (res.statusCode !== 200) { res.resume(); clearTimeout(timer); resolve(null); return; }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', ch => { body += ch; if (body.length > 30000) res.destroy(); });
        res.on('end', () => { clearTimeout(timer); resolve(hasFiscal(body) ? url : null); });
        res.on('error', () => { clearTimeout(timer); resolve(null); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(null); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(null); });
    } catch { clearTimeout(timer); resolve(null); }
  });
}

function probeBody(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        rejectUnauthorized: false,
      }, (res) => {
        if (res.statusCode !== 200) { res.resume(); clearTimeout(timer); resolve(null); return; }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', ch => { body += ch; if (body.length > 30000) res.destroy(); });
        res.on('end', () => { clearTimeout(timer); resolve(hasFiscal(body) ? url : null); });
        res.on('error', () => { clearTimeout(timer); resolve(null); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(null); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(null); });
    } catch { clearTimeout(timer); resolve(null); }
  });
}

function hasFiscal(body) {
  if (!body || body.length < 200) return false;
  if (/404|找不到|页面不存在|not found|IIS|出错/i.test(body) && body.length < 3000) return false;
  return /预[算决]算|预决算|部门预算|政府预算|财政决算|财政预算/.test(body);
}

// Load existing results
const RESULT_FILE = 'scripts/_county_probe_results.json';
const results = existsSync(RESULT_FILE) ? JSON.parse(readFileSync(RESULT_FILE, 'utf8')) : [];
const alreadyFound = new Set(results.map(r => `${r.prov}/${r.city}/${r.county}`));

// Add the 河北 result from last run (was found but not saved)
if (!alreadyFound.has('河北省/邯郸市/峰峰矿区')) {
  results.push({ prov: '河北省', city: '邯郸市', county: '峰峰矿区', base: 'http://www.ff.gov.cn', fiscalUrl: 'http://www.ff.gov.cn/ztzl/czyjs/' });
  alreadyFound.add('河北省/邯郸市/峰峰矿区');
}

const todo = allTargets.filter(t => !alreadyFound.has(`${t.prov}/${t.city}/${t.county}`));
console.log(`Todo: ${todo.length} (${results.length} already found)\n`);

const BATCH = 12; // 12 counties at a time, each racing all their paths
let newCount = 0;

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const batchRes = await Promise.all(batch.map(async (t) => {
    // Race all paths: fire all probes simultaneously, take first success
    const probes = t.paths.map(path => probeUrl(t.base + path));
    const results = await Promise.allSettled(probes);
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        let clean = r.value.replace(/:443\b/g, '');
        return { prov: t.prov, city: t.city, county: t.county, base: t.base, fiscalUrl: clean };
      }
    }
    return null;
  }));
  
  for (const r of batchRes) {
    if (r) {
      results.push(r);
      newCount++;
      console.log(`  OK ${r.prov}/${r.city}/${r.county} -> ${r.fiscalUrl}`);
    }
  }
  
  if (i % (BATCH * 5) === 0 || newCount > 0) {
    writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
    console.log(`[${i+batch.length}/${todo.length}] +${newCount} new (${results.length} total) - saved`);
  }
}

writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
console.log(`\n=== Done. +${newCount} new, ${results.length} total ===`);
