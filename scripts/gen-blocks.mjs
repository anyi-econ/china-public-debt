// Read gen-output.txt and produce replacement blocks for each province
import { readFileSync, writeFileSync } from 'fs';

const output = readFileSync('scripts/gen-output.txt', 'utf8');

// Province data from fiscal-budget-links.ts (province names + existing URLs)
const provinceInfo = {
  '河北省': { url: 'https://czt.hebei.gov.cn/root17/?cat_id=3047' },
  '山西省': { url: 'https://czt.shanxi.gov.cn/czdt/rdzt/yjsgk_49530/' },
  '辽宁省': { url: 'https://www.ln.gov.cn/web/zwgkx/sjjhczbg/index.shtml' },
  '吉林省': { url: 'http://czt.jl.gov.cn/yjs/' },
  '黑龙江省': { url: 'https://www.hlj.gov.cn/hlj/c108417/zfxxgk.shtml' },
  '安徽省': { url: 'https://czt.ah.gov.cn/public/column/7041?type=4&catId=49938051&action=list' },
  '福建省': { url: 'https://czt.fujian.gov.cn/ztzl/sjyjsgkpt/' },
  '江西省': { url: 'https://czt.jiangxi.gov.cn/col/col38849/index.html' },
  '山东省': { url: 'https://czt.shandong.gov.cn/col/col97891/index.html' },
};

// Parse sections from gen-output.txt
const sections = output.split(/^\s*\/\/ --- (.+?) cities\+counties ---$/m);
// sections[0] is empty, then alternating: name, content

const results = {};
for (let i = 1; i < sections.length; i += 2) {
  const name = sections[i];
  const content = sections[i + 1].trim();
  results[name] = content;
}

// Generate final blocks
let allOutput = '';
for (const [province, info] of Object.entries(provinceInfo)) {
  const childrenContent = results[province];
  if (!childrenContent) {
    console.error(`Missing: ${province}`);
    continue;
  }
  
  const block = `  // ═══════ ${province} ═══════
  {
    name: "${province}",
    url: "${info.url}",
    children: [
${childrenContent}
    ],
  },`;

  allOutput += `\n### ${province}\n\`\`\`\n${block}\n\`\`\`\n`;
  
  // Also write each province block to a separate file for easier copy
  writeFileSync(`scripts/block-${province}.txt`, block, 'utf8');
}

console.log('Generated blocks for all provinces');
console.log(Object.keys(results).join(', '));
