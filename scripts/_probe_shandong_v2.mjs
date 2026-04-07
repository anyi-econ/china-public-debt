/**
 * V2 probe: Try alternative URL patterns for 山东 counties that failed in v1.
 * Tests: HTTPS, /zwgk/, /xxgk/, /col/ patterns, and homepage for fiscal keywords.
 */
import fs from 'fs';

const v1Results = JSON.parse(fs.readFileSync('scripts/_shandong_probe_results.json', 'utf8'));

// Get counties that failed in v1 (no fiscal link found)
const failed = v1Results.filter(r => !r.bestMatch && !r.hasFiscalContent);
console.log(`V2: Retrying ${failed.length} counties that failed in v1\n`);

async function probeUrl(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    clearTimeout(timer);
    if (!resp.ok) return { status: resp.status, ok: false };
    const text = await resp.text();
    
    // Search for fiscal links using multiple patterns
    const results = [];
    
    // Pattern 1: <a> tags with fiscal keywords in text
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*(?:财政信息|财政预决算|预决算公开|财政收支|预算公开|决算公开)[^<]*)<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(text)) !== null) {
      results.push({ href: m[1], text: m[2].trim(), source: 'text-match' });
    }
    
    // Pattern 2: URLs with fiscal path patterns
    const urlPatterns = /href=["']([^"']*(?:\/czxx\/|\/czyjs\/|\/czgk\/|\/ysjsgk\/|\/ysjs\/|yusuanjuesuan|caizhengyujuesuan|caizheng)[^"']*)["']/gi;
    while ((m = urlPatterns.exec(text)) !== null) {
      results.push({ href: m[1], text: '(url-pattern)', source: 'url-match' });
    }
    
    // Pattern 3: channel with 财政 in nearby text
    const channelRegex = /(?:<a[^>]*href=["']([^"']*channel[^"']*|[^"']*col\/col\d+[^"']*)["'][^>]*>[^<]*(?:财政|预决算)[^<]*<\/a>)/gi;
    while ((m = channelRegex.exec(text)) !== null) {
      results.push({ href: m[1], text: '(channel-match)', source: 'channel-match' });
    }
    
    return { status: resp.status, ok: true, url: resp.url, results };
  } catch (e) {
    clearTimeout(timer);
    return { status: 'error', ok: false, error: e.message };
  }
}

const BATCH_SIZE = 10;
const allResults = [];

for (let i = 0; i < failed.length; i += BATCH_SIZE) {
  const batch = failed.slice(i, i + BATCH_SIZE);
  console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(failed.length/BATCH_SIZE)}...`);
  
  const batchResults = await Promise.all(batch.map(async (item) => {
    const portal = item.portal;
    // Try multiple URL variants
    const variants = [];
    
    // Try both HTTP and HTTPS
    const httpPortal = portal.replace(/^https:/, 'http:').replace(/\/$/, '');
    const httpsPortal = portal.replace(/^http:/, 'https:').replace(/\/$/, '');
    
    // Try homepage first
    for (const base of [httpPortal, httpsPortal]) {
      variants.push(base + '/');
      variants.push(base + '/gongkai/');
      variants.push(base + '/zwgk/');
      variants.push(base + '/xxgk/');
    }
    
    let bestResult = null;
    for (const url of variants) {
      if (bestResult) break;
      const result = await probeUrl(url, 6000);
      if (result.ok && result.results?.length > 0) {
        // Resolve relative URLs
        result.results.forEach(r => {
          if (!r.href.startsWith('http')) {
            try { r.href = new URL(r.href, url).href; } catch {}
          }
        });
        bestResult = { url, ...result };
      } else if (result.ok && !bestResult) {
        // Page loaded but no fiscal links found - still note it
        bestResult = { url, ...result, noFiscalLinks: true };
      }
    }
    
    return {
      city: item.city,
      county: item.county,
      portal: item.portal,
      result: bestResult,
    };
  }));
  
  allResults.push(...batchResults);
  await new Promise(r => setTimeout(r, 500));
}

// Output results
const found2 = allResults.filter(r => r.result?.results?.length > 0);
const reachable = allResults.filter(r => r.result?.ok && (!r.result?.results?.length));
const unreachable = allResults.filter(r => !r.result?.ok);

console.log(`\n=== V2 RESULTS ===\n`);
console.log(`--- FOUND fiscal links (${found2.length}) ---\n`);
found2.forEach(r => {
  console.log(`${r.city} > ${r.county}`);
  console.log(`  Via: ${r.result.url}`);
  r.result.results.forEach(link => {
    console.log(`  Link: ${link.href} [${link.text}]`);
  });
  console.log();
});

console.log(`\n--- Reachable but no fiscal links (${reachable.length}) ---\n`);
reachable.forEach(r => {
  console.log(`${r.city} > ${r.county}: ${r.result.url} -> ${r.result.url}`);
});

console.log(`\n--- Unreachable (${unreachable.length}) ---\n`);
unreachable.forEach(r => {
  console.log(`${r.city} > ${r.county}: ${r.portal}`);
});

// Save v2 results
fs.writeFileSync('scripts/_shandong_probe_v2_results.json', JSON.stringify(allResults, null, 2));
console.log('\nSaved to scripts/_shandong_probe_v2_results.json');
