#!/usr/bin/env node
/**
 * v8: 跨域复用规则
 *
 * 对当前缺口（missing-policy.json），若该 key 在 probe-results 中有 picked，
 * 且 picked.host 等于 *已收录* 的某个 ancestor (省 / 市) 的 host —— 说明
 * 子级网站本身就把"政策文件库"链回母级 —— 直接把 ancestor 的已收录 URL
 * 复用到子级，并打 `// shared from <ancestor>` 注释。
 *
 * 输出：accepted-shared.ts.txt 追加片段。
 */
import fs from 'node:fs';
import path from 'node:path';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
};

const probe: ProbeResult[] = Object.values(
  JSON.parse(fs.readFileSync('scripts/website_management/policy-probe-results.json', 'utf8')),
);
const missing: Record<string, string> = JSON.parse(fs.readFileSync('missing-policy.json', 'utf8'));
const stillMissing = new Set(Object.keys(missing));

// Load existing POLICY_URL_MAP via regex (avoids importing TS at runtime).
const src = fs.readFileSync('data/website-policy.ts', 'utf8');
const existing = new Map<string, string>();
const entryRe = /^\s*"([^"]+)":\s*"([^"]+)"/gm;
for (const m of src.matchAll(entryRe)) {
  existing.set(m[1], m[2]);
}

function host(u: string): string {
  try {
    return new URL(u).host.toLowerCase();
  } catch {
    return '';
  }
}

const ancestors = (key: string): string[] => {
  const parts = key.split('/');
  const out: string[] = [];
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join('/'));
  return out;
};

const newEntries: Array<{ key: string; url: string; from: string; pickedHost: string }> = [];
for (const r of probe) {
  if (!r || !r.picked || !stillMissing.has(r.key)) continue;
  const pHost = host(r.picked.url);
  if (!pHost) continue;
  for (const anc of ancestors(r.key)) {
    const ancUrl = existing.get(anc);
    if (!ancUrl) continue;
    if (host(ancUrl) === pHost) {
      newEntries.push({ key: r.key, url: ancUrl, from: anc, pickedHost: pHost });
      break;
    }
  }
}

newEntries.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));

const lines = ['  // —— v8 跨域复用：子级网站把政策库链回母级，直接复用母级条目 ——'];
for (const e of newEntries) {
  lines.push(`  "${e.key}": "${e.url}", // shared from "${e.from}"`);
}
fs.writeFileSync('scripts/website_management/accepted-shared.ts.txt', lines.join('\n') + '\n', 'utf8');

console.log(`shared-reuse candidates: ${newEntries.length}`);
console.log(`written: scripts/website_management/accepted-shared.ts.txt`);
console.log('breakdown:');
const byProv: Record<string, number> = {};
for (const e of newEntries) {
  const p = e.key.split('/')[0];
  byProv[p] = (byProv[p] || 0) + 1;
}
for (const [p, n] of Object.entries(byProv).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p}: ${n}`);
}
