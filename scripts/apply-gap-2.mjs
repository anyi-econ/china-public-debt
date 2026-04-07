import fs from 'fs';

// Additional URLs found via Tier 5/6 methods
const urlMap = {
  // 山西 - centralized provincial platform with ADMDIV codes
  '大同市': 'https://czt.shanxi.gov.cn/bmp_pub/index_gfa.html?ADMDIV=140200000',
  '晋中市': 'https://czt.shanxi.gov.cn/bmp_pub/index_gfa.html?ADMDIV=140700000',
  '运城市': 'https://czt.shanxi.gov.cn/bmp_pub/index_gfa.html?ADMDIV=140800000',
  '忻州市': 'https://czt.shanxi.gov.cn/bmp_pub/index_gfa.html?ADMDIV=140900000',
};

const filePath = 'data/fiscal-budget-links.ts';
let content = fs.readFileSync(filePath, 'utf8');
let count = 0;

for (const [city, url] of Object.entries(urlMap)) {
  const pattern = `name: "${city}",\n        url: ""`;
  if (content.includes(pattern)) {
    content = content.replace(pattern, `name: "${city}",\n        url: "${url}"`);
    count++;
    console.log(`  ✓ ${city}: ${url}`);
  } else {
    const regex = new RegExp(`name: "${city}",\\n        url: "(.+?)"`);
    const match = content.match(regex);
    if (match) console.log(`  ⚠ ${city}: already has URL "${match[1]}"`);
    else console.log(`  ✗ ${city}: not found`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nApplied ${count} URLs`);
