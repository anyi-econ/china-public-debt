import { readFileSync } from 'fs';

const data = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
const hebeiStart = data.indexOf('// ═══════ 河北省 ═══════');
const shanxiStart = data.indexOf('// ═══════ 山西省 ═══════');
const hebei = data.substring(hebeiStart, shanxiStart);

const emptyMatches = hebei.match(/url: ""/g);
console.log('Remaining empty URLs in Hebei:', emptyMatches ? emptyMatches.length : 0);

const lines = hebei.split('\n');
let currentCity = '';
for (const line of lines) {
  const cityMatch = line.match(/name: "(.+?市)"/);
  if (cityMatch) currentCity = cityMatch[1];
  const emptyMatch = line.match(/name: "(.+?)", url: ""/);
  if (emptyMatch && !emptyMatch[1].endsWith('市') && !emptyMatch[1].endsWith('省')) {
    console.log(`  ${currentCity} > ${emptyMatch[1]}`);
  }
}
