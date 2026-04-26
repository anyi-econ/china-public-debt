#!/usr/bin/env node
/**
 * Generic column probe — finds news / industrial columns from each gov portal.
 *
 * Usage:
 *   npx tsx scripts/website_management/probe-column.ts news
 *   npx tsx scripts/website_management/probe-column.ts industrial
 *
 * Reads:  scripts/website_management/gov-flat.json
 * Writes: scripts/website_management/{cat}-probe-results.json
 *
 * Env:
 *   COL_LIMIT   limit how many to scan (debug)
 *   COL_CONC    concurrency (default 12)
 *   COL_RETRY   re-probe entries cached as fetch-failure (default 0 = no)
 */
import fs from 'node:fs';

type Cat = 'news' | 'industrial';
const cat = (process.argv[2] || '').trim() as Cat;
if (cat !== 'news' && cat !== 'industrial') {
  console.error('usage: probe-column.ts <news|industrial>');
  process.exit(2);
}

type GovRow = { key: string; url: string; level: '省级' | '地级' | '县区' };
type Candidate = { url: string; text: string; score: number; source: string; tier?: 'A' | 'B' | 'C' | 'D'; validated?: boolean };
type Result = { key: string; level: string; govUrl: string; picked?: Candidate; reason?: string };

const flat: GovRow[] = JSON.parse(
  fs.readFileSync('scripts/website_management/gov-flat.json', 'utf8'),
);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

// ─────────────────────────── Per-category config ───────────────────────────

type Config = {
  TIER_A: RegExp;
  TIER_B: RegExp;
  TIER_C: RegExp;
  REJECT_TEXT: RegExp;
  REJECT_PATH: RegExp;
  CANONICAL_PATH: RegExp;
  ARTICLE_PATH: RegExp;
  CONTENT_REQUIRE: RegExp;   // page body must contain
  CONTENT_REJECT: RegExp;    // page body must not contain (when require not strong)
  CONSTRUCT_PATHS: Array<{ path: string; text: string; tier: 'A' | 'B' | 'C' | 'D' }>;
};

