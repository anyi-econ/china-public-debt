// Clean up false-positive URLs from batch-8prov results in data/fiscal-budget-links.ts
// False positives = county entries that got a city/province-level URL instead of a county-specific URL
import { readFileSync, writeFileSync } from 'fs';

const dataPath = 'data/fiscal-budget-links.ts';
const resultsPath = 'scripts/batch-8prov-results.json';

const data = readFileSync(dataPath, 'utf-8');
const results = JSON.parse(readFileSync(resultsPath, 'utf-8'));

// City/province domains that are NOT county-specific
// These should be reverted to empty string
const falseDomains = [
  // Province-level
  'www.jiangxi.gov.cn', 'jiangxi.gov.cn',
  // City portals (domain-only)
  'www.zhangzhou.gov.cn', 'www.np.gov.cn', 'www.longyan.gov.cn',
  'www.quanzhou.gov.cn', 'www.nc.gov.cn',
  'www.zhuzhou.gov.cn', 'www.shaoyang.gov.cn', 'www.changde.gov.cn',
  'www.yzcity.gov.cn', 'www.huaihua.gov.cn',
  'www.guilin.gov.cn', 'www.wuzhou.gov.cn', 'www.laibin.gov.cn',
  'www.nanning.gov.cn', 'www.sp.gov.cn',
  'xxgk.longyan.gov.cn', 'changde.gov.cn',
  // City fiscal bureau URLs used for counties
  'czj.zhangzhou.gov.cn', 'czj.shaoyang.gov.cn', 'czj.changde.gov.cn',
  'nncz.nanning.gov.cn', 'czj.guilin.gov.cn', 'czj.qinzhou.gov.cn',
  'czj.baise.gov.cn',
];

// Also flag URLs that appear on multiple county lines (same city URL reused)
// Some shared platforms are valid (e.g., Nanyang shared portal), but city portals are not
const sharedPlatformDomains = [
  // These shared platforms might actually be valid if the URL is a shared county fiscal platform
  // Check case-by-case
  'dsyjs.yun.liuzhou.gov.cn', // Liuzhou shared DsYjs platform for all counties - likely valid
];

// Also check: city-level fiscal URLs used for county entries
const cityFiscalFalsePositives = [
  // These are city-level fiscal pages, not county-specific
  'www.nc.gov.cn', // 南昌市 fiscal for counties
  'www.quanzhou.gov.cn', // 泉州 fiscal for counties  
  'www.chongzuo.gov.cn', // 崇左 fiscal for counties
  'www.gxgg.gov.cn', // 贵港 fiscal for counties
  'www.baise.gov.cn', // 百色 fiscal for counties
  'www.changsha.gov.cn', // 长沙 fiscal for counties
  'www.putian.gov.cn', // 莆田 fiscal for counties  
  'www.ganzhou.gov.cn', // 赣州 fiscal for counties
  'www.taian.gov.cn', // 泰安 for counties
  'www.binzhou.gov.cn', // 滨州 for counties
  'www.rizhao.gov.cn', // 日照 for counties
  'www.pds.gov.cn', // 平顶山 for counties
  'czj.weifang.gov.cn', // 潍坊财政局 for counties
  'www.luohe.gov.cn', // 漯河 for counties
  'www.ly.gov.cn', // 洛阳 for counties
];

function shouldRevert(url) {
  try {
    const host = new URL(url).hostname;
    if (falseDomains.includes(host)) return true;
    if (cityFiscalFalsePositives.includes(host)) return true;
    return false;
  } catch { return false; }
}

// Process each result and collect URLs to revert
const toRevert = results.filter(r => shouldRevert(r.url));
const toKeep = results.filter(r => !shouldRevert(r.url));

console.log(`Total results: ${results.length}`);
console.log(`To revert (false positives): ${toRevert.length}`);
console.log(`To keep: ${toKeep.length}`);

// Now revert in the data file
let lines = data.split('\n');
let revertCount = 0;

for (const entry of toRevert) {
  const lineIdx = entry.line - 1; // 0-based
  const line = lines[lineIdx];
  if (!line) continue;
  
  // The line should contain the URL we want to revert
  // Pattern: url: "http://..."  →  url: ""
  const urlEscaped = entry.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(url:\\s*)"${urlEscaped}"`);
  if (regex.test(line)) {
    lines[lineIdx] = line.replace(regex, '$1""');
    revertCount++;
  } else {
    // URL might have been changed by user - check if line still has any URL
    console.log(`  SKIP L${entry.line} ${entry.name}: URL not found in line`);
  }
}

console.log(`\nReverted ${revertCount} false positive entries`);

// Also revert other problematic shared city URLs
// Check for specific patterns: same URL across different counties under different cities
const additionalReverts = [
  // Nanyang shared portal: actually seems to be a shared platform, might be ok
  // But let's check: https://www.nanyang.gov.cn/zdlyxxgk/czzj/ - this is the city-level page
  { domain: 'www.nanyang.gov.cn', reason: 'City-level Nanyang fiscal page' },
  { domain: 'czj.ganzhou.gov.cn', reason: 'Ganzhou CZJ shared for county entries' },
  { domain: 'czj.jian.gov.cn', reason: "Ji'an CZJ shared for county entries" },
  { domain: 'czj.fy.gov.cn', reason: 'Fuyang CZJ shared for county entries' },
  { domain: 'www.xuchang.gov.cn', reason: 'Xuchang city shared for county entries' },
  { domain: 'www.jiaozuo.gov.cn', reason: 'Jiaozuo city shared for county entries' },
  { domain: 'www.hebi.gov.cn', reason: 'Hebi city shared for county entries' },
  { domain: 'yjs.zibo.gov.cn', reason: 'Zibo shared YJS for counties' },
  { domain: 'www.yantai.gov.cn', reason: 'Yantai city shared for counties' },
  { domain: 'liaocheng.czyjsgk.cn', reason: 'Liaocheng shared platform for counties'},
  { domain: 'www.xuancheng.gov.cn', reason: 'Xuancheng city shared for counties' },
];

let additionalRevertCount = 0;
for (const { domain, reason } of additionalReverts) {
  for (const entry of results) {
    try {
      const host = new URL(entry.url).hostname;
      if (host === domain) {
        const lineIdx = entry.line - 1;
        const line = lines[lineIdx];
        if (!line) continue;
        const urlEscaped = entry.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(url:\\s*)"${urlEscaped}"`);
        if (regex.test(line)) {
          lines[lineIdx] = line.replace(regex, '$1""');
          additionalRevertCount++;
          console.log(`  Reverted L${entry.line} ${entry.name}: ${reason}`);
        }
      }
    } catch {}
  }
}

console.log(`\nAdditional reverted: ${additionalRevertCount}`);
console.log(`Total reverted: ${revertCount + additionalRevertCount}`);

writeFileSync(dataPath, lines.join('\n'), 'utf-8');
console.log('Data file updated.');

// Also report remaining good entries
console.log('\n=== Remaining good entries by province ===');
const goodByProv = {};
for (const entry of toKeep) {
  // Check it wasn't also in additionalReverts
  try {
    const host = new URL(entry.url).hostname;
    const inAdditional = additionalReverts.some(a => a.domain === host);
    if (inAdditional) continue;
  } catch {}
  const prov = entry.province || 'unknown';
  if (!goodByProv[prov]) goodByProv[prov] = [];
  goodByProv[prov].push(entry);
}
for (const [prov, entries] of Object.entries(goodByProv)) {
  console.log(`${prov}: ${entries.length} good entries`);
  for (const e of entries) {
    console.log(`  L${e.line} ${e.name}: ${e.url}`);
  }
}
