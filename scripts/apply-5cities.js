// Apply confirmed city fiscal URLs to data file
const fs = require('fs');

const confirmed = [
  { name: '秦皇岛市', url: 'http://www.qhd.gov.cn/xxgk/front/index.html' },
  { name: '白山市', url: 'http://www.cbs.gov.cn/zw/ztzl/bssczjzl/yjsxx1/zfyjs/' },
  { name: '白城市', url: 'http://www.jlbc.gov.cn/xxgk_3148/yjsxx/' },
  { name: '毕节市', url: 'https://www.bijie.gov.cn/zwgk/zfxxgk/fdzdgknr/czzj/' },
  { name: '石嘴山市', url: 'https://www.shizuishan.gov.cn/zwgk/zdlyxxgk/czzj/' },
];

let data = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
let applied = 0;
for (const c of confirmed) {
  const pattern = `name: "${c.name}",\n        url: ""`;
  if (data.includes(pattern)) {
    data = data.replace(pattern, `name: "${c.name}",\n        url: "${c.url}"`);
    applied++;
    console.log(`✅ ${c.name}: ${c.url}`);
  } else {
    console.log(`❌ ${c.name}: pattern not found`);
  }
}
fs.writeFileSync('data/fiscal-budget-links.ts', data);
console.log(`\nApplied ${applied}/${confirmed.length} URLs`);
