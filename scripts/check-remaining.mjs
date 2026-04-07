import fs from 'fs';

const c = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const provs = ['河南省','湖北省','湖南省','广西壮族自治区','海南省','贵州省','云南省','西藏自治区','甘肃省','青海省','宁夏回族自治区'];
const lines = c.split('\n');

for (const p of provs) {
  const pi = lines.findIndex(l => l.includes('═══════ ' + p));
  if (pi < 0) continue;
  let filled = 0, empty = 0, cities = [];
  for (let i = pi; i < Math.min(pi + 60, lines.length); i++) {
    const m = lines[i].match(/name:\s*"(.+?)",\s*url:\s*"(.*?)"/);
    if (m && !m[1].includes('省') && !m[1].includes('自治区') && !m[1].includes('兵团')) {
      if (m[2]) filled++;
      else { empty++; cities.push(m[1]); }
    }
  }
  console.log(`${p}: ${filled}/${filled + empty} filled, ${empty} empty`);
  if (cities.length) console.log(`  Missing: ${cities.join(', ')}`);
}
