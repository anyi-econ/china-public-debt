// Batch discover fiscal budget URLs for Hubei + Hunan counties
// Phase 1: Fast HEAD checks on known CMS patterns
// Phase 2: GET + verify with fiscal keyword scoring 
// Phase 3: M5 homepage crawl for remaining
import { readFileSync, writeFileSync, existsSync } from 'fs';
import https from 'https';
import http from 'http';

const TIMEOUT = 10000;
const CONCURRENCY = 8;
const RESULTS_FILE = 'scripts/hunan-hubei-results.json';

function httpReq(url, method = 'GET', redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { reject(new Error('timeout')); }, TIMEOUT);
    const mod = url.startsWith('https') ? https : http;
    const opts = {
      method,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: TIMEOUT - 1000,
      rejectUnauthorized: false,
    };
    const r = mod.request(url, opts, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redir > 0) {
        clearTimeout(t); res.resume();
        let loc = res.headers.location;
        if (!loc.startsWith('http')) try { loc = new URL(loc, url).href; } catch { clearTimeout(t); resolve(null); return; }
        return resolve(httpReq(loc, method, redir - 1));
      }
      if (method === 'HEAD') { clearTimeout(t); res.resume(); resolve({ status: res.statusCode }); return; }
      let d = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (d.length < 500000) d += c; });
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', () => { clearTimeout(t); resolve(null); });
    r.on('timeout', () => { r.destroy(); });
    r.end();
  });
}

// Fiscal sub-paths ordered by likelihood for Hubei/Hunan county CMS patterns
const HUBEI_PATHS = [
  '/xxgk/xxgkml/czzj/',
  '/xxgk/gkml/czzj/',
  '/xxgk/fdzdgk/czzj/',
  '/zwgk/fdzdgknr/czzj/',
  '/zwgk/xxgk/czzj/czyjs/',
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/czzj/',
  '/zwgk/czxx/',
  '/czyjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zdly/czzj/',
  '/zwgk/czgk/czyjs/',
  '/zwgk/czgk/',
  '/bmfw/gxbcyjs/',
  '/ztzl/gxbcyjs/',
  '/ztzl/gxbcyjs/index.shtml',
  '/xxgk/fdzdgk/ysjs/',
  '/zwgk/grassroots/column/',
];

const HUNAN_PATHS = [
  // Hunan CMS patterns (based on found URLs)
  '/czyjsgkzl/',
  '/czxx/list.shtml',
  '/czxx/',
  '/yjsgk/index.html',
  '/yjsgk/',
  '/nbmyjs/list_czyjs.shtml',
  // Standard paths
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/czxx/',
  '/zwgk/czzj/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/xxgk/czxx/',
  '/czyjs/',
  '/zwgk/czgk/',
  '/zwgk/czgk/czyjs/',
];

// Hunan county sites often nest under a subdirectory named after the county
// e.g., http://www.beita.gov.cn/beita/nbmyjs/list_czyjs.shtml
function getHunanSubdirPaths(hostname) {
  // Extract potential subdirectory name from hostname
  const parts = hostname.replace('.gov.cn', '').split('.');
  const subdirs = parts.filter(p => p !== 'www' && p.length > 1);
  const extra = [];
  for (const sub of subdirs) {
    extra.push(
      `/${sub}/czyjsgkzl/`,
      `/${sub}/czxx/list.shtml`,
      `/${sub}/nbmyjs/list_czyjs.shtml`,
      `/${sub}/czxx/`,
      `/${sub}/yjsgk/`,
    );
  }
  return extra;
}

const FISCAL_KW_STRONG = /预决算公开|财政预决算|部门预算|政府预算|一般公共预算|预算公开|决算公开/;
const FISCAL_KW_WEAK = /预算|决算/;

function scorePage(body) {
  if (!body || body.length < 300) return 0;
  let s = 0;
  if (/预决算公开/.test(body)) s += 5;
  if (/财政预决算/.test(body)) s += 5;
  if (/部门预算/.test(body)) s += 3;
  if (/政府预算/.test(body)) s += 3;
  if (/一般公共预算/.test(body)) s += 4;
  if (/政府性基金/.test(body)) s += 3;
  if (/预算公开/.test(body)) s += 3;
  if (/决算公开/.test(body)) s += 3;
  if (/三公.*经费/.test(body)) s += 2;
  // Penalize non-fiscal pages
  if (/应急管理|安全生产|自然灾害|食品药品/.test(body) && s < 5) s -= 3;
  return s;
}

