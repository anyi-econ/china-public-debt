#!/usr/bin/env node
/** Merge new entries from accepted-disclosure-fallback.ts.txt into data/website-policy.ts.
 * Only inserts keys not already present in POLICY_URL_MAP. Appended to the existing v9 block.
 */
import fs from 'node:fs';

const DATA = 'data/website-policy.ts';
const ACCEPTED = 'scripts/website_management/accepted-disclosure-fallback.ts.txt';

const src = fs.readFileSync(DATA, 'utf8');
const accepted = fs.readFileSync(ACCEPTED, 'utf8').split(/\r?\n/).filter(Boolean);

// Collect existing keys.
const existing = new Set();
for (const m of src.matchAll(/^\s*"([^"]+)":\s*"https?:[^"]*",/gm)) existing.add(m[1]);

const newLines = [];
for (const line of accepted) {
  const m = line.match(/^\s*"([^"]+)":/);
  if (!m) continue; // header comment
  if (existing.has(m[1])) continue;
  newLines.push(line);
}

if (newLines.length === 0) {
  console.log('no new entries to merge');
  process.exit(0);
}

// Insert before the final closing `};` of the file.
const closing = src.lastIndexOf('\n};');
if (closing < 0) throw new Error('cannot find closing }; in website-policy.ts');

const insertion =
  '\n  // —— v9 兜底（增量） ——\n' + newLines.join('\n') + '\n';
const out = src.slice(0, closing) + insertion + src.slice(closing);
fs.writeFileSync(DATA, out, 'utf8');
console.log(`merged new entries: ${newLines.length}`);
