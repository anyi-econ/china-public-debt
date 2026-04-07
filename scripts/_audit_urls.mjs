import fs from 'fs';

const content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');

// Strip TS types/exports, keep just the array
const cleaned = content
  .replace(/export\s+interface\s+\w+\s*\{[^}]+\}/g, '')
  .replace(/export\s+const\s+\w+:\s*\w+\[\]\s*=\s*/, 'const data = ')
  .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
  // Strip line comments - only those NOT inside strings
  .split('\n').map(line => {
    // Find // that's not inside a string
    let inStr = false;
    let strChar = '';
    for (let i = 0; i < line.length - 1; i++) {
      if (inStr) {
        if (line[i] === '\\') { i++; continue; }
        if (line[i] === strChar) inStr = false;
      } else {
        if (line[i] === '"' || line[i] === "'") { inStr = true; strChar = line[i]; }
        else if (line[i] === '/' && line[i+1] === '/') {
          return line.slice(0, i);
        }
      }
    }
    return line;
  }).join('\n');

const fn = new Function(cleaned + '\nreturn data;');
const data = fn();

let issues = [];

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

function getPathWithoutQuery(url) {
  try { const u = new URL(url); return u.pathname; } catch { return null; }
}

for (const prov of data) {
  if (!prov.children) continue;
  for (const city of prov.children) {
    if (!city.children) continue;
    const cityDomain = getDomain(city.url);
    const cityPath = getPathWithoutQuery(city.url);
    if (!cityDomain) continue;
    for (const county of city.children) {
      if (!county.url) continue;
      const countyDomain = getDomain(county.url);
      const countyPath = getPathWithoutQuery(county.url);
      if (countyDomain === cityDomain) {
        // Skip if county URL has different query params (centralized systems like NMG)
        try {
          const cityParams = new URL(city.url).searchParams;
          const countyParams = new URL(county.url).searchParams;
          if (countyParams.toString() !== cityParams.toString()) continue;
        } catch {}
        // Flag if: same domain AND same or very similar path
        if (countyPath === cityPath || county.url === city.url) {
          issues.push({
            province: prov.name,
            city: city.name,
            county: county.name,
            cityUrl: city.url,
            countyUrl: county.url,
            type: 'exact-duplicate'
          });
        } else {
          issues.push({
            province: prov.name,
            city: city.name,
            county: county.name,
            cityUrl: city.url,
            countyUrl: county.url,
            type: 'same-domain-diff-path'
          });
        }
      }
    }
  }
}

const exactDupes = issues.filter(i => i.type === 'exact-duplicate');
const sameDomain = issues.filter(i => i.type === 'same-domain-diff-path');

console.log('=== EXACT DUPLICATES (county URL = city URL) ===\n');
exactDupes.forEach(item => {
  console.log(`${item.province} > ${item.city} > ${item.county}`);
  console.log(`  URL: ${item.countyUrl}`);
  console.log();
});
console.log(`Exact duplicates: ${exactDupes.length}\n`);

console.log('=== SAME DOMAIN, DIFFERENT PATH (may be legitimate sub-pages) ===\n');
sameDomain.forEach(item => {
  console.log(`${item.province} > ${item.city} > ${item.county}`);
  console.log(`  City:   ${item.cityUrl}`);
  console.log(`  County: ${item.countyUrl}`);
  console.log();
});
console.log(`Same-domain different-path: ${sameDomain.length}`);
console.log(`\nTotal issues found: ${issues.length}`);