// Parse fiscal data to find counties with empty URLs
function parseFiscalData(provName) {
  const content = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
  const startMarker = `// ═══════ ${provName} ═══════`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) { console.error(`Cannot find ${startMarker}`); return []; }

  // Find the next province comment
  const afterStart = content.substring(startIdx + startMarker.length);
  const nextMatch = afterStart.indexOf('// ═══════');
  const section = nextMatch !== -1
    ? afterStart.substring(0, nextMatch)
    : afterStart;

  const lines = section.split('\n');
  const cities = [];
  let curCity = null;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // City with children
    const cityMatch = l.match(/^\s*name:\s*"([^"]+)"/);
    if (cityMatch && cityMatch[1] !== provName) {
      // Look ahead for children
      const ahead = lines.slice(i, i + 5).join('\n');
      if (ahead.includes('children:')) {
        curCity = { name: cityMatch[1], counties: [] };
        cities.push(curCity);
      }
    }
    // County with empty URL
    const emptyMatch = l.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
    if (emptyMatch && curCity) {
      curCity.counties.push({ name: emptyMatch[1] });
    }
  }
  console.log(`  parseFiscalData(${provName}): ${cities.length} cities, ${cities.reduce((s,c)=>s+c.counties.length,0)} counties`);
  return cities;
}

// Parse gov portal URLs
function parseGovUrls(provName) {
  const content = readFileSync('data/gov-website-links.ts', 'utf-8');
  const startMarker = `name: "${provName}"`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return {};

  const afterSection = content.substring(startIdx + startMarker.length);
  const nextProvMatch = afterSection.match(/\n\s{4}name: "(?:.*?省|.*?自治区|.*?特别行政区)"/);
  const endIdx = nextProvMatch
    ? startIdx + startMarker.length + nextProvMatch.index
    : content.length;

  const section = content.substring(startIdx, endIdx);
  const map = {};
  const lines = section.split('\n');
  let pendingName = null;
  for (const l of lines) {
    const nm = l.match(/name:\s*"([^"]+)"/);
    if (nm) pendingName = nm[1];
    const um = l.match(/url:\s*"([^"]+)"/);
    if (um && pendingName) { map[pendingName] = um[1]; pendingName = null; }
  }
  return map;
}

async function probeCounty(govUrl, paths) {
  const base = govUrl.replace(/\/+$/, '');
  const hostname = new URL(base).hostname;
  
  // Phase 1: parallel HEAD checks on all paths
  const allPaths = [...paths];
  // Add HTTPS variant if HTTP
  const bases = [base];
  if (base.startsWith('http://')) bases.push(base.replace('http://', 'https://'));

  const candidates = [];
  
  for (const b of bases) {
    const headChecks = allPaths.map(async (path) => {
      try {
        const r = await httpReq(b + path, 'HEAD');
        if (r && r.status === 200) candidates.push(b + path);
      } catch {}
    });
    await Promise.allSettled(headChecks);
    if (candidates.length > 0) break; // If http works, skip https
  }

  if (candidates.length === 0) return null;

  // Phase 2: GET top candidates, score for fiscal keywords
  let best = null;
  let bestScore = 0;

  for (const url of candidates) {
    try {
      const r = await httpReq(url);
      if (!r || r.status !== 200) continue;
      const score = scorePage(r.body);
      if (score > bestScore) { bestScore = score; best = url; }
    } catch {}
  }

  if (best && bestScore >= 3) return { url: best, score: bestScore, method: 'M3' };
  
  // Phase 3: M5 homepage crawl - look for links with fiscal keywords IN THE URL
  for (const b of bases) {
    try {
      const res = await httpReq(b + '/');
      if (!res || res.status !== 200) continue;
      
      // Find links with fiscal keywords in URL or link text
      const urlKw = /czyjs|czyjsgk|yjs|czxx|czzj.*(?:yjs|ys|js)|预决算|czgk|yjsgk|nbmyjs/i;
      const textKw = /预算|决算|预决算|财政预决算/;
      const linkRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      
      const links = [];
      let m;
      while ((m = linkRegex.exec(res.body)) !== null) {
        let href = m[1];
        const text = m[2].trim();
        if (href.includes('mof.gov.cn') || href.includes('www.gov.cn') || href.includes('javascript:')) continue;
        if (!href.startsWith('http')) try { href = new URL(href, b).href; } catch { continue; }
        
        const urlMatch = urlKw.test(href);
        const textMatch = textKw.test(text);
        if (urlMatch || textMatch) links.push({ href, text, urlMatch, textMatch });
      }

      // Prioritize links where both URL and text match
      links.sort((a, b) => (b.urlMatch + b.textMatch) - (a.urlMatch + a.textMatch));

      for (const link of links.slice(0, 3)) {
        try {
          const r = await httpReq(link.href);
          if (!r || r.status !== 200) continue;
          const score = scorePage(r.body);
          if (score >= 3) return { url: link.href, score, method: 'M5' };
        } catch {}
      }
    } catch {}
  }

  // Return weak M3 result if we had any
  if (best && bestScore > 0) return { url: best, score: bestScore, method: 'M3-weak' };
  return null;
}

