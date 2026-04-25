#!/usr/bin/env node
// Dumps missing province + city entries grouped by province for subagent dispatch
import { GOV_WEBSITES } from '../../data/website-gov';
import { POLICY_URL_MAP } from '../../data/website-policy';
import { writeFileSync } from 'node:fs';

const SKIP = new Set(['香港特别行政区', '澳门特别行政区', '台湾省']);
const out: Record<string, { url: string }> = {};
for (const p of GOV_WEBSITES) {
  if (SKIP.has(p.name)) continue;
  if (!POLICY_URL_MAP[p.name] && p.url) out[p.name] = { url: p.url };
  for (const c of (p.children || [])) {
    const ckey = `${p.name}/${c.name}`;
    if (!POLICY_URL_MAP[ckey] && c.url) out[ckey] = { url: c.url };
    for (const n of (c.children || [])) {
      const nkey = `${p.name}/${c.name}/${n.name}`;
      if (!POLICY_URL_MAP[nkey] && n.url) out[nkey] = { url: n.url };
    }
  }
}
writeFileSync('missing-policy.json', JSON.stringify(out, null, 2), 'utf8');
console.log('written missing-policy.json entries:', Object.keys(out).length);