const NEWS: Config = {
  // Tier A also matches geographic-prefix patterns:
  //   ^{2-3 char}+(要闻|新闻|动态|资讯)$  —— 丰台要闻 / 河北新闻 / 衡阳动态 / 腾冲资讯
  //   ^今日{2-3 char}$                     —— 今日鞍山 / 今日楚雄 / 今日汶川
  // REJECT_TEXT below filters out 中央/省委/部门/区县/乡镇/转载/24节气 等.
  TIER_A: /本地要闻|本市要闻|本县要闻|本区要闻|要闻速递|今日要闻|政务要闻|时政要闻|头版头条|^.{2,3}(要闻|新闻|动态|资讯)$|^今日.{2,3}$/,
  TIER_B: /政务动态|工作动态|政府要闻|综合要闻|综合新闻|政务新闻|政府新闻/,
  TIER_C: /新闻中心|新闻动态|要闻|新闻/,
  REJECT_TEXT: /部门动态|部门信息|单位动态|上级要闻|中央要闻|国务院要闻|省委要闻|省政府要闻|全国要闻|国内要闻|国内新闻|国际要闻|国际新闻|国内资讯|国际资讯|域外新闻|域外要闻|外地新闻|外埠新闻|双语新闻|英文新闻|要闻转载|新闻转载|区县动态|县区动态|县市区动态|区县新闻|区县要闻|招商资讯|省内资讯|州内资讯|县内资讯|系统动态|网站动态|公告动态|今日(立春|雨水|惊蛰|春分|清明|谷雨|立夏|小满|芒种|夏至|小暑|大暑|立秋|处暑|白露|秋分|寒露|霜降|立冬|小雪|大雪|冬至|小寒|大寒|头条|关注|聚焦|看点|话题|视点)|通知公告|公示公告|政府公告|媒体看|媒体聚焦|视频新闻|图说|影像|专题|乡镇要闻|乡镇动态|乡镇新闻|镇街动态|街道动态|图片新闻|宣传片|访谈|直播/,
  REJECT_PATH: /tzgg|gsgg|tongzhi|gonggao|videos?|tupian|zhuanti|spxw|fangtan|zhibo|zhxx|bmdt|bmxx|jcdt|xzjd|xjyw|szyw_/i,
  CANONICAL_PATH: /\/(yw|bdyw|jryw|szyw|swyw|sxyw|qyyw|xqyw|zwdt|gzdt|zfdt|zfyw|zwyw|news[a-z]*|xwzx[\/\?])/i,
  // 单篇文章 URL 拒绝（v1 实测后加固）：
  //   /2026-04-25/、/2026/04/、/202604/、/art/2026/、/<32hex>.html、/c_123.html、/t_123.html
  //   /202604/t20260425_1234.htm、/content/article/123.html、/content/post_123.html
  //   /tzgg/123456.html 等单篇通告数字 id
  ARTICLE_PATH: /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\/|\/\d{4}\d{2}\/t\d{8}_\d+\.s?html?$|\/content\/(article|post)[_\/]?\d+\.s?html?$|\/(tzgg|tongzhi|gonggao)\/\d{6,}\.s?html?$|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$|\/[ct]_\d+\.s?html?$/i,
  CONTENT_REQUIRE: /要闻|动态|新闻|今日|政务/,
  CONTENT_REJECT: /页面不存在|404|not found|访问出错|无法访问|维护中/,
  CONSTRUCT_PATHS: [
    { path: '/yw/', text: '要闻', tier: 'A' },
    { path: '/bdyw/', text: '本地要闻', tier: 'A' },
    { path: '/jryw/', text: '今日要闻', tier: 'A' },
    { path: '/zwdt/', text: '政务动态', tier: 'B' },
    { path: '/gzdt/', text: '工作动态', tier: 'B' },
    { path: '/zfdt/', text: '政府动态', tier: 'B' },
    { path: '/zwyw/', text: '政务要闻', tier: 'A' },
    { path: '/news/', text: '新闻', tier: 'C' },
    { path: '/xwzx/', text: '新闻中心', tier: 'C' },
    { path: '/xwzx/bdyw/', text: '新闻中心-本地要闻', tier: 'A' },
    { path: '/xwzx/szyw/', text: '新闻中心-市政要闻', tier: 'A' },
    { path: '/xwzx/zwyw/', text: '新闻中心-政务要闻', tier: 'A' },
  ],
};

const INDUSTRIAL: Config = {
  TIER_A: /惠企|涉企|为企服务|亲清(服务|在线|互动)|政策(兑现|直达|一键|计算器|超市)|助企纾困|稳企(帮扶|惠企)|援企稳岗|惠企通|政企互动/,
  TIER_B: /营商环境|优化营商|双招双引/,
  TIER_C: /产业(政策|发展|布局|集群)|招商引资|招商引智|工业经济/,
  REJECT_TEXT: /工商联|行业协会|招聘信息|就业创业|党建|纪检监察|人才引进|人才公寓|12345|留言板|信访|举报|信用|失信/,
  REJECT_PATH: /jb12345|dangjian|jjjc|rcyj|rcgy|liuyan|xinfang|jubao|xinyong|sx[ig]/i,
  CANONICAL_PATH: /\/(hqzc|hqfw|hqtd|hqt|zcdx|zcdd|qyfw|wqfw|cyzc|cyfz|zsyz|yshj|ysjs|wqfw)/i,
  // 单篇文章 URL 拒绝（v1 实测 industrial 中 99 例单篇误判后加固）
  ARTICLE_PATH: /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\/|\/\d{4}\d{2}\/t\d{8}_\d+\.s?html?$|\/content\/(article|post)[_\/]?\d+\.s?html?$|\/(tzgg|tongzhi|gonggao)\/\d{6,}\.s?html?$|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$/i,
  CONTENT_REQUIRE: /惠企|涉企|企业|营商|产业|政策/,
  CONTENT_REJECT: /页面不存在|404|not found|访问出错|无法访问|维护中/,
  CONSTRUCT_PATHS: [
    { path: '/hqzc/', text: '惠企政策', tier: 'A' },
    { path: '/hqfw/', text: '惠企服务', tier: 'A' },
    { path: '/zcdx/', text: '政策直达', tier: 'A' },
    { path: '/zcdd/', text: '政策兑现', tier: 'A' },
    { path: '/qyfw/', text: '企业服务', tier: 'A' },
    { path: '/yshj/', text: '营商环境', tier: 'B' },
    { path: '/ysjs/', text: '营商建设', tier: 'B' },
    { path: '/cyzc/', text: '产业政策', tier: 'C' },
    { path: '/cyfz/', text: '产业发展', tier: 'C' },
    { path: '/zsyz/', text: '招商引资', tier: 'C' },
    { path: '/zwgk/hqzc/', text: '惠企政策', tier: 'A' },
    { path: '/zwgk/cyzc/', text: '产业政策', tier: 'C' },
    { path: '/ztzl/yshj/', text: '专题-营商环境', tier: 'B' },
    { path: '/ztzl/hqzc/', text: '专题-惠企政策', tier: 'A' },
  ],
};

