/**
 * Batch probe 山东 county fiscal budget URLs using common patterns.
 * Tries common fiscal page paths on each county gov portal and checks HTTP status.
 */
import fs from 'fs';

// Parse gov-website-links.ts to get county portal URLs
const govContent = fs.readFileSync('data/gov-website-links.ts', 'utf8');
const fiscalContent = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');

// Extract 山东 section from gov-website-links
function parseGovLinks(province) {
  const cleaned = govContent
    .replace(/export\s+interface\s+\w+\s*\{[^}]+\}/g, '')
    .replace(/export\s+const\s+\w+:\s*\w+\[\]\s*=\s*/, 'const data = ')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = cleaned.split('\n');
  const safeLines = lines.map(line => {
    let inStr = false, strChar = '';
    for (let i = 0; i < line.length - 1; i++) {
      if (inStr) {
        if (line[i] === '\\') { i++; continue; }
        if (line[i] === strChar) inStr = false;
      } else {
        if (line[i] === '"' || line[i] === "'") { inStr = true; strChar = line[i]; }
        else if (line[i] === '/' && line[i+1] === '/') return line.slice(0, i);
      }
    }
    return line;
  });
  const fn = new Function(safeLines.join('\n') + '\nreturn data;');
  const data = fn();
  return data.find(p => p.name === province);
}

// Parse fiscal-budget-links.ts
function parseFiscalLinks(province) {
  const cleaned = fiscalContent
    .replace(/export\s+interface\s+\w+\s*\{[^}]+\}/g, '')
    .replace(/export\s+const\s+\w+:\s*\w+\[\]\s*=\s*/, 'const data = ')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = cleaned.split('\n');
  const safeLines = lines.map(line => {
    let inStr = false, strChar = '';
    for (let i = 0; i < line.length - 1; i++) {
      if (inStr) {
        if (line[i] === '\\') { i++; continue; }
        if (line[i] === strChar) inStr = false;
      } else {
        if (line[i] === '"' || line[i] === "'") { inStr = true; strChar = line[i]; }
        else if (line[i] === '/' && line[i+1] === '/') return line.slice(0, i);
      }
    }
    return line;
  });
  const fn = new Function(safeLines.join('\n') + '\nreturn data;');
  const data = fn();
  return data.find(p => p.name === province);
}

const shandongGov = parseGovLinks('山东省');
const shandongFiscal = parseFiscalLinks('山东省');

// Build list of counties that need fiscal URLs
const countiesToProbe = [];
for (const city of shandongFiscal.children) {
  if (!city.children) continue;
  for (const county of city.children) {
    if (county.url) continue; // already has fiscal URL
    // Find portal URL from gov-website-links
    const govCity = shandongGov.children?.find(c => c.name === city.name);
    const govCounty = govCity?.children?.find(c => c.name === county.name);
    if (govCounty?.url) {
      countiesToProbe.push({
        city: city.name,
        county: county.name,
        portal: govCounty.url,
      });
    }
  }
}

console.log(`Total counties to probe: ${countiesToProbe.length}\n`);

// Common fiscal URL patterns to try
const patterns = [
  '/gongkai/',  // Main info disclosure - parse for 财政 links
];

// Probe function with timeout
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
    if (resp.ok) {
      const text = await resp.text();
      // Search for fiscal budget links in the response HTML
      const fiscalPatterns = [
        /财政预决算/,
        /财政信息/,
        /预决算/,
        /财政收支/,
      ];
      
      // Extract all href links and their text
      const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*(?:财政|预决算|预算|决算)[^<]*)<\/a>/gi;
      const matches = [];
      let m;
      while ((m = linkRegex.exec(text)) !== null) {
        matches.push({ href: m[1], text: m[2].trim() });
      }
      
      // Also try raw href matching for fiscal keywords in URL path
      const hrefRegex = /href=["']([^"']*(?:czxx|czyjs|czgk|czsj|czzj|ysjs|yjs)[^"']*)["']/gi;
      while ((m = hrefRegex.exec(text)) !== null) {
        matches.push({ href: m[1], text: '(url-pattern-match)' });
      }
      
      // Check for fiscal keywords in the page
      const hasFiscalContent = fiscalPatterns.some(p => p.test(text));
      
      return { status: resp.status, url: resp.url, matches, hasFiscalContent };
    }
    return { status: resp.status, url: resp.url, matches: [], hasFiscalContent: false };
  } catch (e) {
    clearTimeout(timer);
    return { status: 'error', error: e.message, matches: [], hasFiscalContent: false };
  }
}

// Process in batches
const BATCH_SIZE = 10;
const results = [];

for (let i = 0; i < countiesToProbe.length; i += BATCH_SIZE) {
  const batch = countiesToProbe.slice(i, i + BATCH_SIZE);
  console.log(`Probing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(countiesToProbe.length/BATCH_SIZE)}...`);
  
  const batchResults = await Promise.all(batch.map(async (item) => {
    let portalBase = item.portal.replace(/\/$/, '');
    const gongkaiUrl = portalBase + '/gongkai/';
    const result = await probeUrl(gongkaiUrl);
    
    let bestMatch = null;
    if (result.matches.length > 0) {
      // Prioritize matches with 财政预决算 or 财政信息
      const prioritized = result.matches.sort((a, b) => {
        const scoreA = a.text.includes('预决算') ? 3 : a.text.includes('财政信息') ? 2 : a.text.includes('财政') ? 1 : 0;
        const scoreB = b.text.includes('预决算') ? 3 : b.text.includes('财政信息') ? 2 : b.text.includes('财政') ? 1 : 0;
        return scoreB - scoreA;
      });
      bestMatch = prioritized[0];
      
      // Resolve relative URLs
      if (bestMatch && !bestMatch.href.startsWith('http')) {
        try {
          bestMatch.href = new URL(bestMatch.href, gongkaiUrl).href;
        } catch {}
      }
    }
    
    return {
      ...item,
      gongkaiUrl,
      status: result.status,
      redirectUrl: result.url,
      bestMatch,
      allMatches: result.matches,
      hasFiscalContent: result.hasFiscalContent,
    };
  }));
  
  results.push(...batchResults);
  
  // Brief delay between batches
  await new Promise(r => setTimeout(r, 500));
}

// Output results
console.log('\n\n=== RESULTS ===\n');

const found = results.filter(r => r.bestMatch);
const notFound = results.filter(r => !r.bestMatch && r.hasFiscalContent);
const failed = results.filter(r => !r.bestMatch && !r.hasFiscalContent);

console.log(`--- FOUND fiscal links (${found.length}) ---\n`);
found.forEach(r => {
  console.log(`${r.city} > ${r.county}`);
  console.log(`  Portal: ${r.portal}`);
  console.log(`  Fiscal: ${r.bestMatch.href}`);
  console.log(`  Text: ${r.bestMatch.text}`);
  console.log();
});

console.log(`\n--- HAS fiscal content but no link extracted (${notFound.length}) ---\n`);
notFound.forEach(r => {
  console.log(`${r.city} > ${r.county}: ${r.gongkaiUrl} (status: ${r.status})`);
});

console.log(`\n--- NO fiscal content found (${failed.length}) ---\n`);
failed.forEach(r => {
  console.log(`${r.city} > ${r.county}: ${r.portal} (status: ${r.status})`);
});

// Save full results to JSON
fs.writeFileSync('scripts/_shandong_probe_results.json', JSON.stringify(results, null, 2));
console.log('\nFull results saved to scripts/_shandong_probe_results.json');
