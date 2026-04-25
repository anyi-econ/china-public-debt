#!/usr/bin/env node
/** Merge accepted-template-enum.ts.txt into data/website-policy.ts. */
import fs from 'node:fs';
const DATA = 'data/website-policy.ts';
const ACC = 'scripts/website_management/accepted-template-enum.ts.txt';
const src = fs.readFileSync(DATA, 'utf8');
const lines = fs.readFileSync(ACC, 'utf8').split(/\r?\n/).filter(Boolean);

const existing = new Set();
for (const m of src.matchAll(/^\s*"([^"]+)":\s*"https?:[^"]*",/gm)) existing.add(m[1]);

const newLines = [];
for (const line of lines) {
  const m = line.match(/^\s*"([^"]+)":/);
  if (!m) continue;
  if (existing.has(m[1])) continue;
  newLines.push(line);
}
if (newLines.length === 0) { console.log('no new entries'); process.exit(0); }
const closing = src.lastIndexOf('\n};');
const insertion = '\n  // —— v10 省域 CMS 模板枚举（增量） ——\n' + newLines.join('\n') + '\n';
fs.writeFileSync(DATA, src.slice(0, closing) + insertion + src.slice(closing), 'utf8');
console.log(`merged: ${newLines.length}`);
