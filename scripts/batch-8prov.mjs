// Batch discover fiscal budget URLs for 8 provinces:
// 福建(remaining), 江西, 安徽, 山东, 河南, 湖南, 广西, 海南
// M4 (city portal nav) + M3 (fiscal probe) + M5 (homepage crawl)
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';
import http from 'http';

const TIMEOUT = 15000;
const CONC = 4;

function get(url, redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), TIMEOUT);
    const p = url.startsWith('https') ? https : http;
    const r = p.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0' },
      timeout: TIMEOUT,
      rejectUnauthorized: false,
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redir > 0) {
        clearTimeout(t);
        const l = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        resolve(get(l, redir - 1));
        res.resume(); return;
      }
      let d = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (d.length < 600000) d += c; });
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, body: d, finalUrl: url }); });
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
  let inP = false, cur = null, depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes(`═══════ ${name} ═══════`)) { inP = true; continue; }
    if (inP && l.includes('═══════') && !l.includes(name)) break;
    if (!inP) continue;

    // detect city-level entries (have children arrays)
    const nm = l.match(/^\s*name:\s*"([^"]+)",?\s*$/);
    if (nm) { cur = { name: nm[1], url: '', counties: [], prov: name }; continue; }
    if (cur && !cur.url) {
      const um = l.match(/^\s*url:\s*"([^"]*)"/);
      if (um) cur.url = um[1];
    }
    if (l.includes('children:') && cur && !cities.find(c => c.name === cur.name)) {
      cities.push(cur);
    }
    // Match empty county entries only
    const cm = l.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
    if (cm && cur) cur.counties.push({ name: cm[1], line: i });
  }
  return cities;
}

const PROVINCES = ['福建省', '江西省', '安徽省', '山东省', '河南省', '湖南省', '广西壮族自治区', '海南省'];
const allCities = [];
for (const p of PROVINCES) {
  for (const c of parseProvince(p)) {
    if (c.counties.length) allCities.push(c);
  }
}
console.log(`${allCities.length} cities with empty counties, ` +
  `${allCities.reduce((s,c) => s + c.counties.length, 0)} total empty slots\n`);

// ── Comprehensive fiscal sub-paths to probe ──
const FISCAL_PATHS = [
  // South China / Fujian patterns
  '/xjwz/zwgk/zfxxgkzdgz/czzj/',
  '/xjwz/zwgk/zdlyxxgk/czzj/',
  '/xjwz/zwgk/zdlyxxgk/zjxx/',
  '/xjwz/xxgk/czzj/',
  '/zwgk/zdlyxxgk/czzj/',
  // Common national patterns
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/czzj/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/czyjs/',
  '/zwgk/czxx/',
  '/zwgk/zdlyxxgk/czyjshsgjf/',
  '/zwgk/xxgk/czzj/czyjs/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zdly/czzj/',
  '/zwgk/zfxxgkzdgz/czzj/',
  '/zwgk/zdlyxxgk/czyjsgk/',
  '/zwgk/yjsgk/',
  '/zwgk/zfxxgk/fdzdgknr/czyjsgk/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/hdjl/czzj/',
  // Additional patterns for 安徽/江西/山东/河南/湖南/广西
  '/zwgk/zdlyxxgk/czsz/',
  '/zwgk/czgk/',
  '/zwgk/zfxxgk/czyjsgk/',
  '/xxgk/czyjsgk/',
  '/xxgk/czzj/',
];

const countyMatches = new Map(); // line → { url, name, method }

async function probeFiscal(base, countyName) {
  const kw = /预算|决算|财政预决算|budget/;

  // Try sub-paths in batches
  const tasks = FISCAL_PATHS.map(path => async () => {
    try {
      const url = base + path;
      const res = await get(url);
      if (res && res.status === 200 && kw.test(res.body) && res.body.length > 500) {
        return url;
      }
    } catch {}
    return null;
  });

  const results = await pool(tasks, 3);
  const hit = results.find(r => r !== null);
  if (hit) return hit;

  // M5: crawl homepage for fiscal links
  try {
    const res = await get(base + '/');
    if (res && res.status === 200) {
      const re = /href\s*=\s*["']([^"']*(?:czyjs|czzj|预算|yjs|czxx|czyjsgk|yjsgk)[^"']*)["']/gi;
      let m;
      while ((m = re.exec(res.body)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) {
          try { href = new URL(href, base).href; } catch { continue; }
        }
        // Verify it's a fiscal page
        try {
          const pg = await get(href);
          if (pg && pg.status === 200 && kw.test(pg.body) && pg.body.length > 500) {
            return href;
          }
        } catch {}
      }
    }
  } catch {}

  return null;
}

// ── Step 1: For each city, fetch homepage and find county domains, then probe ──
async function processCity(city) {
  const urlsToFetch = new Set();

  // Get city homepage(s)
  if (city.url) {
    try {
      const u = new URL(city.url);
      urlsToFetch.add(u.origin + '/');
      // If fiscal bureau subdomain (czj/cz/czt), also try main domain
      const h = u.hostname;
      const parts = h.split('.');
      if (parts[0] !== 'www' && parts.length >= 3) {
        const main = 'www.' + parts.slice(1).join('.');
        urlsToFetch.add(`http://${main}/`);
        urlsToFetch.add(`https://${main}/`);
      }
    } catch {}
  }

  // For 海南 cities with empty URLs, derive from city name
  if (!city.url) {
    // skip – no way to derive domain
    console.log(`  ${city.prov} > ${city.name}: NO URL, skipping`);
    return;
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
    const shortName = county.name.replace(/[区县市旗]$/, '');

    let bestLink = null;
    for (const link of allLinks) {
      if (link.text.includes(county.name) || (shortName.length >= 2 && link.text.includes(shortName))) {
        if (link.text.includes(county.name)) {
          bestLink = link;
          break;
        }
        if (!bestLink) bestLink = link;
      }
    }

    if (bestLink) {
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
          countyMatches.set(county.line, { name: county.name, url: baseDomain + '/', method: 'M4 (domain only)' });
          console.log(`      → domain only: ${baseDomain}/`);
        }
      } catch {}
    } else {
      console.log(`    ✗ ${county.name}: no link found`);
    }
  }
}

// Process cities sequentially to avoid overwhelming servers
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

// Summary by province
const byProv = {};
for (const city of allCities) {
  for (const county of city.counties) {
    const match = countyMatches.get(county.line);
    if (!byProv[city.prov]) byProv[city.prov] = { found: 0, total: 0 };
    byProv[city.prov].total++;
    if (match) byProv[city.prov].found++;
  }
}
console.log('\nSummary by province:');
for (const [prov, stats] of Object.entries(byProv)) {
  console.log(`  ${prov}: ${stats.found}/${stats.total}`);
}

const byMethod = {};
for (const [, m] of countyMatches) {
  byMethod[m.method] = (byMethod[m.method] || 0) + 1;
}
console.log('\nBy method:');
for (const [method, count] of Object.entries(byMethod)) {
  console.log(`  ${method}: ${count}`);
}

const totalEmpty = allCities.reduce((s,c) => s + c.counties.length, 0);
console.log(`\nTotal applied: ${appliedCount} / ${totalEmpty}`);
console.log(`Remaining empty: ${totalEmpty - appliedCount}`);

// Save full results
const resultLog = [];
for (const [lineIdx, match] of countyMatches) {
  resultLog.push({ line: lineIdx, ...match });
}
writeFileSync('scripts/batch-8prov-results.json', JSON.stringify(resultLog, null, 2));
console.log('\nResults saved to scripts/batch-8prov-results.json');
