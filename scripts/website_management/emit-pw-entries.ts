#!/usr/bin/env node
/**
 * v8.2 — Merge Playwright pw probe results into the same classify() pipeline,
 * then emit accepted entries (as TS lines) restricted to keys that are still
 * missing in POLICY_URL_MAP.
 *
 * Output: scripts/website_management/accepted-pw.ts.txt
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
  source?: 'pw';
};

if (!existsSync('scripts/website_management/policy-probe-results-pw.json')) {
  console.error('pw results file missing; run probe-policy-pw.ts first');
  process.exit(1);
}
if (!existsSync('missing-policy.json')) {
  console.error('missing-policy.json missing; run dump-missing-policy.ts first');
  process.exit(1);
}

const all: ProbeResult[] = JSON.parse(
  readFileSync('scripts/website_management/policy-probe-results-pw.json', 'utf8'),
);
const stillMissing = new Set(
  Object.keys(JSON.parse(readFileSync('missing-policy.json', 'utf8'))),
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
  try { return new URL(u).host.toLowerCase(); } catch { return ''; }
}
function sameOrg(a: string, b: string): boolean {
  const x = hostOf(a), y = hostOf(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const xp = x.split('.'), yp = y.split('.');
  if (xp.length < 3 || yp.length < 3) return false;
  return xp.slice(-3).join('.') === yp.slice(-3).join('.');
}
const BAD_HOSTS = new Set(['www.gov.cn', 'www.jiangxi.gov.cn']);
const CANONICAL_PATH = /\/(zcwjk|zcwj|gfxwj|xzgfxwj|szfwj|qzfwj|xzfwj|zfwj|fgwj|zcfg|zcfgk|zhengce|fzfgk|wjk|zcwjs|policydoc|policycontent)\b/i;

function classify(r: ProbeResult): 'accept' | 'low' | 'reject' {
  if (!r.picked) return 'reject';
  const p = r.picked;
  if (isSpecificDoc(p.text)) return 'low';
  if (isDetailUrl(p.url)) return 'low';
  if (!sameOrg(p.url, r.provUrl)) return 'low';
  const h = hostOf(p.url);
  if (BAD_HOSTS.has(h) && hostOf(r.provUrl) !== h) return 'low';
  try {
    const u = new URL(p.url);
    if (!u.pathname || u.pathname === '/') return 'low';
  } catch { return 'low'; }
  // Same permissive ladder as v7. Playwright-rendered listLooks is more reliable,
  // so we keep the same thresholds.
  if (p.score >= 80) return 'accept';
  if (p.score >= 55 && p.listLooks) return 'accept';
  if (p.score >= 55 && CANONICAL_PATH.test(p.url)) return 'accept';
  if (p.score >= 40 && p.listLooks && CANONICAL_PATH.test(p.url)) return 'accept';
  return 'low';
}

const accepted: ProbeResult[] = [];
const lowConf: ProbeResult[] = [];
const rejected: ProbeResult[] = [];

for (const r of all) {
  if (!stillMissing.has(r.key)) continue;
  const c = classify(r);
  if (c === 'accept') accepted.push(r);
  else if (c === 'low') lowConf.push(r);
  else rejected.push(r);
}
accepted.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));

const lines: string[] = [];
lines.push('  // —— v8 扩充（Playwright SPA 渲染后探测）——');
for (const r of accepted) {
  lines.push(`  "${r.key}": "${r.picked!.url}", // ${r.picked!.text} (score=${r.picked!.score}, pw)`);
}
writeFileSync('scripts/website_management/accepted-pw.ts.txt', lines.join('\n') + '\n', 'utf8');

console.log(`pw accepted: ${accepted.length}`);
console.log(`pw lowConf:  ${lowConf.length}`);
console.log(`pw rejected: ${rejected.length}`);
