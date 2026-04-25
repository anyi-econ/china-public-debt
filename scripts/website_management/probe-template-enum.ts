#!/usr/bin/env node
/** v10 — Province CMS template enumeration.
 * For provinces with high missing density, collect all already-accepted county/city
 * URL paths in that province (and same-prefecture-city when available), then try
 * each path against each missing county's gov host. Validate via HTTP fetch +
 * disclosure/policy keyword check.
 */
import fs from 'node:fs';
import { POLICY_URL_MAP } from '../../data/website-policy.js';

type MissingItem = { url: string };
const missing: Record<string, MissingItem> = JSON.parse(fs.readFileSync('missing-policy.json', 'utf8'));

const TARGET_PROVINCES = (process.env.TPL_PROVINCES || '湖南省,河北省,四川省,湖北省,安徽省,黑龙江省,江西省,山东省,云南省,山西省,河南省,甘肃省,辽宁省,浙江省').split(',');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

async function fetchHtml(url: string, timeout = 10000): Promise<{ html: string; finalUrl: string } | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: ctl.signal });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct && !/text|html|xml/.test(ct)) return null;
    const text = await res.text();
    if (text.length < 500) return null;
    return { html: text, finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
function stripTags(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function getTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]).slice(0, 80) : '';
}
function hostOf(u: string): string {
  try { return new URL(u).host.toLowerCase(); } catch { return ''; }
}

// 1. Collect path templates by province from already-accepted entries.
const pathStats = new Map<string, Map<string, number>>(); // province -> path -> count
for (const [key, url] of Object.entries(POLICY_URL_MAP)) {
  const parts = key.split('/');
  if (parts.length < 2) continue; // need at least province/city
  const province = parts[0];
  if (!TARGET_PROVINCES.includes(province)) continue;
  try {
    const u = new URL(url as string);
    const path = u.pathname + (u.search || '');
    if (!pathStats.has(province)) pathStats.set(province, new Map());
    const m = pathStats.get(province)!;
    m.set(path, (m.get(path) || 0) + 1);
  } catch {}
}
for (const [prov, m] of pathStats) {
  console.log(`  ${prov}: ${m.size} unique paths from ${[...m.values()].reduce((a, b) => a + b, 0)} accepted entries`);
}

// 2. Collect missing entries by province.
const missingByProvince = new Map<string, Array<{ key: string; govUrl: string }>>();
for (const [key, info] of Object.entries(missing)) {
  const province = key.split('/')[0];
  if (!TARGET_PROVINCES.includes(province)) continue;
  if (!info.url) continue;
  if (!missingByProvince.has(province)) missingByProvince.set(province, []);
  missingByProvince.get(province)!.push({ key, govUrl: info.url });
}
let totalTargets = 0;
for (const [prov, list] of missingByProvince) {
  console.log(`  ${prov} missing: ${list.length}`);
  totalTargets += list.length;
}
console.log(`total template targets: ${totalTargets}`);

// 3. Validate a candidate URL: must be reachable, must look like disclosure/policy.
function classifyTitle(t: string): 'reject' | 'narrow' | 'ok' {
  if (!t || /404|not found|页面不存在|出错|错误|403 Forbidden|禁止访问|访问出错/i.test(t)) return 'reject';
  if (/公开指南|依申请|年度报告|信息公开年报|三公经费|政府采购|互动交流|留言|信访|征集|调查|网上调查|公开制度|公开规定/.test(t)) return 'narrow';
  return 'ok';
}
function classifyContent(textSample: string, finalPath: string): 'reject' | 'narrow' | 'ok' {
  if (/页面不存在|404 not found|访问出错|无法访问|the page you requested|系统繁忙/i.test(textSample)) return 'reject';
  // Reject pages that do not mention any policy/disclosure keyword at all.
  if (!/政策|规范性文件|政府文件|法规|法定主动公开|政务公开|政府信息公开|信息公开|公开目录|文件库|zwgk|zfxxgk|xxgk/i.test(textSample + finalPath)) return 'reject';
  if (/公开指南|依申请公开|信息公开年度报告|三公经费/.test(textSample)
    && !/政策文件|规范性文件|政府文件|文件库|信息公开目录/.test(textSample)) return 'narrow';
  return 'ok';
}

