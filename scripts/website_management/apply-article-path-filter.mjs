#!/usr/bin/env node
/**
 * Re-evaluate cached probe-column results against the tightened ARTICLE_PATH
 * regex. For records whose picked.url is now classified as a single-article URL,
 * drop `picked` and set `reason: 'rejected:single-article-postv1'`.
 *
 * Usage:  node apply-article-path-filter.mjs <category> [--dry]
 *   <category>  news | industrial | policy
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ARTICLE_PATH = /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\/|\/\d{4}\d{2}\/t\d{8}_\d+\.s?html?$|\/content\/(article|post)[_/]?\d+\.s?html?$|\/(tzgg|tongzhi|gonggao)\/\d{6,}\.s?html?$|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$|\/[ct]_\d+\.s?html?$/i;

const cat = process.argv[2];
const dry = process.argv.includes('--dry');
if (!cat || !['news', 'industrial', 'policy'].includes(cat)) {
  console.error('usage: node apply-article-path-filter.mjs <news|industrial|policy> [--dry]');
  process.exit(1);
}

const file = join(__dirname, `${cat}-probe-results.json`);
const data = JSON.parse(readFileSync(file, 'utf8'));

let dropped = 0;
const examples = [];
for (const r of data) {
  if (!r.picked?.url) continue;
  let path;
  try { path = new URL(r.picked.url).pathname; } catch { continue; }
  if (ARTICLE_PATH.test(path)) {
    if (examples.length < 12) examples.push({ key: r.key, url: r.picked.url, text: r.picked.text, tier: r.picked.tier });
    if (!dry) {
      delete r.picked;
      r.reason = 'rejected:single-article-postv1';
    }
    dropped++;
  }
}

console.log(`[${cat}] dropped ${dropped} single-article false positives`);
console.log('examples:');
for (const e of examples) console.log(`  ${e.key} | ${e.tier} | ${e.text}\n    ${e.url}`);

if (!dry) {
  const bak = file + '.pre-articlepath.bak';
  if (!existsSync(bak)) copyFileSync(file, bak);
  writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`\nwrote ${file} (backup: ${bak})`);
} else {
  console.log('\n(dry run — no changes written)');
}
