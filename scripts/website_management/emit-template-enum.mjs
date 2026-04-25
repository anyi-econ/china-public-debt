#!/usr/bin/env node
/** Emit accepted POLICY_URL_MAP entries from template-probe-results.json. */
import fs from 'node:fs';
const IN = 'scripts/website_management/template-probe-results.json';
const OUT = 'scripts/website_management/accepted-template-enum.ts.txt';
const arr = JSON.parse(fs.readFileSync(IN, 'utf8'));

// Stricter post-filter: reject single-article paths and homepage redirects.
function rejectPicked(p) {
  const url = p.finalUrl || p.url;
  let path, search;
  try { const u = new URL(url); path = u.pathname; search = u.search; } catch { return 'bad-url'; }
  if (path === '/' || path === '') return 'homepage';
  if (/\/art\/\d{4}\/art_[a-f0-9]+\.html?$/i.test(path)) return 'article-page';
  if (/\.s?html?$/i.test(path) && /\/\d{4}\/|\/\d{6,}\//.test(path)) return 'article-page';
  if (/\/htmls\/index\.html?$/i.test(path) && /\?a=/.test(search || '')) return 'homepage-with-query';
  if (/公开指南|依申请|年度报告|信息公开年报/.test(p.title || '')) return 'narrow-title';
  return null;
}

const accepted = [];
const rejectedDbg = [];
for (const r of arr) {
  if (!r.picked) continue;
  const why = rejectPicked(r.picked);
  if (why) rejectedDbg.push({ key: r.key, why, url: r.picked.finalUrl || r.picked.url, title: r.picked.title });
  else accepted.push(r);
}
fs.writeFileSync('scripts/website_management/rejected-template-enum.json', JSON.stringify(rejectedDbg, null, 2), 'utf8');
accepted.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));
const lines = ['  // —— v10 省域 CMS 模板枚举：用同省已收录路径在缺失县区 host 上构造并验证 ——'];
for (const r of accepted) {
  const p = r.picked;
  // Use finalUrl to honor server-side redirects.
  const url = p.finalUrl || p.url;
  lines.push(`  "${r.key}": "${url}", // template enum: ${p.title.slice(0, 40)} (path=${p.path})`);
}
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log(`accepted template enum: ${accepted.length}`);
console.log(`written: ${OUT}`);
