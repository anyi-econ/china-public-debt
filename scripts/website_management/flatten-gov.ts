#!/usr/bin/env node
/** Flatten data/website-gov.ts into a flat list. Run via tsx. */
import { GOV_WEBSITES } from '../../data/website-gov';
import { writeFileSync } from 'node:fs';

const SKIP = new Set(['香港特别行政区', '澳门特别行政区', '台湾省']);
type Row = { key: string; url: string; level: '省级' | '地级' | '县区' };
const out: Row[] = [];
for (const p of GOV_WEBSITES) {
  if (SKIP.has(p.name)) continue;
  if (p.url) out.push({ key: p.name, url: p.url, level: '省级' });
  for (const c of p.children || []) {
    if (c.url) out.push({ key: `${p.name}/${c.name}`, url: c.url, level: '地级' });
    for (const n of c.children || []) {
      if (n.url) out.push({ key: `${p.name}/${c.name}/${n.name}`, url: n.url, level: '县区' });
    }
  }
}
const dest = process.argv[2] || 'scripts/website_management/gov-flat.json';
writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
console.log(`flattened gov portals: ${out.length} -> ${dest}`);
