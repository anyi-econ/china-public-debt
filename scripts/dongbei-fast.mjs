// Fast parallel dongbei discovery: processes 3 provinces simultaneously, saves incrementally
import { readFileSync, writeFileSync, existsSync } from 'fs';
import https from 'https';
import http from 'http';

const TIMEOUT = 8000;

function get(url, redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), TIMEOUT);
    const p = url.startsWith('https') ? https : http;
    const r = p.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: TIMEOUT, rejectUnauthorized: false }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redir > 0) {
        clearTimeout(t); res.resume();
        const l = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return resolve(get(l, redir - 1));
      }
      let d = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (d.length < 400000) d += c; });
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', e => { clearTimeout(t); reject(e); });
    r.on('timeout', () => r.destroy());
  });
}

const content = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
const lines = content.split('\n');

// Load existing partial results
const RESULTS_FILE = 'scripts/dongbei-results.json';
const existing = existsSync(RESULTS_FILE) ? JSON.parse(readFileSync(RESULTS_FILE, 'utf-8')) : {};

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

const FISCAL_PATHS = [
  '/zwgk/fdzdgknr/czyjs/', '/zwgk/czzj/', '/czyjs/', '/zwgk/czxx/',
  '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zdlyxxgk/czyjs/', '/czysindex.html',
  '/zwgk/zdly/czzj/', '/xxgk/czxx/', '/publicity/qzfxx/czyjs/',
];

const FISCAL_KW = /预算|决算|财政预决算|budget|czyjs|预决算/;

async function probeFiscal(base) {
  // Probe all paths in parallel (fast)
  const results = await Promise.allSettled(
    FISCAL_PATHS.map(path => get(base + path).then(r => {
      if (r && r.status === 200 && FISCAL_KW.test(r.body) && r.body.length > 500) return base + path;
      return null;
    }))
  );
  for (const r of results) if (r.status === 'fulfilled' && r.value) return r.value;

  // M5: homepage keyword crawl
  try {
    const res = await get(base + '/');
    if (res && res.status === 200) {
      const re = /href\s*=\s*["']([^"']*(?:czyjs|预算|yjs|czxx|czzj|预决算|yjsgk|yjsxx)[^"']*)["']/gi;
      let m;
      while ((m = re.exec(res.body)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) try { href = new URL(href, base).href; } catch { continue; }
        return href;
      }
    }
  } catch {}
  return null;
}

async function processCity(city, prov) {
  const key = `${prov}>${city.name}`;
  if (existing[key]) { console.log(`  [skip] ${key}`); return; }

  const urlsToFetch = new Set();
  if (city.url) {
    try {
      const u = new URL(city.url);
      urlsToFetch.add(u.origin + '/');
      const parts = u.hostname.split('.');
      if (parts[0] !== 'www' && parts.length >= 3) {
        urlsToFetch.add(`http://www.${parts.slice(1).join('.')}/`);
      }
    } catch {}
  }

  const allLinks = [];
  for (const url of urlsToFetch) {
    try {
      const res = await get(url);
      if (!res || res.status !== 200) continue;
      const aRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      let m;
      while ((m = aRegex.exec(res.body)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) try { href = new URL(href, url).href; } catch { continue; }
        if (href.includes('.gov.cn')) allLinks.push({ href, text: m[2].trim() });
      }
    } catch {}
  }

  console.log(`  ${key}: ${allLinks.length} links`);
  const cityResults = {};

  // Process all counties in parallel  
  const countyProbes = city.counties.map(county => async () => {
    const shortName = county.name.replace(/[区县市旗]$/, '');
    let bestLink = null;
    for (const link of allLinks) {
      if (link.text.includes(county.name)) { bestLink = link; break; }
      if (shortName.length >= 2 && link.text.includes(shortName) && !bestLink) bestLink = link;
    }
    if (!bestLink) return;

    try {
      const u = new URL(bestLink.href);
      const fiscalUrl = await probeFiscal(u.origin);
      cityResults[county.name] = {
        line: county.line,
        url: fiscalUrl || u.origin + '/',
        method: fiscalUrl ? 'M4+M3' : 'M4',
        domain: u.hostname,
      };
      console.log(`    ${county.name} → ${fiscalUrl ? 'FISCAL' : 'homepage'}: ${cityResults[county.name].url}`);
    } catch {}
  });

  // Run county probes 6 at a time
  for (let i = 0; i < countyProbes.length; i += 6) {
    await Promise.allSettled(countyProbes.slice(i, i + 6).map(f => f()));
  }

  existing[key] = cityResults;
  writeFileSync(RESULTS_FILE, JSON.stringify(existing, null, 2));
}

async function processProvince(name) {
  const cities = parseProvince(name).filter(c => c.counties.length);
  console.log(`\n── ${name}: ${cities.length} cities ──`);
  for (const city of cities) await processCity(city, name);
}

// Run 3 provinces in PARALLEL
await Promise.all([
  processProvince('辽宁省'),
  processProvince('吉林省'),
  processProvince('黑龙江省'),
]);

// ── Apply results ──
console.log('\n=== Applying URLs ===');
let updated = [...lines];
let count = 0;
for (const [, cityResults] of Object.entries(existing)) {
  for (const [, info] of Object.entries(cityResults)) {
    if (info.line && info.url && updated[info.line].includes('url: ""')) {
      updated[info.line] = updated[info.line].replace('url: ""', `url: "${info.url}"`);
      count++;
    }
  }
}
writeFileSync('data/fiscal-budget-links.ts', updated.join('\n'));
console.log(`Applied ${count} URLs to data file`);

// Stats
const byMethod = {};
const byProv = {};
for (const [key, cityResults] of Object.entries(existing)) {
  const prov = key.split('>')[0];
  for (const [, info] of Object.entries(cityResults)) {
    byMethod[info.method] = (byMethod[info.method] || 0) + 1;
    byProv[prov] = (byProv[prov] || 0) + 1;
  }
}
console.log('By method:', byMethod);
console.log('By province:', byProv);
