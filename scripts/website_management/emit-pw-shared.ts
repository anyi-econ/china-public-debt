#!/usr/bin/env node
/**
 * v8.3 — Apply cross-domain reuse to Playwright low-conf picks.
 *
 * Many child regions (县/区) have homepages that explicitly link "政策文件库"
 * back to the parent (city) portal. After PW rendering, lots of these were
 * filtered as cross-org (sameOrg=false). If the parent already has a URL on
 * that exact host in POLICY_URL_MAP, we can reuse it for the child.
 *
 * Output: scripts/website_management/accepted-pw-shared.ts.txt
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { POLICY_URL_MAP } from '../../data/website-policy';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
  source?: 'pw';
};

const all: ProbeResult[] = JSON.parse(
  readFileSync('scripts/website_management/policy-probe-results-pw.json', 'utf8'),
);
const stillMissing = new Set(
  Object.keys(JSON.parse(readFileSync('missing-policy.json', 'utf8'))),
);

function hostOf(u: string): string {
  try { return new URL(u).host.toLowerCase(); } catch { return ''; }
}

// Build host → key map from existing POLICY_URL_MAP so we can detect when a
// child's PW pick lands on a host already covered by parent.
const hostToCoveredKey = new Map<string, string>();
for (const [k, v] of Object.entries(POLICY_URL_MAP)) {
  const h = hostOf(v as string);
  if (!h) continue;
  if (!hostToCoveredKey.has(h)) hostToCoveredKey.set(h, k);
}

function isDetailUrl(url: string): boolean {
  if (/\/detail\//.test(url)) return true;
  if (/\/content\/[a-f0-9]{16,}/i.test(url)) return true;
  if (/\/showArticle|\/article\/\d/.test(url)) return true;
  if (/\.html$/.test(url) && /\/\d{7,}\//.test(url)) return true;
  return false;
}

const shared: { key: string; url: string; via: string; text: string; score: number }[] = [];
for (const r of all) {
  if (!stillMissing.has(r.key)) continue;
  if (!r.picked) continue;
  const p = r.picked;
  if (p.score < 55) continue;
  if (isDetailUrl(p.url)) continue;
  const childHost = hostOf(r.provUrl);
  const targetHost = hostOf(p.url);
  if (!childHost || !targetHost) continue;
  if (childHost === targetHost) continue; // same-org → handled by emit-pw-entries
  // Only reuse if the target host already has an entry (i.e. parent already covered)
  const parentKey = hostToCoveredKey.get(targetHost);
  if (!parentKey) continue;
  // The shared URL should be the parent's URL, not the candidate's deep link
  // (the deep link may be query-only filtered for the child).
  // But if the candidate URL itself is a list page on parent host, we keep it.
  // Otherwise fall back to parent's POLICY_URL_MAP entry.
  const parentUrl = POLICY_URL_MAP[parentKey] as string;
  shared.push({
    key: r.key,
    url: parentUrl,
    via: parentKey,
    text: p.text,
    score: p.score,
  });
}

shared.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));

const lines: string[] = [];
lines.push('  // —— v8.b 跨域复用（Playwright 探测发现链接回母级，复用母级 URL）——');
for (const s of shared) {
  lines.push(`  "${s.key}": "${s.url}", // shared from "${s.via}" (pw, ${s.text} score=${s.score})`);
}
writeFileSync('scripts/website_management/accepted-pw-shared.ts.txt', lines.join('\n') + '\n', 'utf8');
console.log(`pw shared: ${shared.length}`);
