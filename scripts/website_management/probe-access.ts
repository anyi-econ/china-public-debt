#!/usr/bin/env node
/**
 * Access-method probe — for each gov portal, find the cheapest strategy that returns valid HTML.
 *
 * Usage:
 *   npx tsx scripts/website_management/probe-access.ts
 *
 * Reads:  scripts/website_management/gov-flat.json
 * Writes: scripts/website_management/gov-access-results.json
 *
 * Strategy ladder (first to succeed wins):
 *   direct          — default UA, declared protocol
 *   protocol-switch — flip http <-> https
 *   ua-mobile       — mobile Chrome UA
 *   ua-baidu        — Baiduspider UA (some old portals whitelist crawlers)
 *   slow-direct     — same as direct but 25 s timeout
 *   (none)          — all strategies failed -> needs Playwright / manual
 *
 * Env:
 *   ACC_LIMIT       limit for debugging
 *   ACC_CONC        concurrency (default 12)
 *   ACC_RETRY=1     re-probe rows currently marked 'none' or with no entry
 */
import fs from 'node:fs';

type GovRow = { key: string; url: string; level: '省级' | '地级' | '县区' };
type AccessResult = {
  key: string;
  level: string;
  govUrl: string;
  accessMethod: 'direct' | 'protocol-switch' | 'ua-mobile' | 'ua-baidu' | 'slow-direct' | 'none';
  finalUrl?: string;
  htmlLength?: number;
  checkedAt: string;
};

const flat: GovRow[] = JSON.parse(
  fs.readFileSync('scripts/website_management/gov-flat.json', 'utf8'),
);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const UA_BAIDU = 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)';
const baseHeaders = (ua: string) => ({
  'User-Agent': ua,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
});

async function fetchOnce(url: string, timeout: number, ua: string): Promise<{ ok: true; len: number } | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: baseHeaders(ua), redirect: 'follow', signal: ctl.signal });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct && !/text|html|xml/.test(ct)) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 200) return null;
    return { ok: true, len: buf.byteLength };
  } catch { return null; } finally { clearTimeout(timer); }
}

async function probe(row: GovRow): Promise<AccessResult> {
  const now = new Date().toISOString();
  const base: Pick<AccessResult, 'key' | 'level' | 'govUrl' | 'checkedAt'> = {
    key: row.key, level: row.level, govUrl: row.url, checkedAt: now,
  };
  // 1. direct
  let r = await fetchOnce(row.url, 12000, UA);
  if (r) return { ...base, accessMethod: 'direct', finalUrl: row.url, htmlLength: r.len };
  // 2. protocol switch
  let altUrl = row.url;
  if (/^https:/i.test(row.url)) altUrl = row.url.replace(/^https:/i, 'http:');
  else if (/^http:/i.test(row.url)) altUrl = row.url.replace(/^http:/i, 'https:');
  if (altUrl !== row.url) {
    r = await fetchOnce(altUrl, 12000, UA);
    if (r) return { ...base, accessMethod: 'protocol-switch', finalUrl: altUrl, htmlLength: r.len };
  }
  // 3. mobile UA
  r = await fetchOnce(row.url, 12000, UA_MOBILE);
  if (r) return { ...base, accessMethod: 'ua-mobile', finalUrl: row.url, htmlLength: r.len };
  // 4. Baidu spider UA
  r = await fetchOnce(row.url, 12000, UA_BAIDU);
  if (r) return { ...base, accessMethod: 'ua-baidu', finalUrl: row.url, htmlLength: r.len };
  // 5. slow direct
  r = await fetchOnce(row.url, 25000, UA);
  if (r) return { ...base, accessMethod: 'slow-direct', finalUrl: row.url, htmlLength: r.len };
  return { ...base, accessMethod: 'none' };
}

async function main() {
  const limit = Number(process.env.ACC_LIMIT || 0);
  const list = limit ? flat.slice(0, limit) : flat;
  const targetSet = new Set(list.map((r) => r.key));
  const OUT = 'scripts/website_management/gov-access-results.json';
  const retry = process.env.ACC_RETRY === '1';
  const existingRaw: AccessResult[] = fs.existsSync(OUT)
    ? (JSON.parse(fs.readFileSync(OUT, 'utf8')) as AccessResult[]).filter((r) => targetSet.has(r.key))
    : [];
  const existing = retry
    ? existingRaw.filter((r) => r.accessMethod !== 'none')
    : existingRaw;
  const done = new Set(existing.map((r) => r.key));
  console.log(`[access] targets: ${list.length}; cached: ${done.size}; remaining: ${list.length - done.size}`);
  const results: AccessResult[] = [...existing];
  const queue = list.filter((r) => !done.has(r.key));
  const conc = Number(process.env.ACC_CONC || 12);
  let inflight = 0;
  let idx = 0;
  let picked = 0;
  let saved = Date.now();
  for (const r of results) if (r.accessMethod !== 'none') picked++;
  const total = list.length;
  const start = Date.now();
  await new Promise<void>((resolve) => {
    const launch = () => {
      while (inflight < conc && idx < queue.length) {
        const row = queue[idx++];
        inflight++;
        probe(row).then((res) => {
          results.push(res);
          if (res.accessMethod !== 'none') picked++;
          inflight--;
          const doneN = results.length;
          if (Date.now() - saved > 5000) {
            fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
            saved = Date.now();
          }
          if (doneN % 50 === 0 || doneN === total) {
            const rate = doneN / Math.max(1, (Date.now() - start) / 1000);
            const eta = Math.max(0, (total - doneN) / Math.max(rate, 0.001));
            const m = Math.floor(eta / 60), s = Math.floor(eta % 60);
            console.log(`[access] ${doneN}/${total} | picked ${picked} | ${rate.toFixed(2)}/s | ETA ${m}:${String(s).padStart(2, '0')}`);
          }
          if (idx >= queue.length && inflight === 0) resolve();
          else launch();
        });
      }
      if (idx >= queue.length && inflight === 0) resolve();
    };
    launch();
  });
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  const breakdown: Record<string, number> = {};
  for (const r of results) breakdown[r.accessMethod] = (breakdown[r.accessMethod] || 0) + 1;
  console.log(`[access] done. ${picked}/${total} reachable.`);
  console.log('[access] strategy breakdown:', breakdown);
}

main().catch((e) => { console.error(e); process.exit(1); });
