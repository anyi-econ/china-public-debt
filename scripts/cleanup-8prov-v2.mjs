// Content-based cleanup: scan file for false positive URLs at county level
// A false positive is a county entry whose URL points to a city/province portal
import { readFileSync, writeFileSync } from 'fs';

const dataPath = 'data/fiscal-budget-links.ts';
let content = readFileSync(dataPath, 'utf-8');
let lines = content.split('\n');

// City/province portal domains that should NOT appear in county entries
const cityDomains = [
  'jiangxi.gov.cn', 'nc.gov.cn', 'zhangzhou.gov.cn', 'np.gov.cn',
  'longyan.gov.cn', 'quanzhou.gov.cn', 'shaoyang.gov.cn', 'changde.gov.cn',
  'yzcity.gov.cn', 'huaihua.gov.cn', 'guilin.gov.cn', 'wuzhou.gov.cn',
  'laibin.gov.cn', 'nanning.gov.cn', 'zhuzhou.gov.cn', 'changsha.gov.cn',
  'ganzhou.gov.cn', 'taian.gov.cn', 'binzhou.gov.cn', 'rizhao.gov.cn',
  'pds.gov.cn', 'luohe.gov.cn', 'nanyang.gov.cn', 'ly.gov.cn', 'sp.gov.cn',
  'xuancheng.gov.cn',
];

// City fiscal bureau domains that should NOT appear in county entries  
const cityFiscalDomains = [
  'czj.zhangzhou.gov.cn', 'czj.shaoyang.gov.cn', 'czj.changde.gov.cn',
  'nncz.nanning.gov.cn', 'czj.guilin.gov.cn', 'czj.qinzhou.gov.cn',
  'czj.baise.gov.cn', 'xxgk.longyan.gov.cn',
  'czj.ganzhou.gov.cn', 'czj.jian.gov.cn', 'czj.fy.gov.cn',
  'czj.weifang.gov.cn',
];

// Shared portals that are city-level
const sharedPortals = [
  'www.xuchang.gov.cn', 'www.jiaozuo.gov.cn', 'www.hebi.gov.cn',
  'yjs.zibo.gov.cn', 'www.yantai.gov.cn',
  'liaocheng.czyjsgk.cn', 'www.putian.gov.cn',
  'www.gxgg.gov.cn', 'www.baise.gov.cn', 'www.chongzuo.gov.cn',
];

function isFalsePositive(host) {
  // Check exact matches
  if (cityDomains.some(d => host === d || host === 'www.' + d)) return true;
  if (cityFiscalDomains.includes(host)) return true;
  if (sharedPortals.includes(host)) return true;
  return false;
}

// Parse the structure to know if an entry is city-level or county-level
// Cities have `children:` arrays; counties are inside children arrays
// We need to only revert county-level entries

let inChildren = false;
let childrenDepth = 0;
let revertCount = 0;
let revertedEntries = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track if we're inside a children: [...] block
  if (/children:\s*\[/.test(line)) {
    childrenDepth++;
    inChildren = true;
  }
  
  // Count bracket depth changes
  const openBrackets = (line.match(/\[/g) || []).length;
  const closeBrackets = (line.match(/\]/g) || []).length;
  // Actually this is unreliable, let me use a simpler approach:
  // County entries are at deeper indent (like 10 spaces) vs city entries (6 spaces)
  
  // Match county entries: { name: "XXX", url: "http://..." }
  const countyMatch = line.match(/^\s+\{ name: "(.+?)", url: "(https?:\/\/.+?)" \}/);
  if (countyMatch) {
    const [, name, url] = countyMatch;
    try {
      const host = new URL(url).hostname;
      if (isFalsePositive(host)) {
        // Check indent - county entries are typically at 10+ spaces
        const indent = line.match(/^(\s+)/)?.[1]?.length || 0;
        if (indent >= 10) { // county level
          lines[i] = line.replace(`url: "${url}"`, 'url: ""');
          revertCount++;
          revertedEntries.push({ line: i + 1, name, url, host });
        }
      }
    } catch {}
  }
}

console.log(`Reverted ${revertCount} false positive county entries:`);
for (const e of revertedEntries) {
  console.log(`  L${e.line} ${e.name} → ${e.host}`);
}

writeFileSync(dataPath, lines.join('\n'), 'utf-8');
console.log('Data file updated.');

// Count remaining empty county entries
let emptyCount = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^\s{10,}\{ name: ".+?", url: "" \}/.test(line)) {
    emptyCount++;
  }
}
console.log(`\nRemaining empty county entries: ${emptyCount}`);
