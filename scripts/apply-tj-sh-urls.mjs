// Apply confirmed TJ (4) and SH (2) district budget URLs to fiscal-budget-links.ts
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'fiscal-budget-links.ts');

const urlMap = {
  // Tianjin
  "和平区": "https://www.tjhp.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/",
  "河西区": "https://www.tjhx.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/",
  "滨海新区": "https://www.tjbh.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/",
  "南开区": "https://www.tjnk.gov.cn/NKQZF/ZWGK5712/zfxxgkqzf/hz1/fdzdgknr1/czyjs1/",
  // Shanghai
  "徐汇区": "https://www.xuhui.gov.cn/xxgk/portal/article/list?menuType=wgk&code=jcgk_czyjsgk",
  "浦东新区": "https://www.pudong.gov.cn/zwgk/zfxxgk/fd/czyjs/",
};

let content = readFileSync(dataPath, 'utf-8');
let applied = 0;
let skipped = 0;

for (const [name, url] of Object.entries(urlMap)) {
  // Only match entries that currently have empty url
  const pattern = new RegExp(
    `(\\{\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*,\\s*url:\\s*)""`
  );
  if (pattern.test(content)) {
    content = content.replace(pattern, `$1"${url}"`);
    console.log(`✅ Applied: ${name} → ${url}`);
    applied++;
  } else {
    // Check if already has URL
    const hasUrl = new RegExp(
      `name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*,\\s*url:\\s*"[^"]+"`
    );
    if (hasUrl.test(content)) {
      console.log(`⏩ Already has URL: ${name}`);
      skipped++;
    } else {
      console.log(`❌ Not found: ${name}`);
    }
  }
}

writeFileSync(dataPath, content, 'utf-8');
console.log(`\nDone: ${applied} applied, ${skipped} skipped`);
