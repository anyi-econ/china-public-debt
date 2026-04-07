#!/usr/bin/env node
// Apply confirmed county URLs from batch-7prov results (content-based matching)
import fs from 'fs';

const results = JSON.parse(fs.readFileSync('scripts/batch-7prov-results.json', 'utf8'));
const confirmed = results.countyResults.filter(r => !r.unconfirmed);

console.log(`Found ${confirmed.length} confirmed county URLs to apply\n`);

let data = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const lines = data.split('\n');

let applied = 0;
let skipped = 0;

// For each confirmed county, find it by name and check parent city context
for (const c of confirmed) {
  // Find lines matching this county name with empty url
  const pattern = `name: "${c.county}", url: ""`;
  const matchingLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      matchingLines.push(i);
    }
  }

  if (matchingLines.length === 0) {
    // Already has a URL or name not found
    console.log(`  SKIP ${c.county}: no empty URL found (may already be filled)`);
    skipped++;
    continue;
  }

  if (matchingLines.length === 1) {
    // Unique match - safe to apply
    const lineIdx = matchingLines[0];
    lines[lineIdx] = lines[lineIdx].replace(`url: ""`, `url: "${c.url}"`);
    console.log(`  ✅ ${c.county}: applied ${c.url}`);
    applied++;
    continue;
  }

  // Multiple matches - need to disambiguate by city context
  let found = false;
  for (const lineIdx of matchingLines) {
    // Look backwards for the parent city
    for (let j = lineIdx - 1; j >= Math.max(0, lineIdx - 15); j--) {
      const cityMatch = lines[j].match(/name:\s*"([^"]+)",\s*url:/);
      if (cityMatch && cityMatch[1] === c.city) {
        lines[lineIdx] = lines[lineIdx].replace(`url: ""`, `url: "${c.url}"`);
        console.log(`  ✅ ${c.county} (under ${c.city}): applied ${c.url}`);
        applied++;
        found = true;
        break;
      }
      // If we hit another city block, stop looking
      if (cityMatch && cityMatch[1] !== c.city) break;
    }
    if (found) break;
  }

  if (!found) {
    console.log(`  ⚠️ ${c.county}: ambiguous - could not find correct city context for ${c.city}`);
    skipped++;
  }
}

fs.writeFileSync('data/fiscal-budget-links.ts', lines.join('\n'));
console.log(`\nDone: ${applied} applied, ${skipped} skipped`);