const CFG: Config = cat === 'news' ? NEWS : INDUSTRIAL;

// ─────────────────────────── helpers ───────────────────────────

function hostOf(u: string): string { try { return new URL(u).host.toLowerCase(); } catch { return ''; } }
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
    const buf = await res.arrayBuffer();
    let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    // Detect gbk/gb2312 declared encoding and re-decode
    const enc = (text.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i) || ct.match(/charset=([\w-]+)/i) || [])[1];
    if (enc && /gb/i.test(enc)) {
      try { text = new TextDecoder('gbk').decode(buf); } catch { /* keep utf-8 */ }
    }
    if (text.length < 200) return null;
    return text;
  } catch { return null; } finally { clearTimeout(timer); }
}
function stripTags(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ').trim();
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
function extractTitle(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) : '';
}

function scoreCandidate(text: string, url: string): { score: number; tier?: 'A' | 'B' | 'C' | 'D' } {
  let path = '';
  try { path = new URL(url).pathname.toLowerCase(); } catch { return { score: -100 }; }
  // hard reject
  if (CFG.ARTICLE_PATH.test(path)) return { score: -50 };
  if (CFG.REJECT_TEXT.test(text)) return { score: -50 };
  if (CFG.REJECT_PATH.test(path)) return { score: -50 };
  if (/www\.gov\.cn|english|login|javascript|^mailto/i.test(url)) return { score: -50 };
  let s = 0;
  let tier: 'A' | 'B' | 'C' | 'D' | undefined;
  // Order: explicit Tier B / Tier C phrases beat loose Tier-A geo-prefix.
  // The loose Tier-A geo-prefix regex (^.{2,3}(要闻|新闻|动态|资讯)$) would otherwise mis-tag
  // generic phrases like "政务动态" / "工作动态" / "新闻动态" as Tier A.
  if (CFG.TIER_B.test(text)) { s = Math.max(s, 75); tier = 'B'; }
  else if (CFG.TIER_A.test(text)) { s = Math.max(s, 90); tier = 'A'; }
  else if (CFG.TIER_C.test(text)) { s = Math.max(s, 55); tier = 'C'; }
  if (CFG.CANONICAL_PATH.test(path)) s += 10;
  // root index page penalty
  try {
    const u = new URL(url);
    if (u.pathname === '/' || u.pathname === '/index.html' || u.pathname === '/index.htm') s -= 10;
  } catch { /* */ }
  return { score: s, tier };
}

