// Batch discover fiscal budget URLs for 东北三省: M4 (city portal nav) + M3 (fiscal probe)
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';
import http from 'http';

const TIMEOUT = 12000;
const CONC = 4;

function get(url, redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), TIMEOUT);
    const p = url.startsWith('https') ? https : http;
    const r = p.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: TIMEOUT, rejectUnauthorized: false }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redir > 0) {
        clearTimeout(t);
        const l = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        resolve(get(l, redir - 1));
        res.resume(); return;
      }
      let d = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (d.length < 600000) d += c; });
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', e => { clearTimeout(t); reject(e); });
    r.on('timeout', () => r.destroy());
  });
}

async function pool(fns, c) {
  const res = []; let i = 0;
  const w = async () => { while (i < fns.length) { const j = i++; res[j] = await fns[j]().catch(e => null); } };
  await Promise.all(Array.from({ length: Math.min(c, fns.length) }, () => w()));
  return res;
}

// Read data file
const content = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
const lines = content.split('\n');

function parseProvince(name) {
  const cities = [];
  let inP = false, cur = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes(`═══════ ${name} ═══════`)) { inP = true; continue; }
    if (inP && l.includes('═══════') && !l.includes(name)) break;
    if (!inP) continue;
    const nm = l.match(/^\s*name:\s*"([^"]+)",?\s*$/);
    if (nm) { cur = { name: nm[1], url: '', counties: [] }; continue; }
    if (cur && !cur.url) { const um = l.match(/^\s*url:\s*"([^"]*)"/); if (um) cur.url = um[1]; }
    if (l.includes('children:') && cur && !cities.find(c => c.name === cur.name)) cities.push(cur);
    const cm = l.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
    if (cm && cur) cur.counties.push({ name: cm[1], line: i });
  }
  return cities;
}

const allCities = [];
for (const p of ['辽宁省', '吉林省', '黑龙江省']) {
  for (const c of parseProvince(p)) if (c.counties.length) allCities.push({ prov: p, ...c });
}
console.log(`${allCities.length} cities, ${allCities.reduce((s,c)=>s+c.counties.length,0)} empty counties\n`);

// ── Step 1: Fetch city homepages, extract ALL .gov.cn links & match county names ──
const countyMatches = new Map(); // line → { url, name }

async function processCity(city) {
  const urlsToFetch = new Set();
  
  // Get city homepage(s)
  if (city.url) {
    try {
      const u = new URL(city.url);
      urlsToFetch.add(u.origin + '/');
      // If fiscal bureau subdomain, also try main domain
      const h = u.hostname;
      const parts = h.split('.');
      if (parts[0] !== 'www' && parts.length >= 3) {
        const main = 'www.' + parts.slice(1).join('.');
        urlsToFetch.add(`http://${main}/`);
        urlsToFetch.add(`https://${main}/`);
      }
    } catch {}
  }
  
  // Fetch all URLs and collect .gov.cn links with context
  const allLinks = []; // { href, text }
  
  for (const url of urlsToFetch) {
    try {
      const res = await get(url);
      if (!res || res.status !== 200) continue;
      
      // Extract <a> tags with href and text
      const aRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      let m;
      while ((m = aRegex.exec(res.body)) !== null) {
        let href = m[1];
        const text = m[2].trim();
        if (href.includes('.gov.cn') || href.startsWith('/') || href.startsWith('./')) {
          if (!href.startsWith('http')) {
            try { href = new URL(href, url).href; } catch { continue; }
          }
          if (href.includes('.gov.cn')) {
            allLinks.push({ href, text });
          }
        }
      }
    } catch {}
  }
  
  console.log(`  ${city.prov} > ${city.name}: found ${allLinks.length} gov.cn links`);
  
  // Match county names to links
  for (const county of city.counties) {
    // Search for links whose text contains the county name (without 区/县/市 suffix for more matches)
    const shortName = county.name.replace(/[区县市旗]$/, '');
    
    let bestLink = null;
    for (const link of allLinks) {
      if (link.text.includes(county.name) || (shortName.length >= 2 && link.text.includes(shortName))) {
        // Prefer links with the full county name
        if (link.text.includes(county.name)) {
          bestLink = link;
          break;
        }
        if (!bestLink) bestLink = link;
      }
    }
    
    if (bestLink) {
      // Found county domain! Now try to extract the base domain and probe fiscal paths
      try {
        const u = new URL(bestLink.href);
        const baseDomain = u.origin;
        console.log(`    ✓ ${county.name} → domain: ${u.hostname}`);
        
        // Probe fiscal sub-paths
        const fiscalUrl = await probeFiscal(baseDomain, county.name);
        if (fiscalUrl) {
          countyMatches.set(county.line, { name: county.name, url: fiscalUrl, method: 'M4+M3' });
          console.log(`      → FISCAL: ${fiscalUrl}`);
        } else {
          // Store homepage as fallback
          countyMatches.set(county.line, { name: county.name, url: baseDomain + '/', method: 'M4 (homepage only)' });
          console.log(`      → homepage only: ${baseDomain}/`);
        }
      } catch {}
    }
  }
}

const FISCAL_PATHS = [
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/czzj/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/czyjs/',
  '/czysindex.html',
  '/zwgk/czxx/',
  '/zwgk/zdlyxxgk/czyjshsgjf/',
  '/zwgk/xxgk/czzj/czyjs/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zdly/czzj/',
];

async function probeFiscal(base, countyName) {
  const kw = /预算|决算|财政预决算|budget/;
  
  // Try sub-paths
  for (const path of FISCAL_PATHS) {
    try {
      const url = base + path;
      const res = await get(url);
      if (res && res.status === 200 && kw.test(res.body) && res.body.length > 500) {
        // Verify it mentions the county or is a fiscal page
        return url;
      }
    } catch {}
  }
  
  // M5: crawl homepage for fiscal links
  try {
    const res = await get(base + '/');
    if (res && res.status === 200) {
      const re = /href\s*=\s*["']([^"']*(?:czyjs|预算|yjs|czxx|czzj)[^"']*)["']/gi;
      let m;
      while ((m = re.exec(res.body)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) {
          try { href = new URL(href, base).href; } catch { continue; }
        }
        return href;
      }
    }
  } catch {}
  
  return null;
}

// Process cities sequentially to avoid overwhelming
for (const city of allCities) {
  await processCity(city);
}

// ── Apply results ──
console.log(`\n=== Applying ${countyMatches.size} URLs ===`);
let updated = [...lines];
let appliedCount = 0;
for (const [lineIdx, match] of countyMatches) {
  updated[lineIdx] = updated[lineIdx].replace('url: ""', `url: "${match.url}"`);
  appliedCount++;
}
writeFileSync('data/fiscal-budget-links.ts', updated.join('\n'));

// Summary
const byMethod = {};
for (const [, m] of countyMatches) {
  byMethod[m.method] = (byMethod[m.method] || 0) + 1;
}
console.log(`\nApplied ${appliedCount} URLs:`);
for (const [method, count] of Object.entries(byMethod)) {
  console.log(`  ${method}: ${count}`);
}

const totalEmpty = allCities.reduce((s,c)=>s+c.counties.length, 0);
console.log(`\nRemaining empty: ${totalEmpty - appliedCount} / ${totalEmpty}`);

// Save full results
const resultLog = [];
for (const [lineIdx, match] of countyMatches) {
  resultLog.push({ line: lineIdx, ...match });
}
writeFileSync('scripts/dongbei-results.json', JSON.stringify(resultLog, null, 2));
