import fs from 'fs';

const c = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const lines = c.split('\n');

// Find all province boundaries
const boundaries = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('═══════')) boundaries.push(i);
}

const provs = ['河南省','湖北省','湖南省','广西壮族自治区','海南省','贵州省','云南省','西藏自治区','甘肃省','青海省','宁夏回族自治区'];

for (const p of provs) {
  const pi = boundaries.find(b => lines[b].includes(p));
  if (pi === undefined) continue;
  const nextBi = boundaries.find(b => b > pi) || lines.length;
  
  let filled = 0, empty = 0, missing = [];
  for (let i = pi; i < nextBi; i++) {
    const m = lines[i].match(/name:\s*"(.+?)",\s*url:\s*"(.*?)"/);
    if (m && !m[1].includes('省') && !m[1].includes('自治区')) {
      if (m[2]) filled++;
      else { empty++; missing.push(m[1]); }
    }
  }
  console.log(`${p}: ${filled}/${filled + empty} filled, ${empty} empty`);
  if (missing.length) console.log(`  Missing: ${missing.join(', ')}`);
}
