import fs from 'fs';

const content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const lines = content.split('\n');

let currentProvince = '';
let cityCount = 0;
let emptyCount = 0;
let hasChildren = false;
const stats = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const provMatch = line.match(/═══════\s+(.+?)\s+═══════/);
  if (provMatch) {
    if (currentProvince) {
      stats[currentProvince] = { cities: cityCount, empty: emptyCount, hasChildren };
    }
    currentProvince = provMatch[1];
    cityCount = 0;
    emptyCount = 0;
    hasChildren = false;
    continue;
  }
  const cityMatch = line.match(/^\s{8}name:\s*"(.+?)"/);
  if (cityMatch && currentProvince) {
    cityCount++;
    const nextLine = lines[i+1] || '';
    if (nextLine.match(/url:\s*""/)) emptyCount++;
    // Check if this city has children
    const childLine = lines[i+2] || '';
    if (childLine.match(/children:/)) hasChildren = true;
  }
}
if (currentProvince) {
  stats[currentProvince] = { cities: cityCount, empty: emptyCount, hasChildren };
}

console.log('Province                    | Cities | Found | Missing | Counties');
console.log('----------------------------|--------|-------|---------|--------');
for (const [p, s] of Object.entries(stats)) {
  const found = s.cities - s.empty;
  const pad = (str, n) => str.padEnd(n);
  console.log(`${pad(p,28)}| ${String(s.cities).padStart(6)} | ${String(found).padStart(5)} | ${String(s.empty).padStart(7)} | ${s.hasChildren ? 'Yes' : 'No'}`);
}
