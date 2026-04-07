// Apply confirmed Zhejiang URLs to fiscal-budget-links.ts
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'fiscal-budget-links.ts');

const urlMap = {
  // City URL
  "丽水市": "https://www.lishui.gov.cn/col/col1229265128/index.html",
  // County URLs
  "余杭区": "https://www.yuhang.gov.cn/col/col1229190837/index.html",
  "滨江区": "http://www.hhtz.gov.cn/col/col1229055831/index.html",
  "江山市": "https://www.jiangshan.gov.cn/col/col1229616962/index.html",
};

let content = readFileSync(dataPath, 'utf-8');
let applied = 0;
let skipped = 0;

for (const [name, url] of Object.entries(urlMap)) {
  const pattern = new RegExp(
    `(\\{\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*,\\s*url:\\s*)""`
  );
  if (pattern.test(content)) {
    content = content.replace(pattern, `$1"${url}"`);
    console.log(`✅ Applied: ${name} → ${url}`);
    applied++;
  } else {
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
