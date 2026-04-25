#!/usr/bin/env node
/**
 * v8.2 — Playwright SPA reprobe.
 *
 * Targets: entries that are still missing AND in probe-results have either
 * (a) reason in {homepage-unreachable, no-candidate, target-unreachable}, OR
 * (b) picked but listLooks=false (likely SPA list page).
 *
 * For each target:
 *  - Open with chromium (headless), full UA + viewport.
 *  - Wait for network idle.
 *  - Snapshot rendered HTML; extract <a> links the same way; pick best by score.
 *  - If we got a candidate, navigate to it; wait for network idle; check listLooks.
 *
 * Concurrency 4 (browser is heavy). Saves results into
 * scripts/website_management/policy-probe-results-pw.json.
 */
import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, type Browser, type Page } from 'playwright';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
  source?: 'pw';
};

const probeAll: ProbeResult[] = Object.values(
  JSON.parse(fs.readFileSync('scripts/website_management/policy-probe-results.json', 'utf8')),
);
const missing: Record<string, { url: string }> = JSON.parse(
  fs.readFileSync('missing-policy.json', 'utf8'),
);
const stillMissing = new Set(Object.keys(missing));

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
const NEG_KEY = [
  /登录|login|signin/i,
  /english/i,
  /废止|失效文件/,
  /一件事|办事指南|主题服务|我要办/,
  /新闻|公告|公示/,
  /首页|返回|回到/,
];
function scoreLink(text: string, href: string): number {
  let s = 0;
  const c = `${text} ${href}`;
  for (const { re, score } of KEYWORDS) if (re.test(c)) s = Math.max(s, score);
  for (const re of NEG_KEY) if (re.test(text)) s -= 20;
  if (/javascript:|mailto:|tel:/i.test(href)) return -1;
  if (href === '#' || href === '') return -1;
  return s;
}
function looksLikeListPage(html: string): boolean {
  const d = (html.match(/\d{4}-\d{2}-\d{2}/g) || []).length;
  if (d >= 5) return true;
  if (/共\s*\d+\s*条/.test(html)) return true;
  if (/(政策文件|规范性文件|政府文件|政策法规)/.test(html) && d >= 3) return true;
  return false;
}

async function pageGet(page: Page, url: string): Promise<string | null> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Soft-wait for SPA hydration; ignore networkidle timeout.
    await Promise.race([
      page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
      delay(5500),
    ]);
    return await page.content();
  } catch {
    return null;
  }
}

async function extractLinks(page: Page): Promise<{ text: string; href: string }[]> {
  return page.evaluate(() => {
    const out: { text: string; href: string }[] = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
      const href = (a as HTMLAnchorElement).href;
      if (!text || text.length > 40 || !href) return;
      out.push({ text, href });
    });
    return out;
  });
}

function pickBest(links: { text: string; href: string }[]) {
  let best: { text: string; href: string; score: number } | null = null;
  for (const l of links) {
    const s = scoreLink(l.text, l.href);
    if (s <= 30) continue;
    if (!best || s > best.score) best = { ...l, score: s };
  }
  return best;
}

async function probeOne(browser: Browser, key: string, provUrl: string): Promise<ProbeResult> {
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'zh-CN',
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });
  const page = await ctx.newPage();
  try {
    const html = await pageGet(page, provUrl);
    if (!html) return { key, provUrl, reason: 'pw-homepage-unreachable', source: 'pw' };
    const links = await extractLinks(page);
    const best = pickBest(links);
    if (!best) return { key, provUrl, reason: 'pw-no-candidate', source: 'pw' };
    const tHtml = await pageGet(page, best.href);
    if (!tHtml)
      return {
        key,
        provUrl,
        picked: { url: best.href, text: best.text, score: best.score, listLooks: false },
        reason: 'pw-target-unreachable',
        source: 'pw',
      };
    const looks = looksLikeListPage(tHtml);
    return {
      key,
      provUrl,
      picked: { url: best.href, text: best.text, score: best.score, listLooks: looks },
      source: 'pw',
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function main() {
  const targets: { key: string; url: string }[] = [];
  for (const r of probeAll) {
    if (!stillMissing.has(r.key)) continue;
    const isFail =
      r.reason === 'homepage-unreachable' ||
      r.reason === 'no-candidate' ||
      r.reason === 'target-unreachable';
    const looksFail = r.picked && !r.picked.listLooks;
    if (!isFail && !looksFail) continue;
    targets.push({ key: r.key, url: r.provUrl });
  }
  console.log(`pw probe targets: ${targets.length}`);

  const limit = Number(process.env.PW_LIMIT || 0);
  const list = limit ? targets.slice(0, limit) : targets;

  // Resume: load any already-completed results (keyed by .key) and skip them.
  const OUT = 'scripts/website_management/policy-probe-results-pw.json';
  const existing: ProbeResult[] = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : [];
  const done = new Set(existing.map((r) => r.key));
  console.log(`already done: ${done.size}; remaining: ${list.filter((t) => !done.has(t.key)).length}`);

  const browser = await chromium.launch({ headless: true });
  const results: ProbeResult[] = [...existing];
  const CONC = 4;
  let i = 0;
  let saveCounter = 0;
  function saveNow() {
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  }
  async function worker() {
    while (i < list.length) {
      const my = i++;
      const t = list[my];
      if (done.has(t.key)) continue;
      try {
        const r = await Promise.race([
          probeOne(browser, t.key, t.url),
          delay(45000).then(() => ({ key: t.key, provUrl: t.url, reason: 'pw-timeout', source: 'pw' as const })),
        ]);
        results.push(r);
      } catch (e) {
        results.push({ key: t.key, provUrl: t.url, reason: 'pw-error:' + (e as Error).message, source: 'pw' });
      }
      saveCounter++;
      if (saveCounter % 20 === 0) {
        saveNow();
        console.log(`  [${my + 1}/${list.length}] saved (${results.length} total)`);
      }
    }
  }
  process.on('SIGINT', () => {
    saveNow();
    console.log('saved on SIGINT');
    process.exit(130);
  });
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  await browser.close();
  saveNow();
  const ok = results.filter((r) => r.picked).length;
  const list_ok = results.filter((r) => r.picked && r.picked.listLooks).length;
  console.log(`Done. picked: ${ok} / ${results.length}, listLooks=true: ${list_ok}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
