/**
 * Batch probe for county-level fiscal budget URLs.
 * Incremental: saves after every batch, so partial results survive crashes.
 * Usage: node scripts/_batch_county_probe.mjs [省名1 省名2 ...]
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

const provFilter = process.argv.slice(2);
const targets = [];
for (const p of fiscal) {
  if (provFilter.length && !provFilter.includes(p.name)) continue;
  for (const c of (p.children || []))
    for (const d of (c.children || []))
      if (!d.url) {
        const govUrl = govMap.get(`${p.name}/${c.name}/${d.name}`);
        if (govUrl) {
          try {
            const u = new URL(govUrl);
            targets.push({ prov: p.name, city: c.name, county: d.name, base: `${u.protocol}//${u.hostname}` });
          } catch {}
        }
      }
}

console.log(`Probing ${targets.length} counties...`);

const PATHS = [
  '/zwgk/zdly/czzj/',
  '/xjwz/zwgk/zdlyxxgk/czzj/',
  '/xjwz/zwgk/zfxxgkzdgz/czzj/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/xxgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/czzj/',
  '/zwgk/czgk/czyjs/',
  '/xxgk/xxgkml/czyjs/',
  '/xxgk/fdzdgk/czzjxx/',
  '/gk/fdzdgknr/zdlyxxgk/czyjs/',
  '/zfxxgk/fdzdgknr/zdlyxxgk/czyjs/',
  '/xjwz/xxgk/xxgkml/zdlyxxgk/czyjs/',
  '/xjwz/zwgk/zfxxgkml/czzj/',
  '/xxgk/fdzdgknr/zdlyxxgk/czyjshsgjfdczxx/',
  '/zfxxgk/fdzdgknr/zdlyxxgk/qjczyjs/',
  '/xxgk/fdzdgknr/czxx/',
  '/xxgk/fdzdgk/zdxxgk_1/czzj/',
  '/xxgk/fdzdgknr/czxx/bmys/',
  '/xxgk/xxgkml/zdlyxxgk/czyjs/',
  '/lagk/xxgkml/czyjs/',
];

function probe(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 8000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 6000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode)) {
          const loc = res.headers.location || '';
          res.resume();
          if (loc && !loc.includes('404') && !loc.includes('error')) {
            const full = loc.startsWith('http') ? loc : new URL(loc, url).href;
            probeGet(full).then(r => { clearTimeout(timer); resolve(r); });
            return;
          }
          clearTimeout(timer); resolve(null); return;
        }
        if (res.statusCode !== 200) { res.resume(); clearTimeout(timer); resolve(null); return; }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', ch => { body += ch; if (body.length > 40000) res.destroy(); });
        res.on('end', () => { clearTimeout(timer); resolve(hasFiscal(body) ? url : null); });
        res.on('error', () => { clearTimeout(timer); resolve(null); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(null); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(null); });
    } catch { clearTimeout(timer); resolve(null); }
  });
}

function probeGet(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 6000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        rejectUnauthorized: false,
      }, (res) => {
        if (res.statusCode !== 200) { res.resume(); clearTimeout(timer); resolve(null); return; }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', ch => { body += ch; if (body.length > 40000) res.destroy(); });
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

// Filter out already-found
const todo = targets.filter(t => !alreadyFound.has(`${t.prov}/${t.city}/${t.county}`));
console.log(`${todo.length} remaining after excluding ${results.length} already found.`);

const BATCH = 8;
let newCount = 0;

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const batchRes = await Promise.all(batch.map(async (t) => {
    for (const path of PATHS) {
      try {
        const found = await probe(t.base + path);
        if (found) {
          // Clean up port 443 in URL
          const clean = found.replace(':443/', '/').replace(':443', '');
          return { ...t, fiscalUrl: clean };
        }
      } catch {}
    }
    return null;
  }));
  for (const r of batchRes) {
    if (r) {
      results.push(r);
      newCount++;
      console.log(`  OK ${r.prov}>${r.city}>${r.county} -> ${r.fiscalUrl}`);
    }
  }
  // Save incrementally every 5 batches
  const done = Math.min(i + BATCH, todo.length);
  if ((Math.floor(i / BATCH)) % 5 === 4 || done === todo.length) {
    writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
    console.log(`  [${done}/${todo.length}] ${newCount} new (${results.length} total) - saved`);
  }
}

console.log(`\nDone. ${newCount} new URLs found. ${results.length} total.`);
// Summary by province
const byProv = {};
for (const r of results) { byProv[r.prov] = (byProv[r.prov] || 0) + 1; }
for (const [p, c] of Object.entries(byProv).sort((a,b) => b[1]-a[1])) console.log(`  ${p}: ${c}`);