function constructed(base: string): Candidate[] {
  const out: Candidate[] = [];
  for (const p of CFG.CONSTRUCT_PATHS) {
    const u = normalizeUrl(base, p.path);
    if (!u) continue;
    const score = p.tier === 'A' ? 70 : p.tier === 'B' ? 60 : 50;
    out.push({ url: u, text: p.text, score, source: 'constructed', tier: p.tier });
  }
  return out;
}

async function validate(c: Candidate): Promise<boolean> {
  const html = await fetchHtml(c.url, 9000);
  if (!html) return false;
  const title = extractTitle(html);
  const body = stripTags(html).slice(0, 6000);
  if (CFG.CONTENT_REJECT.test(body)) return false;
  // homepage redirect detection — body too generic
  if (/欢迎访问|首页|网站首页/.test(title) && !CFG.TIER_A.test(title) && !CFG.TIER_B.test(title)) {
    // fall through to content check
  }
  return CFG.CONTENT_REQUIRE.test(body);
}

async function probeOne(row: GovRow): Promise<Result> {
  const html = await fetchHtml(row.url);
  const cands: Candidate[] = [];
  if (html) {
    for (const a of extractAnchors(row.url, html)) {
      if (!sameBase(a.url, row.url)) continue;
      const { score, tier } = scoreCandidate(a.text, a.url);
      if (score >= 55) cands.push({ ...a, score, source: 'anchor', tier });
    }
  }
  for (const c of constructed(row.url)) if (sameBase(c.url, row.url)) cands.push(c);

  // dedupe by url, prefer higher score / tier-A
  const uniq = new Map<string, Candidate>();
  for (const c of cands.sort((a, b) => b.score - a.score)) {
    if (!uniq.has(c.url)) uniq.set(c.url, c);
  }
  const sorted = [...uniq.values()].sort((a, b) => b.score - a.score);

  // Phase 1: try direct candidates by score order (existing behaviour)
  let firstTierC: Candidate | null = null;
  for (const c of sorted.slice(0, 8)) {
    if (await validate(c)) {
      c.validated = true;
      // For Tier C aggregators, defer the pick until phase 2 attempts a Tier A/B drill-down
      if (c.tier === 'C' && !firstTierC) {
        firstTierC = c;
        continue;
      }
      // Tier A/B validated direct — accept immediately
      if (c.tier === 'A' || c.tier === 'B') {
        return { key: row.key, level: row.level, govUrl: row.url, picked: c };
      }
      // Tier D / unknown — accept too
      if (!c.tier || c.tier === 'D') {
        return { key: row.key, level: row.level, govUrl: row.url, picked: c };
      }
    }
  }

  // Phase 2: Tier C drill-down.
  // The homepage only yielded an aggregator (新闻中心 / 新闻动态 / 产业发展). Fetch it once and
  // re-probe one level deep. Accept any validated A/B/C with score ≥ 55, but prefer
  // A/B by sort. Exclude self-loops back to the aggregator.
  if (firstTierC) {
    const aggHtml = await fetchHtml(firstTierC.url, 9000);
    if (aggHtml) {
      const subCands: Candidate[] = [];
      for (const a of extractAnchors(firstTierC.url, aggHtml)) {
        if (!sameBase(a.url, row.url)) continue;
        if (a.url === firstTierC.url) continue; // self-loop
        const { score, tier } = scoreCandidate(a.text, a.url);
        if (score >= 55 && (tier === 'A' || tier === 'B' || tier === 'C')) {
          subCands.push({ ...a, score, source: 'anchor-d1', tier });
        }
      }
      // Prefer Tier A > B > C, then by score
      const tierRank = { A: 3, B: 2, C: 1, D: 0 } as const;
      const sub = [...new Map(
        subCands
          .sort((a, b) => (tierRank[(b.tier || 'D')] - tierRank[(a.tier || 'D')]) || (b.score - a.score))
          .map((c) => [c.url, c]),
      ).values()];
      for (const c of sub.slice(0, 5)) {
        // Only escalate if at least as strong as the aggregator (Tier A/B), or Tier C with stronger geo signal
        if ((c.tier === 'A' || c.tier === 'B') && (await validate(c))) {
          c.validated = true;
          return { key: row.key, level: row.level, govUrl: row.url, picked: c };
        }
      }
    }
    // No deeper Tier A/B found — fall back to the aggregator pick
    return { key: row.key, level: row.level, govUrl: row.url, picked: firstTierC };
  }
  return { key: row.key, level: row.level, govUrl: row.url, reason: html ? 'no-route-found' : 'homepage-unreachable' };
}

