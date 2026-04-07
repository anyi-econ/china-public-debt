#!/usr/bin/env node
import fs from 'fs';
const data = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const lines = data.split('\n');
let currentProv = '';
const missingCities = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const indent = (line.match(/^(\s*)/) || ['',''])[1].length;
  // Province level
  if (indent >= 2 && indent <= 6) {
    const m = line.match(/name:\s*"([^"]+)"/);
    if (m) currentProv = m[1];
  }
  // City level - has children
  if (indent >= 7 && indent <= 9) {
    const m = line.match(/name:\s*"([^"]+)"/);
    if (m) {
      // Check for url on same or next line
      let url = '';
      const urlSame = line.match(/url:\s*"([^"]*)"/);
      if (urlSame) { url = urlSame[1]; }
      else if (i+1 < lines.length) {
        const urlNext = lines[i+1].match(/url:\s*"([^"]*)"/);
        if (urlNext) url = urlNext[1];
      }
      if (url === '') {
        missingCities.push({ prov: currentProv, city: m[1], line: i+1 });
      }
    }
  }
}
console.log(`Cities with empty URLs: ${missingCities.length}`);
missingCities.forEach(c => console.log(`${c.line}: ${c.prov} > ${c.city}`));
