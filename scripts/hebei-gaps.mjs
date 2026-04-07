import fs from 'fs';
const content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf-8');
const hebeiMatch = content.match(/\/\/ ═══════ 河北省 ═══════([\s\S]*?)\/\/ ═══════ 山西省 ═══════/);
const hebei = hebeiMatch[1];
const lines = hebei.split('\n');
let city = '';
const emptyByCity = {};
for (const line of lines) {
  const cm = line.match(/name:\s*"([^"]+市)"/);
  if (cm) { city = cm[1]; continue; }
  const em = line.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
  if (em && city) {
    if (!emptyByCity[city]) emptyByCity[city] = [];
    emptyByCity[city].push(em[1]);
  }
}
for (const [c, counties] of Object.entries(emptyByCity).sort()) {
  console.log(`${c} (${counties.length}): ${counties.join(', ')}`);
}
