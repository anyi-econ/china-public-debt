// Batch discover fiscal budget URLs for 湖南+湖北 counties
// Uses gov portal URLs from gov-website-links.ts, probes fiscal sub-paths (M3) + homepage crawl (M5)
import { readFileSync, writeFileSync, existsSync } from 'fs';
import https from 'https';
import http from 'http';

const TIMEOUT = 10000;
const CONCURRENCY = 6;
const RESULTS_FILE = 'scripts/hunan-hubei-results.json';

function get(url, redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), TIMEOUT);
    const mod = url.startsWith('https') ? https : http;
    const r = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: TIMEOUT  - 1000,
      rejectUnauthorized: false,
    }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redir > 0) {
        clearTimeout(t); res.resume();
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return resolve(get(loc, redir - 1));
      }
      let d = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (d.length < 500000) d += c; });
      res.on('end', () => { clearTimeout(t); resolve({ status: res.statusCode, body: d, url }); });
    });
    r.on('error', e => { clearTimeout(t); reject(e); });
    r.on('timeout', () => r.destroy());
  });
}

function head(url, redir = 3) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 6000);
    const mod = url.startsWith('https') ? https : http;
    const r = mod.request(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000,
      rejectUnauthorized: false,
    }, res => {
      clearTimeout(t); res.resume();
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redir > 0) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return resolve(head(loc, redir - 1));
      }
      resolve({ status: res.statusCode });
    });
    r.on('error', e => { clearTimeout(t); reject(e); });
    r.on('timeout', () => r.destroy());
    r.end();
  });
}

// Fiscal sub-paths to probe per skill SKILL.md M3
const FISCAL_PATHS = [
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/czyjs/',
  '/zwgk/czxx/',
  '/zwgk/czzj/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zdly/czzj/',
  '/xxgk/czxx/',
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/fdzdgknr/czzj/',
  '/xxgk/fdzdgk/czzj/',
  '/xxgk/gkml/czzj/',
  '/xxgk/xxgkml/czzj/',
  '/zwgk/zdlyxxgk/czyjshsgjf/',
  '/zwgk/zdlyxxgk/czyjshsgjf/czyjs/',
  '/zwgk/czgk/',
  '/zwgk/czgk/czyjs/',
  '/zwgk/xxgk/czzj/czyjs/',
  '/zwgk/xxgkml/czxx/',
  '/bmfw/gxbcyjs/',
  // Hunan CMS patterns
  '/czxx/list.shtml',
  '/czxx/',
  // Hubei-specific patterns
  '/zwgk/grassroots/column/',
  '/ztzl/gxbcyjs/',
  '/ztzl/gxbcyjs/index.shtml',
  '/xxgk/fdzdgk/ysjs/',
  '/c/czxx/',
  '/czzj/',
  // Fallback broader paths
  '/zwgk/zdly/czxx/',
  '/zwgk/zdlyxxgk/czgk/',
];

const FISCAL_KW = /预算|决算|财政预决算|budget|czyjs|预决算|财政信息|部门预算|政府预算/;

// Parse fiscal-budget-links.ts to find counties with empty URLs
function parseFiscalData(provName) {
  const content = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
  const lines = content.split('\n');
  const cities = [];
  let inProv = false, inCity = false, inCountyList = false;
  let curCity = null;
  let bracketDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes(`═══════ ${provName} ═══════`)) { inProv = true; continue; }
    if (inProv && l.includes('═══════') && !l.includes(provName)) break;
    if (!inProv) continue;

    // Detect single-line county entries with empty URL
    const cm = l.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
    if (cm && curCity) {
      curCity.counties.push({ name: cm[1], line: i });
      continue;
    }

    // Detect city name
    const nm = l.match(/^\s*name:\s*"([^"]+)"/);
    if (nm && nm[1] !== provName && !inCountyList) {
      const cityName = nm[1];
      // Look ahead for children: [
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('children:')) {
          curCity = { name: cityName, counties: [] };
          cities.push(curCity);
          inCountyList = true;
          break;
        }
      }
    }

    // Track end of children list
    if (inCountyList && l.trim().match(/^\],?\s*$/)) {
      // Could be end of county list or end of city
      // Simple heuristic: if next non-empty line starts a new block, we're done
      inCountyList = false;
    }
  }
  return cities;
}

