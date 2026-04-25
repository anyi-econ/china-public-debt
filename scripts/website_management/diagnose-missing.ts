import { readFileSync } from 'node:fs';
import { GOV_WEBSITES } from '../../data/website-gov';
import { POLICY_URL_MAP } from '../../data/website-policy';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
};
const results: ProbeResult[] = JSON.parse(readFileSync('scripts/website_management/policy-probe-results.json', 'utf8'));
const byKey = new Map(results.map((r) => [r.key, r]));

const SKIP = new Set(['香港特别行政区', '澳门特别行政区', '台湾省']);

// Diagnose missing province/city only
console.log('=== MISSING PROVINCES ===');
for (const p of GOV_WEBSITES) {
  if (SKIP.has(p.name)) continue;
  if (POLICY_URL_MAP[p.name]) continue;
  const r = byKey.get(p.name);
  if (!r) {
    console.log(`${p.name}: not probed`);
    continue;
  }
  if (r.reason) {
    console.log(`${p.name}: ${r.reason} (homepage=${p.url})`);
  } else if (r.picked) {
    console.log(`${p.name}: picked text="${r.picked.text}" score=${r.picked.score} listLooks=${r.picked.listLooks} url=${r.picked.url}`);
  }
}

console.log('\n=== MISSING CITIES (sample by reason) ===');
const reasons: Record<string, number> = {};
const samples: Record<string, string[]> = {};
for (const p of GOV_WEBSITES) {
  if (SKIP.has(p.name)) continue;
  for (const c of (p.children || [])) {
    const k = `${p.name}/${c.name}`;
    if (POLICY_URL_MAP[k]) continue;
    const r = byKey.get(k);
    if (!r) continue;
    let category = '';
    if (r.reason === 'homepage-unreachable') category = 'homepage-unreachable';
    else if (r.reason === 'no-candidate') category = 'no-candidate';
    else if (r.reason === 'target-unreachable') category = 'target-unreachable';
    else if (r.picked) {
      if (!r.picked.listLooks) category = `listLooks=false (score=${r.picked.score})`;
      else if (r.picked.score < 55) category = `score<55 (${r.picked.score})`;
      else category = `other-filter (text="${r.picked.text}" host-mismatch?)`;
    }
    reasons[category] = (reasons[category] || 0) + 1;
    if (!samples[category]) samples[category] = [];
    if (samples[category].length < 5) samples[category].push(`${k} → ${r.picked?.url || ''} text="${r.picked?.text || ''}"`);
  }
}
const sorted = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
for (const [cat, n] of sorted) {
  console.log(`\n${cat}: ${n}`);
  for (const s of samples[cat]) console.log(`  ${s}`);
}