async function run() {
  const results = existsSync(RESULTS_FILE)
    ? JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'))
    : {};

  for (const [prov, pathSet] of [['湖北省', HUBEI_PATHS], ['湖南省', HUNAN_PATHS]]) {
    const cities = parseFiscalData(prov);
    const govMap = parseGovUrls(prov);
    const total = cities.reduce((s, c) => s + c.counties.length, 0);
    console.log(`\n═══ ${prov}: ${cities.length} cities, ${total} counties ═══`);

    if (!results[prov]) results[prov] = {};

    for (const city of cities) {
      if (!city.counties.length) continue;
      console.log(`\n── ${city.name} (${city.counties.length}) ──`);

      const tasks = city.counties.map(county => async () => {
        const key = `${city.name}>${county.name}`;
        // Skip if already found (not error/not-found)
        if (results[prov][key]?.url) {
          console.log(`  [ok] ${county.name}`);
          return;
        }

        const govUrl = govMap[county.name];
        if (!govUrl) {
          console.log(`  [no-gov] ${county.name}`);
          results[prov][key] = { status: 'no-gov' };
          return;
        }

        console.log(`  [probe] ${county.name} → ${govUrl}`);
        try {
          // For Hunan, add subdirectory paths
          let paths = [...pathSet];
          if (prov === '湖南省') {
            try { paths = [...paths, ...getHunanSubdirPaths(new URL(govUrl).hostname)]; } catch {}
          }
          
          const found = await probeCounty(govUrl, paths);
          if (found) {
            console.log(`  ✓ ${county.name}: ${found.url} (${found.method}, score=${found.score})`);
            results[prov][key] = { url: found.url, method: found.method, score: found.score };
          } else {
            console.log(`  ✗ ${county.name}`);
            results[prov][key] = { status: 'not-found', govUrl };
          }
        } catch (e) {
          console.log(`  ✗ ${county.name}: ${e.message}`);
          results[prov][key] = { status: 'error', govUrl, error: e.message };
        }
        writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      });

      // Batched execution
      for (let i = 0; i < tasks.length; i += CONCURRENCY) {
        await Promise.allSettled(tasks.slice(i, i + CONCURRENCY).map(f => f()));
      }
    }
  }

  // Summary
  console.log('\n\n═══ SUMMARY ═══');
  for (const prov of ['湖北省', '湖南省']) {
    if (!results[prov]) continue;
    const entries = Object.entries(results[prov]);
    const found = entries.filter(([, v]) => v.url);
    const notFound = entries.filter(([, v]) => v.status === 'not-found');
    const errors = entries.filter(([, v]) => v.status === 'error');
    console.log(`${prov}: ${found.length} found / ${entries.length} total (${notFound.length} not-found, ${errors.length} errors)`);
    found.forEach(([k, v]) => console.log(`  ${k} → ${v.url}`));
  }
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
run().catch(console.error);
