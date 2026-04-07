// Analyze batch-8prov results to find false positives
import { readFileSync } from 'fs';

const r = JSON.parse(readFileSync('scripts/batch-8prov-results.json', 'utf-8'));

// City/province domains that are NOT county-specific
const suspectDomains = [
  'jiangxi.gov.cn', 'nc.gov.cn', 'zhangzhou.gov.cn', 'np.gov.cn',
  'longyan.gov.cn', 'quanzhou.gov.cn', 'shaoyang.gov.cn', 'changde.gov.cn',
  'yzcity.gov.cn', 'huaihua.gov.cn', 'guilin.gov.cn', 'wuzhou.gov.cn',
  'baise.gov.cn', 'laibin.gov.cn', 'chongzuo.gov.cn', 'gxgg.gov.cn',
  'nncz.nanning.gov.cn', 'nanning.gov.cn', 'zhuzhou.gov.cn', 'lz.gov.cn',
  'czj.zhangzhou.gov.cn', 'czj.changde.gov.cn', 'czj.shaoyang.gov.cn',
  'czj.guilin.gov.cn', 'czj.baise.gov.cn', 'czj.qinzhou.gov.cn',
  'xxgk.longyan.gov.cn', 'sp.gov.cn',
];

function isSuspect(url) {
  try {
    const host = new URL(url).hostname;
    return suspectDomains.some(d => host === d || host === 'www.' + d);
  } catch { return false; }
}

const falseFP = r.filter(e => isSuspect(e.url));
console.log('Suspect false positives:', falseFP.length);
falseFP.forEach(e => console.log(`  L${e.line} ${e.name} [${e.method}] → ${e.url}`));

// Count good entries
const good = r.filter(e => !isSuspect(e.url));
console.log('\nGood entries:', good.length);

// Also show some entries where city fiscal URL was reused for different counties
const urlCounts = {};
for (const e of r) {
  urlCounts[e.url] = (urlCounts[e.url] || 0) + 1;
}
const dupes = Object.entries(urlCounts).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);
console.log('\nDuplicate URLs (same URL for multiple counties):');
for (const [url, count] of dupes) {
  const names = r.filter(e => e.url === url).map(e => e.name).join(', ');
  console.log(`  ${count}x: ${url}`);
  console.log(`    → ${names}`);
}