// ─────────────────────────── main loop (with progress + cache resume) ───

async function main() {
  const limit = Number(process.env.COL_LIMIT || 0);
  const list = limit ? flat.slice(0, limit) : flat;
  const targetSet = new Set(list.map((r) => r.key));
  console.log(`[${cat}] targets: ${list.length}`);
  const OUT = `scripts/website_management/${cat}-probe-results.json`;
  const retry = process.env.COL_RETRY === '1';
  const retryNoRoute = process.env.COL_RETRY_NOROUTE === '1';
  const retryTierC = process.env.COL_RETRY_TIERC === '1';
  const existingRaw: Result[] = fs.existsSync(OUT)
    ? (JSON.parse(fs.readFileSync(OUT, 'utf8')) as Result[]).filter((r) => targetSet.has(r.key))
    : [];
  const shouldRetry = (r: Result) =>
    (retry && /homepage-unreachable|error:/.test(r.reason || '')) ||
    (retryNoRoute && r.reason === 'no-route-found') ||
    (retryTierC && r.picked?.tier === 'C');
  const existing = existingRaw.filter((r) => !shouldRetry(r));
  const done = new Set(existing.map((r) => r.key));
  console.log(`[${cat}] cached: ${done.size}; retry-failures: ${existingRaw.length - existing.length}; remaining: ${list.length - done.size}`);
  const results: Result[] = [...existing];
  const start = Date.now();
  const total = list.length;

  function fmt(ms: number) {
    if (!Number.isFinite(ms) || ms < 0) return '--:--';
    const sec = Math.round(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  function render(force = false) {
    const completed = Math.min(results.length, total);
    const picked = results.filter((r) => r.picked).length;
    const pct = total ? completed / total : 1;
    const w = 30;
    const f = Math.round(pct * w);
    const bar = `${'█'.repeat(f)}${'░'.repeat(w - f)}`;
    const elapsed = Date.now() - start;
    const proc = Math.max(0, completed - done.size);
    const rate = proc > 0 ? proc / (elapsed / 1000) : 0;
    const remaining = Math.max(0, total - completed);
    const eta = rate > 0 ? (remaining / rate) * 1000 : Infinity;
    const line = `[${cat}] [${bar}] ${(pct * 100).toFixed(1).padStart(5)}% ${completed}/${total} | picked ${picked} | ${rate.toFixed(2)}/s | ETA ${fmt(eta)}`;
    if (process.stdout.isTTY) process.stdout.write(`\r${line}${force ? '\n' : ''}`);
    else if (force || completed % 50 === 0) console.log(line);
  }
  function save() {
    results.sort((a, b) => a.key.localeCompare(b.key, 'zh-Hans-CN'));
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  }
  process.on('SIGINT', () => { save(); render(true); console.log('saved on SIGINT'); process.exit(130); });

  let i = 0;
  const CONC = Number(process.env.COL_CONC || 12);
  let saved = 0;
  render();
  async function worker() {
    while (i < list.length) {
      const idx = i++;
      const row = list[idx];
      if (done.has(row.key)) continue;
      try {
        results.push(await probeOne(row));
      } catch (e) {
        results.push({ key: row.key, level: row.level, govUrl: row.url, reason: `error:${(e as Error).message}` });
      }
      saved++;
      if (saved % 80 === 0) save();
      render();
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  save();
  render(true);
  const picked = results.filter((r) => r.picked).length;
  console.log(`\n[${cat}] done. picked: ${picked}/${results.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
