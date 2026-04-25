#!/usr/bin/env node
/**
 * Filter probe-results and emit:
 *   - accepted.ts: TS snippets ready to paste into website-policy.ts (auto-accept)
 *   - rejected.md: a log of rejected/unreachable with URLs for manual review
 */
import { readFileSync, writeFileSync } from 'node:fs';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
};

const all: ProbeResult[] = JSON.parse(
  readFileSync('scripts/website_management/policy-probe-results.json', 'utf8'),
);

function isSpecificDoc(text: string): boolean {
  if (/[《》]/.test(text)) return true;
  if (text.length > 12) return true;
  if (/通知|批复|函|关于|解读|公告|公示|办法的|决定的/.test(text)) return true;
  return false;
}

function isDetailUrl(url: string): boolean {
  if (/\/detail\//.test(url)) return true;
  if (/\/content\/[a-f0-9]{16,}/i.test(url)) return true;
  if (/\/showArticle|\/article\/\d/.test(url)) return true;
  if (/\.html$/.test(url) && /\/\d{7,}\//.test(url)) return true;
  return false;
}

function hostOf(u: string): string {
  try {
    return new URL(u).host.toLowerCase();
  } catch {
    return '';
  }
}
/** Must live on the same gov portal (or a *.<baseHost> subdomain). */
function sameOrg(candidateUrl: string, provUrl: string): boolean {
  const a = hostOf(candidateUrl);
  const b = hostOf(provUrl);
  if (!a || !b) return false;
  if (a === b) return true;
  // allow subdomain on same gov.cn base (e.g. dingan.hainan.gov.cn ⊂ hainan.gov.cn)
  const aParts = a.split('.');
  const bParts = b.split('.');
  // last 3 labels must match (province.gov.cn or city.gov.cn)
  if (aParts.length < 3 || bParts.length < 3) return false;
  const aTail = aParts.slice(-3).join('.');
  const bTail = bParts.slice(-3).join('.');
  return aTail === bTail;
}
/** Known bad hosts that indicate candidate resolved to a completely different org. */
const BAD_HOSTS = new Set(['www.gov.cn', 'www.jiangxi.gov.cn', 'www.cq.gov.cn']);

const accepted: ProbeResult[] = [];
const lowConf: ProbeResult[] = [];
const rejected: ProbeResult[] = [];

for (const r of all) {
  if (!r.picked) {
    rejected.push(r);
    continue;
  }
  if (!r.picked.listLooks) {
    lowConf.push(r);
    continue;
  }
  if (isSpecificDoc(r.picked.text) || isDetailUrl(r.picked.url)) {
    lowConf.push(r);
    continue;
  }
  if (!sameOrg(r.picked.url, r.provUrl)) {
    lowConf.push(r);
    continue;
  }
  const h = hostOf(r.picked.url);
  if (BAD_HOSTS.has(h) && hostOf(r.provUrl) !== h) {
    lowConf.push(r);
    continue;
  }
  // URL with fragment only (e.g. #menu1) or ending at host root
  try {
    const u = new URL(r.picked.url);
    if (!u.pathname || u.pathname === '/' || u.pathname === '') {
      lowConf.push(r);
      continue;
    }
  } catch {
    lowConf.push(r);
    continue;
  }
  if (r.picked.score < 55) {
    lowConf.push(r);
    continue;
  }
  accepted.push(r);
}

accepted.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));

// Emit TS snippet
const lines: string[] = [];
lines.push('// —— v6 扩充（基于 probe-policy.ts 自动探测 + 列表页校验）——');
for (const r of accepted) {
  lines.push(`  "${r.key}": "${r.picked!.url}", // ${r.picked!.text} (score=${r.picked!.score})`);
}
writeFileSync('scripts/website_management/accepted.ts.txt', lines.join('\n') + '\n', 'utf8');

// Emit rejected log (unreachable or low-conf)
const mdLines: string[] = [];
mdLines.push('# Policy probe — rejected / low-confidence entries (v6)');
mdLines.push('');
mdLines.push('## Unreachable homepages');
mdLines.push('');
for (const r of rejected) {
  mdLines.push(`- ${r.key} — ${r.provUrl} (${r.reason})`);
}
mdLines.push('');
mdLines.push('## Low-confidence picks (need manual review)');
mdLines.push('');
for (const r of lowConf) {
  mdLines.push(
    `- ${r.key} — picked "${r.picked!.text}" → ${r.picked!.url} (score=${r.picked!.score}, listLooks=${r.picked!.listLooks})`,
  );
}
writeFileSync('scripts/website_management/rejected.md', mdLines.join('\n') + '\n', 'utf8');

console.log(`accepted: ${accepted.length}`);
console.log(`lowConf:  ${lowConf.length}`);
console.log(`rejected: ${rejected.length}`);
