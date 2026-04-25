#!/usr/bin/env node
/** Emit accepted POLICY_URL_MAP entries from policy-disclosure-fallback-results.json.
 * This is intentionally separated from probing so completed runs can be re-filtered
 * without re-hitting government websites.
 */
import fs from 'node:fs';

type Candidate = { url: string; text: string; score: number; source: string; validated: boolean };
type Result = { key: string; govUrl: string; picked?: Candidate; reason?: string };

const IN = 'scripts/website_management/policy-disclosure-fallback-results.json';
const OUT = 'scripts/website_management/accepted-disclosure-fallback.ts.txt';
const results: Result[] = JSON.parse(fs.readFileSync(IN, 'utf8'));

function rejectPicked(p: Candidate): string | null {
  const u = new URL(p.url);
  const target = `${p.text} ${u.pathname} ${u.search}`;
  // Broad disclosure fallback is allowed; narrow guide/report/fiscal/procurement/topic pages are not.
  if (/指南|公开指南|年报|年度报告|依申请|申请公开|公开制度|公开规定|重点领域|财政|预决算|三公|采购|互动|留言|信访|征集/.test(p.text)) return 'narrow-disclosure-text';
  if (/pubguide|zfxxgkzn|gkzn|ysqgk|nb$|ndbg|zdly|finance|caizheng|czys|yjs|czzj|cg|hudong|hdjl/i.test(target)) return 'narrow-disclosure-path';
  if (/\/\d{6,}\/|\/\d{4}\//.test(u.pathname) && /\.s?html?$/i.test(u.pathname)) return 'article-like-path';
  if (!/政务公开|政府信息公开|信息公开|法定主动公开|公开目录|\/zfxxgk|\/zwgk|\/xxgk|\/gkml|\/openness|\/public\//i.test(target)) return 'not-disclosure-route';
  return null;
}

const accepted: Result[] = [];
const rejected: Array<{ result: Result; rejectReason: string }> = [];
for (const r of results) {
  if (!r.picked) continue;
  const reason = rejectPicked(r.picked);
  if (reason) rejected.push({ result: r, rejectReason: reason });
  else accepted.push(r);
}

accepted.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));
const lines = ['  // —— v9 兜底：无单独政策路由时填写政务公开 / 政府信息公开入口 ——'];
for (const r of accepted) {
  const p = r.picked!;
  lines.push(`  "${r.key}": "${p.url}", // disclosure fallback: ${p.text} (${p.source}, score=${p.score})`);
}
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
fs.writeFileSync(
  'scripts/website_management/rejected-disclosure-fallback.json',
  JSON.stringify(rejected, null, 2),
  'utf8',
);
console.log(`accepted disclosure fallback: ${accepted.length}`);
console.log(`rejected picked fallback: ${rejected.length}`);
console.log(`written: ${OUT}`);