// Parse gov-website-links.ts to get gov portal URLs
function parseGovData(provName) {
  const content = readFileSync('data/gov-website-links.ts', 'utf-8');
  const startMarker = `name: "${provName}"`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return {};

  // Find end: next province-level entry
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
    if (um && pendingName) {
      map[pendingName] = um[1];
      pendingName = null;
    }
  }
  return map;
}

// Probe fiscal sub-paths on a gov portal domain
async function probeFiscal(base) {
  // Quick HEAD check batch
  const alive = [];
  const headChecks = FISCAL_PATHS.map(async (path) => {
    try {
      const r = await head(base + path);
      if (r.status === 200) alive.push(path);
    } catch {}
  });

  await Promise.allSettled(headChecks);

  // GET alive paths, score for fiscal keywords
  let bestUrl = null;
  let bestScore = 0;

  for (const path of alive) {
    try {
      const r = await get(base + path);
      if (!r || r.status !== 200) continue;
      const body = r.body;
      if (!FISCAL_KW.test(body)) continue;
      if (body.length < 300) continue;

      // Score by keyword density
      let score = 0;
      if (/预算/.test(body)) score += 2;
      if (/决算/.test(body)) score += 2;
      if (/预决算公开/.test(body)) score += 5;
      if (/财政预决算/.test(body)) score += 5;
      if (/部门预算/.test(body)) score += 3;
      if (/政府预算/.test(body)) score += 3;
      if (/一般公共预算/.test(body)) score += 4;
      if (/政府性基金/.test(body)) score += 3;
      if (body.length > 2000) score += 1;
      // Penalize if it looks like a general zwgk page (too many non-fiscal links)
      if (score > bestScore) { bestScore = score; bestUrl = base + path; }
    } catch {}
  }
  if (bestUrl && bestScore >= 3) return { url: bestUrl, score: bestScore, method: 'M3' };
  if (bestUrl) return { url: bestUrl, score: bestScore, method: 'M3-weak' };

  // M5: Homepage keyword crawl
  try {
    const res = await get(base + '/');
    if (res && res.status === 200) {
      const regex = /href\s*=\s*["']([^"']*(?:czyjs|预算|yjs|czxx|czzj|预决算|yjsgk|czgk|yjsxx|budget)[^"']*)["']/gi;
      const candidates = [];
      let m;
      while ((m = regex.exec(res.body)) !== null) {
        let href = m[1];
        if (href.includes('mof.gov.cn') || href.includes('www.gov.cn')) continue;
        if (!href.startsWith('http')) try { href = new URL(href, base).href; } catch { continue; }
        candidates.push(href);
      }
      // Deduplicate and pick the most promising
      const unique = [...new Set(candidates)];
      for (const u of unique) {
        try {
          const r = await get(u);
          if (r && r.status === 200 && FISCAL_KW.test(r.body) && r.body.length > 500) {
            let score = 0;
            if (/预算/.test(r.body)) score += 2;
            if (/决算/.test(r.body)) score += 2;
            if (/预决算公开/.test(r.body)) score += 5;
            if (score >= 3) return { url: u, score, method: 'M5' };
          }
        } catch {}
      }
    }
  } catch {}

  // Also try the Hunan CMS pattern: /countyname/czxx/list.shtml
  try {
    const base2 = base.replace(/\/$/, '');
    const hostname = new URL(base).hostname;
    // Try domain-based path patterns
    const hnPaths = [
      '/czxx/list.shtml',
      '/czxx/',
    ];
    for (const p of hnPaths) {
      try {
        const r = await get(base2 + p);
        if (r && r.status === 200 && FISCAL_KW.test(r.body) && r.body.length > 500) {
          return { url: base2 + p, score: 3, method: 'M5-hn' };
        }
      } catch {}
    }
  } catch {}

  return null;
}

