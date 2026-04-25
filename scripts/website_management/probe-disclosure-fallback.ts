#!/usr/bin/env node
/**
 * v9 — 政务公开兜底探测。
 *
 * 用户确认：若县级门户没有单独政策入口，而政策公开由“政务公开 / 政府信息公开”
 * 路由点击后动态加载，则可填写政务公开路由，不必继续下探。
 *
 * This script scans still-missing gov portals and emits stable disclosure routes:
 * 政务公开 / 政府信息公开 / 信息公开 / 法定主动公开内容.
 */
import fs from 'node:fs';

type MissingItem = { url: string };
type Candidate = { url: string; text: string; score: number; source: string; validated: boolean };

const missing: Record<string, MissingItem> = JSON.parse(fs.readFileSync('missing-policy.json', 'utf8'));

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

function hostOf(u: string): string {
  try { return new URL(u).host.toLowerCase(); } catch { return ''; }
}
function sameBase(a: string, b: string): boolean {
  const ah = hostOf(a), bh = hostOf(b);
  if (!ah || !bh) return false;
  if (ah === bh) return true;
  const ap = ah.split('.'), bp = bh.split('.');
  if (ap.length < 3 || bp.length < 3) return false;
  return ap.slice(-3).join('.') === bp.slice(-3).join('.');
}
function normalizeUrl(base: string, href: string): string | null {
  try {
    if (!href || /^javascript:|^mailto:|^tel:/i.test(href) || href === '#') return null;
    const u = new URL(href, base);
    u.hash = '';
    return u.toString();
  } catch { return null; }
}
async function fetchHtml(url: string, timeout = 12000): Promise<string | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: ctl.signal });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct && !/text|html|xml/.test(ct)) return null;
    const text = await res.text();
    if (text.length < 200) return null;
    return text;
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
function extractAnchors(base: string, html: string): Array<{ url: string; text: string }> {
  const out: Array<{ url: string; text: string }> = [];
  const re = /<a\b[^>]*?href\s*=\s*["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(re)) {
    const url = normalizeUrl(base, m[1]);
    if (!url) continue;
    const text = stripTags(m[2]);
    if (!text || text.length > 30) continue;
    out.push({ url, text });
  }
  return out;
}
function scoreDisclosure(text: string, url: string): number {
  const t = `${text} ${url}`;
  let s = 0;
  const path = (() => {
    try { return new URL(url).pathname.toLowerCase(); } catch { return ''; }
  })();
  // User-approved fallback is the broad disclosure route, not the guide,
  // annual report, application page, topic page, or a specific article.
  if (/指南|公开指南|年报|年度报告|依申请|申请公开|公开制度|公开规定|重点领域|财政|预决算|三公|采购|互动|留言|信访|征集/.test(text)) return -50;
  if (/pubguide|zfxxgkzn|gkzn|ysqgk|nb$|ndbg|zdly|finance|caizheng|czys|yjs|czzj|cg|hudong|hdjl/i.test(path)) return -50;
  if (/\/\d{6,}\/|\/\d{4}\//.test(path) && /\.s?html?$/.test(path)) return -50;
  if (/政府信息公开|政府信息公开目录|政府信息公开专栏/.test(t)) s = Math.max(s, 90);
  if (/政务公开|信息公开/.test(t)) s = Math.max(s, 80);
  if (/法定主动公开|法定公开/.test(t)) s = Math.max(s, 75);
  if (/公开目录|公开指南/.test(t)) s = Math.max(s, 65);
  if (/\/zfxxgk|\/zwgk|\/xxgk|\/gkml|\/openness|\/public\//i.test(url)) s += 12;
  if (/统计|财政|预决算|采购|互动|留言|信访|征集/.test(text)) s -= 30;
  if (/www\.gov\.cn|english|login|javascript/i.test(url)) s -= 50;
  if (new URL(url).pathname === '/' || /index\.html?$/.test(new URL(url).pathname) && !/zwgk|xxgk|zfxxgk|openness|public|gkml/i.test(url)) s -= 10;
  return s;
}
function constructedCandidates(base: string): Array<{ url: string; text: string; score: number; source: string }> {
  const paths = [
    // 政务公开根入口
    '/zwgk/', '/zwgk/index.html', '/zfxxgk/', '/zfxxgk/index.html', '/xxgk/', '/xxgk/index.html',
    '/gkml/', '/gkml/index.html', '/openness/', '/openness/index.html', '/public/', '/public/index.html',
    // 高频政策子路径（来自已收录条目挖掘）
    '/zwgk/zcwj/', '/zwgk/zcwjk/', '/zwgk/zfwj/', '/zwgk/zfwj/index.html',
    '/zfxxgk/zcwj/', '/zfxxgk/zcwjk/', '/zfxxgk/zfwj/', '/zfxxgk/fdzdgknr/zfwj/',
    '/xxgk/zcwj/', '/xxgk/zcwjk/', '/xxgk/zfwj/', '/ztzl/zcwjk/', '/zfwj/list1.shtml',
    '/policy-find/', '/govxxgk/xxgk.html',
  ];
  const out = [];
  for (const p of paths) {
    const u = normalizeUrl(base, p);
    if (!u) continue;
    let text = '政务公开';
    if (/zfxxgk/i.test(p)) text = '政府信息公开';
    else if (/xxgk/i.test(p)) text = '信息公开';
    if (/zcwj|zcwjk|policy-find/i.test(p)) text = '政策文件';
    else if (/zfwj/i.test(p)) text = '政府文件';
    out.push({ url: u, text, score: 58, source: 'constructed' });
  }
  return out;
}
async function validateDisclosure(c: Candidate): Promise<boolean> {
  try {
    const path = new URL(c.url).pathname.toLowerCase();
    if (/pubguide|zfxxgkzn|gkzn|ysqgk|ndbg|zdly|finance|caizheng|czys|yjs|czzj|cg|hudong|hdjl/i.test(path)) return false;
    if (/\/\d{6,}\/|\/\d{4}\//.test(path) && /\.s?html?$/.test(path)) return false;
  } catch {
    return false;
  }
  const html = await fetchHtml(c.url, 9000);
  if (!html) return false;
  const text = stripTags(html).slice(0, 5000);
  if (/页面不存在|404|not found|访问出错|无法访问/.test(text)) return false;
  if (/公开指南|依申请公开|年度报告|财政预决算|三公经费|政府采购/.test(text) && !/政策|规范性文件|政府文件|法定主动公开/.test(text)) return false;
  return /政务公开|政府信息公开|信息公开|法定主动公开|政策|规范性文件|政府文件/.test(text);
}

async function probeOne(key: string, govUrl: string): Promise<{ key: string; govUrl: string; picked?: Candidate; reason?: string }> {
  const html = await fetchHtml(govUrl);
  const candidates: Candidate[] = [];
  if (html) {
    for (const a of extractAnchors(govUrl, html)) {
      if (!sameBase(a.url, govUrl)) continue;
      const score = scoreDisclosure(a.text, a.url);
      if (score >= 55) candidates.push({ ...a, score, source: 'anchor', validated: false });
    }
  }
  for (const c of constructedCandidates(govUrl)) {
    if (sameBase(c.url, govUrl)) candidates.push({ ...c, validated: false });
  }

  const unique = new Map<string, Candidate>();
  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (!unique.has(c.url)) unique.set(c.url, c);
  }
  const sorted = [...unique.values()].sort((a, b) => b.score - a.score);
  for (const c of sorted.slice(0, 8)) {
    c.validated = await validateDisclosure(c);
    if (c.validated) return { key, govUrl, picked: c };
  }
  return { key, govUrl, reason: html ? 'no-disclosure-route' : 'homepage-unreachable' };
}

async function main() {
  const keys = Object.keys(missing);
  const limit = Number(process.env.DISCLOSURE_LIMIT || 0);
  const list = limit ? keys.slice(0, limit) : keys;
  const targetSet = new Set(list);
  const retryFailures = process.env.DISCLOSURE_RETRY_FAILURES !== '0';
  console.log(`disclosure targets: ${list.length}`);
  const OUT = 'scripts/website_management/policy-disclosure-fallback-results.json';
  const existingRaw: Array<Awaited<ReturnType<typeof probeOne>>> = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8')).filter((r: { key: string }) => targetSet.has(r.key))
    : [];
  const existingMap = new Map<string, Awaited<ReturnType<typeof probeOne>>>();
  for (const r of existingRaw) existingMap.set(r.key, r);
  const shouldRetry = (r: Awaited<ReturnType<typeof probeOne>>) =>
    retryFailures && /homepage-unreachable|error:/.test(r.reason || '');
  const existing = [...existingMap.values()].filter((r) => !shouldRetry(r));
  const done = new Set(existing.map((r) => r.key));
  const retryCount = [...existingMap.values()].filter(shouldRetry).length;
  console.log(
    `already done: ${done.size}; retrying cached fetch failures: ${retryCount}; remaining: ${list.filter((k) => !done.has(k)).length}`,
  );
  const results: Array<Awaited<ReturnType<typeof probeOne>>> = [...existing];
  const start = Date.now();
  const total = list.length;
  function formatDuration(ms: number): string {
    if (!Number.isFinite(ms) || ms < 0) return '--:--';
    const sec = Math.round(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }
  function renderProgress(forceNewline = false) {
    const completed = Math.min(results.length, total);
    const picked = results.filter((r) => r.picked).length;
    const pct = total ? completed / total : 1;
    const width = 32;
    const filled = Math.round(pct * width);
    const bar = `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
    const elapsed = Date.now() - start;
    const processedThisRun = Math.max(0, completed - done.size);
    const rate = processedThisRun > 0 ? processedThisRun / (elapsed / 1000) : 0;
    const remaining = Math.max(0, total - completed);
    const eta = rate > 0 ? (remaining / rate) * 1000 : Number.POSITIVE_INFINITY;
    const line = `[${bar}] ${(pct * 100).toFixed(1).padStart(5)}% ${completed}/${total} | picked ${picked} | rate ${rate.toFixed(2)}/s | ETA ${formatDuration(eta)}`;
    if (process.stdout.isTTY) {
      process.stdout.write(`\r${line}${forceNewline ? '\n' : ''}`);
    } else if (forceNewline || completed % 50 === 0) {
      console.log(line);
    }
  }
  function saveNow() {
    results.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  }
  process.on('SIGINT', () => {
    saveNow();
    renderProgress(true);
    console.log('saved on SIGINT');
    process.exit(130);
  });
  let i = 0;
  const CONC = Number(process.env.DISCLOSURE_CONC || 12);
  let saved = 0;
  renderProgress();
  async function worker() {
    while (i < list.length) {
      const idx = i++;
      const key = list[idx];
      if (done.has(key)) continue;
      const govUrl = missing[key].url;
      try {
        results.push(await probeOne(key, govUrl));
      } catch (e) {
        results.push({ key, govUrl, reason: `error:${(e as Error).message}` });
      }
      saved++;
      if (saved % 50 === 0) {
        saveNow();
      }
      renderProgress();
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  saveNow();
  renderProgress(true);
  const picked = results.filter((r) => r.picked).length;
  console.log(`Done. disclosure picked: ${picked}/${results.length}`);

  const lines = ['  // —— v9 兜底：无单独政策路由时填写政务公开 / 政府信息公开入口 ——'];
  for (const r of results.filter((r) => r.picked)) {
    const p = r.picked!;
    lines.push(`  "${r.key}": "${p.url}", // disclosure fallback: ${p.text} (${p.source}, score=${p.score})`);
  }
  fs.writeFileSync('scripts/website_management/accepted-disclosure-fallback.ts.txt', lines.join('\n') + '\n', 'utf8');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