type Picked = { key: string; govUrl: string; tried: number; picked?: { url: string; finalUrl: string; path: string; title: string; sample: string } };

async function tryTemplates(key: string, govUrl: string, paths: string[]): Promise<Picked> {
  const out: Picked = { key, govUrl, tried: 0 };
  let host: string;
  try { host = new URL(govUrl).host; } catch { return out; }
  const proto = govUrl.startsWith('https:') ? 'https:' : 'http:';
  for (const p of paths) {
    const candidate = `${proto}//${host}${p}`;
    out.tried++;
    const r = await fetchHtml(candidate, 9000);
    if (!r) continue;
    const title = getTitle(r.html);
    const tcls = classifyTitle(title);
    if (tcls === 'reject') continue;
    const finalPath = (() => { try { return new URL(r.finalUrl).pathname; } catch { return ''; } })();
    // Reject if redirected back to the homepage or a different host (shared portal).
    if (finalPath === '/' || finalPath === '') continue;
    if (hostOf(r.finalUrl) !== host) continue;
    const text = stripTags(r.html).slice(0, 8000);
    const ccls = classifyContent(text, finalPath);
    if (ccls === 'reject' || ccls === 'narrow' || tcls === 'narrow') continue;
    out.picked = { url: candidate, finalUrl: r.finalUrl, path: p, title, sample: text.slice(0, 200) };
    return out;
  }
  return out;
}

async function main() {
  const OUT = 'scripts/website_management/template-probe-results.json';
  const existing: Picked[] = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
  const done = new Set(existing.map((r) => r.key));
  const all: Picked[] = [...existing];

  const tasks: Array<{ key: string; govUrl: string; paths: string[] }> = [];
  for (const [prov, list] of missingByProvince) {
    const stat = pathStats.get(prov);
    if (!stat) continue;
    // Sort paths by frequency (high to low). Cap to top 25 to avoid abuse.
    const paths = [...stat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([p]) => p);
    for (const t of list) {
      if (done.has(t.key)) continue;
      tasks.push({ key: t.key, govUrl: t.govUrl, paths });
    }
  }
  console.log(`tasks (after resume): ${tasks.length}; cached: ${done.size}`);

  const total = tasks.length;
  let i = 0;
  let pickedCount = existing.filter((r) => r.picked).length;
  const start = Date.now();
  const CONC = Number(process.env.TPL_CONC || 6);

  function bar() {
    if (!process.stdout.isTTY) return;
    const done = i;
    const pct = total ? (done / total) * 100 : 100;
    const filled = Math.floor(pct / 100 * 32);
    const elapsed = (Date.now() - start) / 1000;
    const rate = done / elapsed;
    const eta = rate > 0 ? Math.round((total - done) / rate) : 0;
    const m = Math.floor(eta / 60), s = eta % 60;
    const line = `[${'█'.repeat(filled)}${'░'.repeat(32 - filled)}] ${pct.toFixed(1)}% ${done}/${total} | picked ${pickedCount} | rate ${rate.toFixed(2)}/s | ETA ${m}:${String(s).padStart(2, '0')}`;
    process.stdout.write('\r' + line);
  }

  async function worker() {
    while (i < tasks.length) {
      const my = i++;
      const t = tasks[my];
      try {
        const r = await tryTemplates(t.key, t.govUrl, t.paths);
        all.push(r);
        if (r.picked) pickedCount++;
      } catch (e) {
        all.push({ key: t.key, govUrl: t.govUrl, tried: 0 });
      }
      if (my % 10 === 0) {
        fs.writeFileSync(OUT, JSON.stringify(all, null, 2), 'utf8');
        bar();
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  fs.writeFileSync(OUT, JSON.stringify(all, null, 2), 'utf8');
  process.stdout.write('\n');
  console.log(`Done. picked: ${pickedCount}/${all.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
