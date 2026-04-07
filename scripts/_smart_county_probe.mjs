/**
 * Province-specific county fiscal URL probe.
 * Strategy: Extract URL path patterns from FILLED counties, then probe those
 * same patterns on counties with empty URLs in the same province.
 * Much more efficient than generic path guessing.
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

// Per province: extract path patterns from filled counties
function extractPatterns(prov) {
  const paths = new Map(); // path -> count
  for (const city of (prov.children || [])) {
    for (const county of (city.children || [])) {
      if (county.url) {
        try {
          const u = new URL(county.url);
          const path = u.pathname;
          // Generalize: replace specific content IDs etc
          let gen = path;
          // Keep meaningful path structure, trim trailing specific parts
          // e.g. /zwgk/zdly/czzj/ stays as-is
          // /columns/uuid/index.html -> skip (too specific)
          if (path.includes('/columns/') || path.includes('/col/col')) continue; // UUID-based, skip
          if (path.match(/\/\d{6,}\//)) continue; // date-based paths, skip
          if (path.match(/\/art\/\d{4}\//)) continue; // article paths, skip
          if (path.match(/content_\d+/)) continue; // content ID paths, skip
          paths.set(gen, (paths.get(gen) || 0) + 1);
        } catch {}
      }
    }
  }
  return [...paths.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p);
}

// Collect per-province targets and patterns
const provData = [];
for (const prov of fiscal) {
  const patterns = extractPatterns(prov);
  if (patterns.length === 0) continue;
  
  const empty = [];
  for (const city of (prov.children || [])) {
    for (const county of (city.children || [])) {
      if (!county.url) {
        const govUrl = govMap.get(`${prov.name}/${city.name}/${county.name}`);
        if (govUrl) {
          try {
            const u = new URL(govUrl);
            empty.push({ prov: prov.name, city: city.name, county: county.name, base: `${u.protocol}//${u.hostname}` });
          } catch {}
        }
      }
    }
  }
  if (empty.length > 0) {
    provData.push({ prov: prov.name, patterns, empty });
    console.log(`${prov.name}: ${empty.length} empty, ${patterns.length} patterns:`);
    patterns.slice(0, 8).forEach(p => console.log(`  ${p}`));
  }
}

// Probe function
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

console.log(`\n=== Starting probes ===\n`);

const BATCH = 8;
let totalNew = 0;

for (const { prov, patterns, empty } of provData) {
  const todo = empty.filter(t => !alreadyFound.has(`${t.prov}/${t.city}/${t.county}`));
  if (todo.length === 0) continue;
  
  console.log(`\n--- ${prov}: ${todo.length} to probe with ${patterns.length} patterns ---`);
  let provNew = 0;
  
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const batchRes = await Promise.all(batch.map(async (t) => {
      for (const path of patterns) {
        try {
          const found = await probe(t.base + path);
          if (found) {
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
        provNew++;
        totalNew++;
        console.log(`  OK ${r.city}/${r.county} -> ${r.fiscalUrl}`);
      }
    }
  }
  
  // Save after each province
  writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
  console.log(`  ${prov}: +${provNew} (${results.length} total)`);
}

console.log(`\n=== Done. ${totalNew} new, ${results.length} total ===`);
