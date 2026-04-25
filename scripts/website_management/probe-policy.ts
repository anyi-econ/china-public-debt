#!/usr/bin/env node
/**
 * Probe candidate policy index URLs for regions missing from website-policy.ts.
 *
 * Strategy:
 *  1. Fetch each gov portal homepage (with realistic headers).
 *  2. Extract all <a href> + anchor text.
 *  3. Score links by keyword match (政策文件库 > 政策文件 > 规范性文件 > 找政策 > 政策法规 > 政府文件 > 政策).
 *  4. Resolve relative URLs; skip obviously bad targets (mailto:, javascript:, #, login pages).
 *  5. Verify the top candidate returns HTTP 200 and still contains list-page markers
 *     (links containing 文 [No.] 号 or dates yyyy-mm-dd, or 共 N 条).
 *  6. Emit result JSON; leave URL empty if no confident match.
 *
 * Output: scripts/website_management/policy-probe-results.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { URL } from 'node:url';

type MissingEntry = { url: string };

const DATA: Record<string, MissingEntry> = JSON.parse(
  readFileSync('missing-policy.json', 'utf8'),
);

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const KEYWORDS: { re: RegExp; score: number }[] = [
  { re: /政策文件库|政策文件检索|政策检索库|政策查询|找政策/, score: 100 },
  { re: /规范性文件(库|检索|查询)?/, score: 80 },
  { re: /行政规范性文件/, score: 75 },
  { re: /政府文件库|市政府文件|省政府文件|区政府文件|县政府文件|自治区政府文件/, score: 60 },
  { re: /政策文件/, score: 55 },
  { re: /政策法规/, score: 45 },
  { re: /政府文件|政府令|政府规章/, score: 40 },
  { re: /zcwjk|zcwj\/|zxwj|szfwj|xzgfxwj|gfxwj|fgwj|zcfg|zcfgk/i, score: 30 },
];

const NEG_KEY: RegExp[] = [
  /登录|login|signin/i,
  /english/i,
  /废止|失效文件/,
  /一件事|办事指南|主题服务|我要办/,
  /新闻|通知|公告|公示/,  // too generic
  /首页|返回|回到/,
];

function scoreLink(text: string, href: string): number {
  let s = 0;
  const combined = `${text} ${href}`;
  for (const { re, score } of KEYWORDS) if (re.test(combined)) s = Math.max(s, score);
  for (const re of NEG_KEY) if (re.test(text)) s -= 20;
  if (/javascript:|mailto:|tel:/i.test(href)) return -1;
  if (href === '#' || href === '') return -1;
  return s;
}

async function fetchHtml(url: string, timeout = 15000): Promise<string | null> {
  // Try twice: once with default https, once with http fallback for stubborn WAF sites.
  const variants = [url];
  if (url.startsWith('https://')) variants.push('http://' + url.slice('https://'.length));
  for (const v of variants) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(v, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const ctype = res.headers.get('content-type') || '';
      let enc = 'utf-8';
      const m = /charset=([^;]+)/i.exec(ctype);
      if (m) enc = m[1].trim().toLowerCase();
      if (enc === 'utf-8') {
        const text = buf.toString('utf8');
        const meta = /<meta[^>]+charset=["']?([^"'>\s/]+)/i.exec(text.slice(0, 4096));
        if (meta && meta[1].toLowerCase() !== 'utf-8') enc = meta[1].toLowerCase();
      }
      if (enc === 'gb2312' || enc === 'gbk' || enc === 'gb18030') {
        const { TextDecoder } = await import('node:util');
        return new TextDecoder('gb18030').decode(buf);
      }
      return buf.toString('utf8');
    } catch {
      // try next variant
    }
  }
  return null;
}

function extractLinks(html: string, base: string): { text: string; href: string }[] {
  const out: { text: string; href: string }[] = [];
  const re = /<a\s+[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const text = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (text.length > 40) continue;
    try {
      const abs = new URL(href, base).toString();
      out.push({ text, href: abs });
    } catch {
      // ignore malformed
    }
  }
  return out;
}

function pickBest(links: { text: string; href: string }[]): { text: string; href: string; score: number } | null {
  let best: { text: string; href: string; score: number } | null = null;
  for (const l of links) {
    const s = scoreLink(l.text, l.href);
    if (s <= 30) continue; // must be meaningfully policy-related
    if (!best || s > best.score) best = { ...l, score: s };
  }
  return best;
}

function looksLikeListPage(html: string): boolean {
  // Heuristic: list pages have multiple date patterns or "共 N 条"
  const dateHits = (html.match(/\d{4}-\d{2}-\d{2}/g) || []).length;
  if (dateHits >= 5) return true;
  if (/共\s*\d+\s*条/.test(html)) return true;
  if (/(政策文件|规范性文件|政府文件|政策法规)/.test(html) && dateHits >= 3) return true;
  return false;
}

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
};

async function probe(key: string, provUrl: string): Promise<ProbeResult> {
  const html = await fetchHtml(provUrl);
  if (!html) return { key, provUrl, reason: 'homepage-unreachable' };
  const links = extractLinks(html, provUrl);
  const best = pickBest(links);
  if (!best) return { key, provUrl, reason: 'no-candidate' };
  // Validate target
  const target = await fetchHtml(best.href);
  if (!target) return { key, provUrl, picked: { url: best.href, text: best.text, score: best.score, listLooks: false }, reason: 'target-unreachable' };
  const looks = looksLikeListPage(target);
  return { key, provUrl, picked: { url: best.href, text: best.text, score: best.score, listLooks: looks } };
}

async function runAll() {
  const tasks: { key: string; url: string }[] = [];
  for (const [key, entry] of Object.entries(DATA)) {
    tasks.push({ key, url: entry.url });
  }
  console.log(`Probing ${tasks.length} regions …`);
  const results: ProbeResult[] = [];
  const CONC = 12;
  let i = 0;
  async function worker(id: number) {
    while (i < tasks.length) {
      const my = i++;
      const t = tasks[my];
      const r = await probe(t.key, t.url);
      results.push(r);
      if ((my + 1) % 20 === 0) console.log(`  [${my + 1}/${tasks.length}]`);
      await delay(120 + Math.random() * 200);
    }
  }
  await Promise.all(Array.from({ length: CONC }, (_, i) => worker(i)));
  results.sort((a, b) => a.key.localeCompare(b.key));
  writeFileSync('scripts/website_management/policy-probe-results.json', JSON.stringify(results, null, 2), 'utf8');
  const confident = results.filter((r) => r.picked && r.picked.score >= 55 && r.picked.listLooks).length;
  const tentative = results.filter((r) => r.picked && r.picked.score >= 40 && r.picked.listLooks).length;
  console.log(`Done. ${tasks.length} probed. confident (score≥55+list): ${confident}. tentative (score≥40+list): ${tentative}. failed: ${results.filter((r) => r.reason).length}`);
}

runAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