// Also try: city fiscal bureau for counties that might share city fiscal platform 
async function tryCityFiscalBureau(cityName, provName) {
  // Some cities have centralized county fiscal data on their czj domain
  // We don't probe this - just note it as a fallback
  return null;
}

async function run() {
  const results = existsSync(RESULTS_FILE)
    ? JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'))
    : { hubei: {}, hunan: {} };

  for (const [prov, rKey] of [['湖北省', 'hubei'], ['湖南省', 'hunan']]) {
    const cities = parseFiscalData(prov);
    const govMap = parseGovData(prov);
    const totalGaps = cities.reduce((s, c) => s + c.counties.length, 0);
    console.log(`\n═══ ${prov}: ${cities.length} cities with gaps, ${totalGaps} counties to find ═══`);

    for (const city of cities) {
      if (city.counties.length === 0) continue;
      console.log(`\n── ${city.name} (${city.counties.length} gaps) ──`);
      
      const tasks = city.counties.map(county => async () => {
        const key = `${city.name}>${county.name}`;
        if (results[rKey][key]) {
          console.log(`  [skip] ${county.name}`);
          return;
        }

        const govUrl = govMap[county.name];
        if (!govUrl) {
          console.log(`  [no-gov] ${county.name}: no gov portal URL`);
          results[rKey][key] = { name: county.name, line: county.line, status: 'no-gov-url' };
          return;
        }

        console.log(`  [probe] ${county.name} → ${govUrl}`);
        try {
          const base = govUrl.replace(/\/+$/, '');
          const found = await probeFiscal(base);
          if (found) {
            console.log(`  ✓ ${county.name}: ${found.url} (${found.method}, score=${found.score})`);
            results[rKey][key] = { name: county.name, line: county.line, url: found.url, method: found.method, score: found.score };
          } else {
            // Try https variant if base was http
            if (base.startsWith('http://')) {
              const httpsBase = base.replace('http://', 'https://');
              try {
                const found2 = await probeFiscal(httpsBase);
                if (found2) {
                  console.log(`  ✓ ${county.name}: ${found2.url} (${found2.method}+https, score=${found2.score})`);
                  results[rKey][key] = { name: county.name, line: county.line, url: found2.url, method: found2.method + '+https', score: found2.score };
                  return;
                }
              } catch {}
            }
            console.log(`  ✗ ${county.name}: not found`);
            results[rKey][key] = { name: county.name, line: county.line, status: 'not-found' };
          }
        } catch (e) {
          console.log(`  ✗ ${county.name}: error ${e.message}`);
          results[rKey][key] = { name: county.name, line: county.line, status: 'error', error: e.message };
        }

        // Save intermediate results
        writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      });

      // Run in batches of CONCURRENCY
      for (let i = 0; i < tasks.length; i += CONCURRENCY) {
        await Promise.allSettled(tasks.slice(i, i + CONCURRENCY).map(f => f()));
      }
    }
  }

  // Summary
  console.log('\n\n═══ SUMMARY ═══');
  for (const [prov, rKey] of [['湖北省', 'hubei'], ['湖南省', 'hunan']]) {
    const entries = Object.values(results[rKey]);
    const found = entries.filter(e => e.url);
    const notFound = entries.filter(e => e.status === 'not-found');
    const errors = entries.filter(e => e.status === 'error');
    const noGov = entries.filter(e => e.status === 'no-gov-url');
    console.log(`${prov}: ${found.length} found, ${notFound.length} not-found, ${errors.length} errors, ${noGov.length} no-gov`);
    if (found.length) {
      console.log(`  Methods: ${JSON.stringify(found.reduce((m, e) => { m[e.method] = (m[e.method]||0)+1; return m; }, {}))}`);
    }
  }

  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${RESULTS_FILE}`);
}

run().catch(console.error);
