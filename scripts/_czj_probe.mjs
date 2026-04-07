/**
 * Probe county finance bureau websites (czj.xxx.gov.cn pattern).
 * Many counties have a dedicated finance bureau site with standard paths.
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

// Collect empty counties with gov domain
const targets = [];
for (const prov of fiscal)
  for (const city of (prov.children || []))
    for (const county of (city.children || []))
      if (!county.url) {
        const govUrl = govMap.get(`${prov.name}/${city.name}/${county.name}`);
        if (govUrl) {
          try {
            const host = new URL(govUrl).hostname;
            targets.push({ prov: prov.name, city: city.name, county: county.name, host, govUrl });
          } catch {}
        }
      }

console.log(`${targets.length} empty counties with gov domains\n`);

// Generate czj subdomain URLs and other finance bureau patterns
function genCzjUrls(host) {
  // Extract domain patterns
  // e.g. www.xxx.gov.cn -> czj.xxx.gov.cn
  //      www.xxx.gov.cn -> xxx.gov.cn for czj prefix
  const parts = host.split('.');
  let domain;
  if (parts[0] === 'www') {
    domain = parts.slice(1).join('.');
  } else {
    domain = parts.join('.');
  }
  const czjBase = `http://czj.${domain}`;
  const czjBaseS = `https://czj.${domain}`;
  return [
    `${czjBase}/`,
    `${czjBaseS}/`,
    `${czjBase}/czgk/`,
    `${czjBase}/czyjs/`,
    `${czjBase}/xxgk/czyjs/`,
    `${czjBase}/zwgk/czyjs/`,
  ];
}

function probe(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
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
        res.on('end', () => {
          clearTimeout(timer);
          if (hasFiscal(body)) resolve(url);
          else resolve(null);
        });
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

const todo = targets.filter(t => !alreadyFound.has(`${t.prov}/${t.city}/${t.county}`));
console.log(`${todo.length} to probe (${results.length} already found)\n`);

const BATCH = 15;
let newCount = 0;

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const batchRes = await Promise.all(batch.map(async (t) => {
    const urls = genCzjUrls(t.host);
    const probes = urls.map(u => probe(u));
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
  
  if ((i % (BATCH * 10) === 0 && i > 0) || newCount > 0) {
    writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
  }
  if (i % (BATCH * 5) === 0) {
    console.log(`[${Math.min(i+BATCH, todo.length)}/${todo.length}] +${newCount} new`);
  }
}

writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
console.log(`\n=== Done. +${newCount} new, ${results.length} total ===`);
