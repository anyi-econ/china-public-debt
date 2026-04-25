/**
 * Re-probe only the entries that previously failed homepage-unreachable.
 * Merge new results back into policy-probe-results.json (overwrite same key).
 */
import { readFileSync, writeFileSync } from 'node:fs';

type ProbeResult = {
  key: string;
  provUrl: string;
  picked?: { url: string; text: string; score: number; listLooks: boolean };
  reason?: string;
};

const path = 'scripts/website_management/policy-probe-results.json';
const all: ProbeResult[] = JSON.parse(readFileSync(path, 'utf8'));

const missing = JSON.parse(readFileSync('missing-policy.json', 'utf8')) as Record<string, { url: string }>;

// targets to re-probe: still-missing + (homepage-unreachable OR no-candidate OR target-unreachable)
const retry = all.filter(
  (r) =>
    r.key in missing &&
    (r.reason === 'homepage-unreachable' || r.reason === 'no-candidate' || r.reason === 'target-unreachable'),
);

console.log(`Re-probing ${retry.length} previously-failed regions …`);

// Reuse probe logic by spawning probe-policy.ts as library: simpler to copy minimal probe inline.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function fetchHtml(url: string, timeout = 18000): Promise<string | null> {
  const variants: string[] = [url];
  if (url.startsWith('https://')) variants.push('http://' + url.slice(8));
  for (const v of variants) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(v, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive',
        },
        redirect: 'follow',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const ctype = res.headers.get('content-type') || '';
      let enc = 'utf-8';
      const mm = /charset=([^;]+)/i.exec(ctype);
      if (mm) enc = mm[1].trim().toLowerCase();
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
      // try next
    }
  }
  return null;
}

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
const NEG_KEY: RegExp[] = [/登录|login|signin/i, /english/i, /废止|失效文件/, /办事指南/];

function scoreLink(text: string, href: string): number {
  let s = 0;
  const combined = `${text} ${href}`;
  for (const { re, score } of KEYWORDS) if (re.test(combined)) s = Math.max(s, score);
  for (const re of NEG_KEY) if (re.test(text)) s -= 20;
  if (/javascript:|mailto:|tel:/i.test(href)) return -1;
  if (href === '#' || href === '') return -1;
  return s;
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
      // ignore
    }
  }
  return out;
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

function looksLikeListPage(html: string): boolean {
  const dateHits = (html.match(/\d{4}-\d{2}-\d{2}/g) || []).length;
  if (dateHits >= 5) return true;
  if (/共\s*\d+\s*条/.test(html)) return true;
  if (/(政策文件|规范性文件|政府文件|政策法规)/.test(html) && dateHits >= 3) return true;
  return false;
}

async function probeOne(key: string, provUrl: string): Promise<ProbeResult> {
  const html = await fetchHtml(provUrl);
  if (!html) return { key, provUrl, reason: 'homepage-unreachable' };
  const links = extractLinks(html, provUrl);
  const best = pickBest(links);
  if (!best) return { key, provUrl, reason: 'no-candidate' };
  const target = await fetchHtml(best.href);
  const looks = target ? looksLikeListPage(target) : false;
  return { key, provUrl, picked: { url: best.href, text: best.text, score: best.score, listLooks: looks } };
}

async function run() {
  const newResults = new Map<string, ProbeResult>();
  const CONC = 8;
  let i = 0;
  await Promise.all(
    Array.from({ length: CONC }, async () => {
      while (i < retry.length) {
        const my = i++;
        const t = retry[my];
        const r = await probeOne(t.key, t.provUrl);
        newResults.set(t.key, r);
        if ((my + 1) % 20 === 0) console.log(`  [${my + 1}/${retry.length}]`);
      }
    }),
  );
  // merge
  let recovered = 0;
  for (let idx = 0; idx < all.length; idx++) {
    const k = all[idx].key;
    if (newResults.has(k)) {
      const newR = newResults.get(k)!;
      if (!newR.reason && newR.picked) recovered++;
      all[idx] = newR;
    }
  }
  writeFileSync(path, JSON.stringify(all, null, 2), 'utf8');
  console.log(`Done. recovered candidates: ${recovered} / ${retry.length}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
