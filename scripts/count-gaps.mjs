import fs from 'fs';

const content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const provinces = ['河北省','山西省','辽宁省','吉林省','黑龙江省','浙江省','安徽省','福建省','江西省','山东省'];
const lines = content.split('\n');

let currentProvince = '';
let inTargetProvince = false;
let cityCount = 0;
let emptyCount = 0;
let emptyNames = [];
let provinceStats = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const provMatch = line.match(/═══════\s+(.+?)\s+═══════/);
  if (provMatch) {
    if (inTargetProvince && currentProvince) {
      provinceStats[currentProvince] = { total: cityCount, empty: emptyCount, names: emptyNames };
    }
    currentProvince = provMatch[1];
    inTargetProvince = provinces.includes(currentProvince);
    cityCount = 0;
    emptyCount = 0;
    emptyNames = [];
    continue;
  }
  if (inTargetProvince) {
    const cityMatch = line.match(/^\s{8}name:\s*"(.+?)"/);
    if (cityMatch) {
      cityCount++;
      const nextLine = lines[i+1] || '';
      if (nextLine.match(/url:\s*""/)) {
        emptyCount++;
        emptyNames.push(cityMatch[1]);
      }
    }
  }
}
if (inTargetProvince && currentProvince) {
  provinceStats[currentProvince] = { total: cityCount, empty: emptyCount, names: emptyNames };
}

let totalMissing = 0;
for (const [prov, stats] of Object.entries(provinceStats)) {
  console.log(`${prov}: ${stats.total - stats.empty}/${stats.total} found, ${stats.empty} missing`);
  if (stats.names.length > 0) {
    console.log(`  Missing: ${stats.names.join(', ')}`);
  }
  totalMissing += stats.empty;
}
console.log(`\nTotal missing: ${totalMissing}`);
