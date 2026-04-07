/**
 * Expanded path probe - tries many more fiscal URL path variations.
 * Includes patterns observed across all provinces + common CMS patterns.
 * Races all paths per county for speed.
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

// Comprehensive fiscal URL paths (deduplicated from all prior scripts + new patterns)
const PATHS = [
  // Government information disclosure - fiscal sections
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/zdly/czzj/',
  '/zwgk/czzj/',
  '/zwgk/czxx/',
  '/zwgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/zfxxgkzdgz/czzj/',
  '/zwgk/zdxxgk/czzj/',
  '/zwgk/gkml/czzj/',
  '/zwgk/czyjs/',
  '/zwgk/czyjs/index.html',
  '/zwgk/czgk/czyjs/',
  '/zwgk/xxgk/czyjs/',
  // xjwz (new site) patterns
  '/xjwz/zwgk/zfxxgkzdgz/czzj/',
  '/xjwz/zwgk/zdlyxxgk/czzj/',
  '/xjwz/zwgkml/zdlyxxgk/czzj/',
  '/xjwz/xxgk/czzj/',
  // zfxxgk patterns
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/jcxxgk/czxx/',
  '/zfxxgk/fdzdgknr/zdlyxxgk/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  // xxgk patterns
  '/xxgk/fdzdgk/czzj/',
  '/xxgk/fdzdgknr/czzj/',
  '/xxgk/czyjsgk/',
  '/xxgk/fdzdgk/czxx/',
  '/xxgk/fdzdgknr/czxx/',
  '/xxgk/xxgkml/zdlyxxgk/czyjs/',
  '/xxgk/czxx/',
  '/xxgk/czzj/',
  // gk patterns
  '/gk/fdzdgknr/czxx/czyjs/',
  '/gk/fdzdgknr/zdlyxxgk/czyjs/',
  // Standalone
  '/czyjs/',
  '/ztzl/czyjs/',
  '/zdlyxxgk/czzj/',
  '/zdlyxxgk/czzj/',
  '/czyjsgkpt/index.html',
  // publicity patterns (Liaoning style)
  '/publicity/qzfxx/czyjs/',
  '/publicity/xzfxx/czyjs/',
  '/publicity/zdxxgz/zdlyxxgk/czyjssg/',
  // Less common
  '/zwgk/xzdgk/czzj/',
  '/zwgk/zdly/czxx/',
  '/zwgk/czgk/czyjs/ys/',
  '/xxgk/qt/gkml/czxx/ysjs/index.html',
  '/gzyjszt/',
  '/zfxxgk/fdzdgknr/czyjs.htm',
  '/zwgk/zfxxgk/fdzdgknr/czyjs.htm',
  '/zwgk/zfxxgk/fdzdgknr/czxx/czyjs.htm',
];

// Collect targets
const targets = [];
for (const prov of fiscal)
  for (const city of (prov.children || []))
    for (const county of (city.children || []))
      if (!county.url) {
        const govUrl = govMap.get(`${prov.name}/${city.name}/${county.name}`);
        if (govUrl) {
          try {
            const u = new URL(govUrl);
            targets.push({
              prov: prov.name, city: city.name, county: county.name,
              base: `${u.protocol}//${u.hostname}`
            });
          } catch {}
        }
      }

// Load existing results
const RESULT_FILE = 'scripts/_county_probe_results.json';
const results = existsSync(RESULT_FILE) ? JSON.parse(readFileSync(RESULT_FILE, 'utf8')) : [];
const alreadyFound = new Set(results.map(r => `${r.prov}/${r.city}/${r.county}`));
const todo = targets.filter(t => !alreadyFound.has(`${t.prov}/${t.city}/${t.county}`));

console.log(`${todo.length} to probe with ${PATHS.length} paths each (racing)\n`);

function probe(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
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

const BATCH = 10;
let newCount = 0;

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const batchRes = await Promise.all(batch.map(async (t) => {
    // Race all paths simultaneously
    const probes = PATHS.map(p => probe(t.base + p));
    const res = await Promise.allSettled(probes);
    for (const r of res) {
      if (r.status === 'fulfilled' && r.value) {
        return { prov: t.prov, city: t.city, county: t.county, fiscalUrl: r.value.replace(/:443\b/g, '') };
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
  
  // Save periodically
  if (i % (BATCH * 5) === 0) {
    writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
    console.log(`[${Math.min(i+BATCH, todo.length)}/${todo.length}] +${newCount} new (${results.length} total)`);
  }
}

writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
console.log(`\n=== Done. +${newCount} new, ${results.length} total ===`);
