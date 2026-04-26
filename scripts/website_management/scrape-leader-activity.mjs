#!/usr/bin/env node
/**
 * Provincial leader-activity scraper.
 *
 * Reads picked provincial 要闻 URLs from news-probe-results.json, optionally
 * upgrades to a more leader-activity-focused sub-column when discoverable,
 * paginates 1..N pages, extracts (date, title, link) tuples, filters to 2026,
 * runs rule-based + (optional) LLM extraction for 领导/产业/活动类型, and
 * writes:
 *   data/website-news/leader_activity.xlsx
 *   data/website-news/leader_activity_log.xlsx
 *   data/website-news/leader_activity_log.md
 *
 * Env:
 *   LA_LIMIT       limit number of provinces (debug)
 *   LA_PAGES       max pages per province (default 4)
 *   LA_LLM=1       enable LLM fallback for ambiguous extraction
 *   LA_LLM_MAX=N   max items per LLM batch (default 20)
 *   ANTHROPIC_AUTH_TOKEN / ANTHROPIC_BASE_URL — credentials
 *   LA_LLM_MODEL   default 'claude-sonnet-4-6'
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { TextDecoder } from 'node:util';
import ExcelJS from 'exceljs';

const PROBE = 'scripts/website_management/news-probe-results.json';
const FLAT = 'scripts/website_management/gov-flat.json';
const OUT_DIR = 'data/website-news';
const OUT_XLSX = path.join(OUT_DIR, 'leader_activity.xlsx');
const OUT_LOG_XLSX = path.join(OUT_DIR, 'leader_activity_log.xlsx');
const OUT_LOG_MD = path.join(OUT_DIR, 'leader_activity_log.md');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// ---------------- HTTP ----------------
function fetchRaw(url, timeout = 15000) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(url); } catch { return resolve({ err: 'bad-url' }); }
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      host: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
      },
      rejectUnauthorized: false,
      timeout,
    }, (res) => {
      // Follow redirects manually
      if ([301, 302, 303, 307, 308].includes(res.statusCode || 0) && res.headers.location) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        resolve({ redirect: next });
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', (e) => resolve({ err: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ err: 'timeout' }); });
    req.end();
  });
}

async function fetchHtml(url) {
  let cur = url;
  for (let i = 0; i < 4; i++) {
    const r = await fetchRaw(cur);
    if (r.redirect) { cur = r.redirect; continue; }
    if (r.err) return { err: r.err, finalUrl: cur };
    if (!r.status || r.status >= 400) return { err: `http-${r.status}`, finalUrl: cur };
    const ct = (r.headers['content-type'] || '').toLowerCase();
    let html = r.body.toString('utf8');
    const head = html.slice(0, 2000);
    if (/charset=gb/i.test(ct) || /<meta[^>]+charset=['"]?(gb2312|gbk)/i.test(head)) {
      try { html = new TextDecoder('gbk').decode(r.body); } catch { /* */ }
    }
    return { html, finalUrl: cur };
  }
  return { err: 'too-many-redirects', finalUrl: cur };
}

// ---------------- Pagination URL generation ----------------
function makePageUrls(baseUrl, maxPages) {
  const u = new URL(baseUrl);
  const pathStr = u.pathname;
  const out = [baseUrl];
  // Pattern A: path ends with index.html / list.html → index_1.html, index_2.html ...
  const m = pathStr.match(/^(.*\/)([a-z]+)(\.s?html)$/i);
  if (m) {
    const [, dir, name, ext] = m;
    for (let i = 1; i < maxPages; i++) {
      out.push(`${u.protocol}//${u.host}${dir}${name}_${i}${ext}`);
    }
    return Array.from(new Set(out));
  }
  // Pattern B: directory URL → ?page=2
  if (pathStr.endsWith('/')) {
    for (let i = 2; i <= maxPages; i++) out.push(baseUrl + `?page=${i}`);
  }
  return Array.from(new Set(out));
}

// ---------------- Anchor + date extraction ----------------
const ANCHOR_RE = /<a\s[^>]*href=(["'])([^"'#]+?)\1[^>]*>([\s\S]*?)<\/a>/gi;

function stripTags(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function findNearbyDate(html, idx, datePositions) {
  // Strategy: prefer the closest date position in either direction within a wider
  // window (up to ±4000 chars). Many provincial portals have a hero carousel
  // separated from dated lists by several KB of HTML.
  if (datePositions && datePositions.length) {
    let best = null; let bestDist = 4000;
    for (const dp of datePositions) {
      const dist = Math.abs(dp.pos - idx);
      if (dist < bestDist) { bestDist = dist; best = dp; }
    }
    if (best) return best.value;
  }
  // Fallback to local scan
  const win = html.slice(Math.max(0, idx - 400), Math.min(html.length, idx + 2000));
  const re = /(20\d{2})[-年./](\d{1,2})[-月./](\d{1,2})/;
  const m = win.match(re);
  if (!m) return null;
  return `${m[1]}-${String(+m[2]).padStart(2, '0')}-${String(+m[3]).padStart(2, '0')}`;
}

function collectDatePositions(html) {
  const re = /(20\d{2})[-年./](\d{1,2})[-月./](\d{1,2})/g;
  const out = []; let m;
  while ((m = re.exec(html)) !== null) {
    const mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) continue;
    out.push({ pos: m.index, value: `${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  return out;
}

function dateFromUrl(url) {
  // Match patterns: t20260425_xxx, /2026/04-25/xxx, /202604/t20260425_, /2026-04-25/
  let m = url.match(/(20\d{2})[-/.]?(\d{2})[-/.]?(\d{2})(?:[_/.]|$)/);
  if (m) {
    const y = m[1]; const mo = +m[2]; const d = +m[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  m = url.match(/[\/_t](20\d{2})(\d{2})(\d{2})/);
  if (m) {
    const mo = +m[2], d = +m[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return `${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return null;
}

function cleanTitle(t) {
  // strip trailing date suffix like " 2026-04-24" or " 2026年4月24日"
  return t.replace(/\s*[\|｜]?\s*20\d{2}[-年./]\d{1,2}[-月./]\d{1,2}日?\s*$/g, '').trim();
}

function extractItems(html, baseUrl) {
  const items = [];
  const datePositions = collectDatePositions(html);
  let m;
  // Reset regex
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(html)) !== null) {
    const href = m[2];
    let text = decodeEntities(stripTags(m[3])).trim();
    text = cleanTitle(text);
    if (text.length < 8 || text.length > 80) continue;
    // skip pure non-Chinese or navigation labels
    if (!/[\u4e00-\u9fff]/.test(text)) continue;
    if (/^(更多|首页|上一页|下一页|尾页|返回|登录|注册)/.test(text)) continue;
    let abs;
    try { abs = new URL(href, baseUrl).toString(); } catch { continue; }
    // Article-like: ends with .html/.htm/.shtml + has a digit segment of >=5 digits +
    // not a navigation/index/zhuanti/zfxxgk page.
    const lower = abs.toLowerCase();
    const endsHtml = /\.s?html?(\?|$)/.test(lower);
    if (!endsHtml) continue;
    const hasDigit = /\d{5,}/.test(lower);
    if (!hasDigit) continue;
    const isNav = /(\/zfxxgk\b|\/zhuanti\b|\/zt\b|\/ztzl\b|\/wsdc\b|\/zwfw\b)/.test(lower);
    if (isNav) continue;
    const date = findNearbyDate(html, m.index, datePositions) || dateFromUrl(abs);
    items.push({ title: text, url: abs, date });
  }
  // Dedup by URL but prefer the occurrence that has a date
  const byUrl = new Map();
  for (const it of items) {
    const prev = byUrl.get(it.url);
    if (!prev) { byUrl.set(it.url, it); continue; }
    if (!prev.date && it.date) byUrl.set(it.url, it);
  }
  return [...byUrl.values()];
}

// ---------------- Rule-based field extraction ----------------
const ACTIVITY_KEYWORDS = [
  '调研', '考察', '会见', '会谈', '座谈', '主持', '出席', '视察', '慰问', '督导',
  '检查', '走访', '签约', '会议', '常务会', '常委会', '部署', '推进会', '动员会',
  '研讨', '调度', '听取', '汇报', '专题会议', '现场办公', '宣讲', '专项行动',
];
const LEADER_TITLES = [
  '书记', '省长', '市长', '县长', '区长', '主任', '副省长', '副市长', '副县长',
  '副区长', '部长', '副部长', '主任委员', '省委副书记', '副书记', '常务副省长',
  '常务副市长', '州长', '副州长', '盟长', '专员', '党组书记',
];
const INDUSTRY_KEYWORDS = {
  '新能源汽车': ['新能源汽车', '电动汽车', '智能网联汽车', '新能源车'],
  '锂电池储能': ['锂电池', '储能', '动力电池'],
  '光伏新能源': ['光伏', '风电', '新能源产业', '清洁能源', '氢能'],
  '集成电路': ['集成电路', '芯片', '半导体', '晶圆'],
  '电子信息': ['电子信息', '电子产业', '智能终端', '消费电子'],
  '生物医药': ['生物医药', '医药产业', '医疗器械', '创新药', '中医药'],
  '人工智能': ['人工智能', 'AI产业', '大模型', '算力'],
  '数字经济': ['数字经济', '大数据', '云计算', '区块链', '工业互联网'],
  '先进制造': ['先进制造', '高端装备', '装备制造', '智能制造'],
  '现代农业': ['现代农业', '乡村振兴', '种业', '农业产业'],
  '文旅产业': ['文旅', '旅游产业', '文化产业', '文旅融合'],
  '新材料': ['新材料', '稀土', '碳纤维'],
  '航空航天': ['航空', '航天', '低空经济', '商业航天'],
  '海洋经济': ['海洋经济', '海洋产业', '海工'],
  '绿色低碳': ['绿色低碳', '碳中和', '碳达峰', '减排'],
  '招商引资': ['招商引资', '招商推介', '项目签约', '合作签约', '战略合作框架协议'],
};

function extractActivityType(title) {
  for (const kw of ACTIVITY_KEYWORDS) if (title.includes(kw)) return kw;
  return '';
}

// Pattern A: name-then-role  e.g. 张三书记 / 李四省长
const LEADER_RE_A = new RegExp(`([\u4e00-\u9fff]{2,3})(${LEADER_TITLES.join('|')})`, 'g');
// Pattern B: role-then-name  e.g. 市长殷勇 / 省委书记王X
const LEADER_RE_B = new RegExp(`(${LEADER_TITLES.join('|')})([\u4e00-\u9fff]{2,3})(?=[主持出席调研会见座谈视察考察检查听取召开宣讲强调指出表示要求$\b])`, 'g');

function looksLikeName(s) {
  if (!/^[\u4e00-\u9fff]{2,3}$/.test(s)) return false;
  if (/^(省委|省政府|市委|市政府|县委|县政府|区委|区政府|党委|党组|国务|中央|国家|全国|全省|全市|全县|常委|主席|代表|党员|干部|领导|同志|书记|省长|市长|县长|工委|纪委|监委|人大|政协|妇联|工会|团委|发改|财政|教育|公安|司法|住建|交通|卫健|文旅|工信|人社|商务|审计|统计|应急|生态|自然|林草|水利|农业|海关|税务|电力|铁路|烟草|邮政|气象)/.test(s)) return false;
  return true;
}

function extractLeaders(title) {
  const out = []; const seen = new Set(); let m;
  LEADER_RE_A.lastIndex = 0;
  while ((m = LEADER_RE_A.exec(title)) !== null) {
    const name = m[1]; const role = m[2];
    if (!looksLikeName(name)) continue;
    const key = `${name}|${role}`;
    if (seen.has(key)) continue; seen.add(key);
    out.push(`${name}（${role}）`);
  }
  LEADER_RE_B.lastIndex = 0;
  while ((m = LEADER_RE_B.exec(title)) !== null) {
    const role = m[1]; const name = m[2];
    if (!looksLikeName(name)) continue;
    const key = `${name}|${role}`;
    if (seen.has(key)) continue; seen.add(key);
    out.push(`${name}（${role}）`);
  }
  return out.join('；');
}

function extractIndustries(title) {
  const hits = new Set();
  for (const [label, kws] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const kw of kws) if (title.includes(kw)) { hits.add(label); break; }
  }
  return Array.from(hits).join('、');
}

// Decide whether a title is a leader-activity item
function isLeaderActivity(title) {
  // Hard signal: has leader title token
  for (const t of LEADER_TITLES) if (title.includes(t)) return true;
  // Activity verb co-occurring with 主持/出席 etc.
  const strongVerbs = ['主持', '出席', '会见', '调研', '座谈', '视察', '考察', '督导', '会议'];
  for (const v of strongVerbs) if (title.includes(v)) return true;
  return false;
}

// Sub-column upgrade: scan homepage anchors for leader-activity sections
function findLeaderColumn(html, baseUrl) {
  const candidates = [];
  let m; ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(html)) !== null) {
    const text = decodeEntities(stripTags(m[3])).trim();
    if (text.length < 4 || text.length > 14) continue;
    let score = 0; let kind = '';
    if (/(领导活动|领导动态|党政领导)/.test(text)) { score = 100; kind = '领导活动'; }
    else if (/^(省委)?书记活动$/.test(text) || /^书记活动$/.test(text)) { score = 95; kind = '书记活动'; }
    else if (/^(省长|市长|主任)活动$/.test(text)) { score = 95; kind = '市长活动'; }
    else if (/(政务要闻|政务动态)$/.test(text)) { score = 70; kind = '政务要闻'; }
    if (!score) continue;
    let abs;
    try { abs = new URL(m[2], baseUrl).toString(); } catch { continue; }
    candidates.push({ text, url: abs, score, kind });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

// ---------------- LLM fallback (Anthropic) ----------------
async function llmExtractBatch(items) {
  const token = process.env.ANTHROPIC_AUTH_TOKEN || process.env.LLM_API_KEY;
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || process.env.LLM_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '');
  const model = process.env.LA_LLM_MODEL || process.env.LLM_MODEL || 'claude-sonnet-4-6';
  if (!token) return null;
  const prompt = `你是新闻字段抽取助手。下面给出若干中文新闻标题，请为每条抽取：
- leaders: 标题中明确出现的领导姓名+括号职务，多个用中文分号分隔（例如 "张三（市委书记）；李四（市长）"）；标题未点名领导则留空
- industry: 标题明确涉及的具体产业（如 新能源汽车 / 生物医药 / 数字经济 / 现代农业 / 文旅产业 等），多个用中文顿号分隔，无明确产业则留空
- activity_type: 主要活动类型（调研/会见/座谈/考察/会议/慰问/督导/签约/招商引资/项目推进/其他/非领导活动）
- is_leader_activity: 是否领导活动新闻 (true/false)

仅返回严格 JSON 数组（不要 markdown 包裹），按输入顺序，每项形如
{"leaders":"","industry":"","activity_type":"","is_leader_activity":false}

输入：
${items.map((it, i) => `${i + 1}. ${it.title}`).join('\n')}`;
  const body = JSON.stringify({
    model,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const u = new URL(baseUrl + '/v1/messages');
  return new Promise((resolve) => {
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      host: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token,
        'anthropic-version': '2023-06-01',
        Accept: 'application/json',
      }, timeout: 60000, rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const text = data?.content?.[0]?.text || '';
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (!jsonMatch) return resolve(null);
          resolve(JSON.parse(jsonMatch[0]));
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(body); req.end();
  });
}

// ---------------- Main ----------------
async function processProvince(probe) {
  const region = probe.key;
  const origUrl = probe.picked.url;
  const log = {
    region, origUrl, baseUrl: origUrl, baseKind: '综合要闻', usedOrig: '是',
    pagingRule: '', pages: [], totalNews: 0, leaderTotal: 0, top1Total: 0, top2Total: 0,
    startDate: '', endDate: '', success: '否', failReason: '', note: '',
  };

  // Step 1: probe homepage to look for better leader-activity column
  const homepage = await fetchHtml(origUrl);
  if (homepage.err) {
    log.failReason = `homepage-fetch-failed: ${homepage.err}`;
    return { items: [], log };
  }
  const upgrade = findLeaderColumn(homepage.html, homepage.finalUrl);
  let baseUrl = origUrl;
  let baseKind = '综合要闻';
  if (upgrade && upgrade.score >= 95) {
    baseUrl = upgrade.url; baseKind = upgrade.kind; log.usedOrig = '否'; log.note = `upgraded to ${upgrade.text}`;
  } else if (upgrade && upgrade.kind === '政务要闻' && /要闻$/.test(probe.picked.text)) {
    // skip — already 要闻
  }
  log.baseUrl = baseUrl; log.baseKind = baseKind;

  // Helper to scrape a base URL across paginated pages
  const scrapeBase = async (base, mp) => {
    const pageUrls = makePageUrls(base, mp);
    let acc = []; const pages = [];
    let firstErr = null;
    for (const pu of pageUrls) {
      const r = await fetchHtml(pu);
      if (r.err) {
        if (pu === base) { firstErr = r.err; break; }
        continue;
      }
      pages.push(pu);
      const items = extractItems(r.html, r.finalUrl);
      if (items.length === 0 && pu !== base) continue;
      for (const it of items) it.region = region;
      acc = acc.concat(items);
    }
    return { items: acc, pages, err: firstErr };
  };

  // Step 2: paginate
  const maxPages = Number(process.env.LA_PAGES || 4);
  let scraped = await scrapeBase(baseUrl, maxPages);
  // If upgrade yielded 0 items but original wasn't tried, fall back to original.
  if (baseUrl !== origUrl && scraped.items.length === 0) {
    log.note = (log.note ? log.note + '；' : '') + 'upgrade fallback';
    baseUrl = origUrl; baseKind = '综合要闻'; log.usedOrig = '是';
    log.baseUrl = baseUrl; log.baseKind = baseKind;
    scraped = await scrapeBase(baseUrl, maxPages);
  }
  log.pages = scraped.pages;
  const pageUrlsForRule = makePageUrls(baseUrl, maxPages);
  log.pagingRule = pageUrlsForRule.length > 1
    ? (pageUrlsForRule[1].includes('_1.') ? 'index_N.html' : pageUrlsForRule[1].includes('?page=') ? '?page=N' : '其他')
    : '单页';
  if (scraped.err && scraped.items.length === 0) {
    log.failReason = `base-fetch-failed: ${scraped.err}`;
    return { items: [], log };
  }
  let allItems = scraped.items;
  // Dedup
  const seen = new Set(); allItems = allItems.filter((it) => { if (seen.has(it.url)) return false; seen.add(it.url); return true; });
  log.totalNews = allItems.length;

  // Step 3: filter to 2026
  const items2026 = allItems.filter((it) => it.date && it.date.startsWith('2026'));

  // Step 4: rule extraction
  const enriched = items2026.map((it) => {
    const leaders = extractLeaders(it.title);
    const industry = extractIndustries(it.title);
    const activity = extractActivityType(it.title);
    const isLA = isLeaderActivity(it.title);
    return { ...it, leaders, industry, activity, isLA, needsLLM: !leaders && (industry || isLA) };
  });

  // Step 5: LLM batch for ambiguous + leader-detection (run on ALL 2026 items to disambiguate)
  if (process.env.LA_LLM === '1' && enriched.length) {
    const batchSize = Number(process.env.LA_LLM_MAX || 20);
    for (let i = 0; i < enriched.length; i += batchSize) {
      const batch = enriched.slice(i, i + batchSize);
      const res = await llmExtractBatch(batch);
      if (!res || !Array.isArray(res)) continue;
      for (let j = 0; j < batch.length && j < res.length; j++) {
        const r = res[j] || {};
        // Trust LLM output when present — supersedes noisy rule extraction.
        if (typeof r.leaders === 'string') batch[j].leaders = r.leaders.trim();
        if (typeof r.industry === 'string') batch[j].industry = r.industry.trim();
        if (typeof r.activity_type === 'string' && r.activity_type) batch[j].activity = r.activity_type.trim();
        if (typeof r.is_leader_activity === 'boolean') batch[j].isLA = r.is_leader_activity;
      }
    }
  }

  // Step 6: stats
  const leaderItems = enriched.filter((e) => e.isLA || e.leaders);
  log.leaderTotal = leaderItems.length;
  const top1 = ['书记', '省委书记', '党组书记'];
  const top2 = ['省长', '市长', '县长', '区长', '主任'];
  log.top1Total = leaderItems.filter((e) => top1.some((t) => e.leaders && e.leaders.includes(t))).length;
  log.top2Total = leaderItems.filter((e) => top2.some((t) => e.leaders && e.leaders.includes(t))).length;
  if (enriched.length) {
    const ds = enriched.map((e) => e.date).filter(Boolean).sort();
    log.startDate = ds[0] || ''; log.endDate = ds[ds.length - 1] || '';
  }
  log.success = enriched.length ? '是' : '否';
  if (!enriched.length && !log.failReason) log.failReason = 'no-2026-items';
  return { items: enriched, log };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const probe = JSON.parse(fs.readFileSync(PROBE, 'utf8'));
  const flat = JSON.parse(fs.readFileSync(FLAT, 'utf8'));
  const provKeys = new Set(flat.filter((r) => r.level === '省级').map((r) => r.key));
  const flatByKey = new Map(flat.map((r) => [r.key, r]));
  let provincial = probe.filter((r) => provKeys.has(r.key) && r.picked);
  // Stable order by gov-flat
  const order = new Map([...provKeys].map((k, i) => [k, i]));
  provincial.sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
  const limit = Number(process.env.LA_LIMIT || 0);
  if (limit) provincial = provincial.slice(0, limit);
  console.log(`[scrape] provinces: ${provincial.length}`);

  // Existing data for incremental
  let existingMap = new Map();
  if (fs.existsSync(OUT_XLSX)) {
    try {
      const wb0 = new ExcelJS.Workbook();
      await wb0.xlsx.readFile(OUT_XLSX);
      const ws0 = wb0.getWorksheet(1);
      ws0.eachRow((row, idx) => {
        if (idx === 1) return;
        const link = row.getCell(7).value || row.getCell(7).text || '';
        if (link) existingMap.set(String(link), row.values);
      });
      console.log(`[scrape] existing rows in xlsx: ${existingMap.size}`);
    } catch (e) { console.log('[scrape] existing xlsx unreadable, will overwrite'); }
  }

  const allItems = [];
  const allLogs = [];
  const mdLogs = [];
  for (const p of provincial) {
    process.stdout.write(`[scrape] ${p.key} ... `);
    try {
      const { items, log } = await processProvince(p);
      allItems.push(...items.map((it) => ({ ...it })));
      allLogs.push(log);
      console.log(`items=${items.length} log=${log.success}`);
    } catch (e) {
      console.log(`ERR ${e.message}`);
      allLogs.push({ region: p.key, origUrl: p.picked.url, baseUrl: '', baseKind: '', usedOrig: '', pagingRule: '', pages: [], totalNews: 0, leaderTotal: 0, top1Total: 0, top2Total: 0, startDate: '', endDate: '', success: '否', failReason: e.message, note: '' });
      mdLogs.push(`- ${p.key}: 抓取异常 ${e.message}`);
    }
  }

  // Append missing provinces (no provincial pick) to log as failures
  const seenLog = new Set(allLogs.map((l) => l.region));
  for (const k of provKeys) {
    if (seenLog.has(k)) continue;
    const fr = flatByKey.get(k);
    const probeRow = probe.find((r) => r.key === k);
    allLogs.push({
      region: k,
      origUrl: fr?.url || '',
      baseUrl: '', baseKind: '', usedOrig: '', pagingRule: '', pages: [],
      totalNews: 0, leaderTotal: 0, top1Total: 0, top2Total: 0,
      startDate: '', endDate: '',
      success: '否',
      failReason: probeRow?.reason || 'no-news-pick',
      note: '原始要闻栏目尚未识别，待补全',
    });
    mdLogs.push(`- ${k}: 无要闻栏目识别（${probeRow?.reason || 'unknown'}），跳过`);
  }

  // -------- Write main xlsx (incremental merge) --------
  const today = new Date().toISOString().slice(0, 10);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('leader_activity');
  ws.columns = [
    { header: '地区', key: 'region', width: 16 },
    { header: '时间', key: 'time', width: 12 },
    { header: '标题', key: 'title', width: 60 },
    { header: '领导', key: 'leaders', width: 30 },
    { header: '产业', key: 'industry', width: 18 },
    { header: '来源', key: 'source', width: 50 },
    { header: '链接', key: 'link', width: 60 },
    { header: '新闻发布日期', key: 'pubDate', width: 12 },
    { header: '活动发生日期', key: 'happenDate', width: 12 },
    { header: '活动类型', key: 'activity', width: 12 },
    { header: '抓取日期', key: 'scrapeDate', width: 12 },
    { header: '基准网址', key: 'baseUrl', width: 50 },
    { header: '是否人工复核', key: 'reviewed', width: 12 },
    { header: '备注', key: 'note', width: 24 },
  ];

  // Build map of new rows
  const baseUrlByRegion = new Map(allLogs.map((l) => [l.region, l.baseUrl]));
  const newByLink = new Map();
  for (const it of allItems) {
    // Spec: write ALL fetched 2026 items to the main xlsx (not just leader-tagged)
    newByLink.set(it.url, {
      region: it.region,
      time: it.date || '',
      title: it.title,
      leaders: it.leaders || '',
      industry: it.industry || '',
      source: baseUrlByRegion.get(it.region) || '',
      link: it.url,
      pubDate: it.date || '',
      happenDate: '',
      activity: it.activity || '',
      scrapeDate: today,
      baseUrl: baseUrlByRegion.get(it.region) || '',
      reviewed: '否',
      note: '',
    });
  }

  // Merge: keep existing rows that are NOT in newByLink (preserve historical), overwrite/add for current
  const finalRows = [];
  // First include existing-but-untouched
  if (existingMap.size) {
    for (const [link, vals] of existingMap.entries()) {
      if (newByLink.has(link)) continue;
      // vals is array (1-indexed). Reconstruct.
      finalRows.push({
        region: vals[1] || '', time: vals[2] || '', title: vals[3] || '', leaders: vals[4] || '',
        industry: vals[5] || '', source: vals[6] || '', link: vals[7] || '', pubDate: vals[8] || '',
        happenDate: vals[9] || '', activity: vals[10] || '', scrapeDate: vals[11] || '',
        baseUrl: vals[12] || '', reviewed: vals[13] || '', note: vals[14] || '',
      });
    }
  }
  for (const v of newByLink.values()) finalRows.push(v);
  // Sort by region then time
  finalRows.sort((a, b) => (a.region || '').localeCompare(b.region || '', 'zh') || (a.time || '').localeCompare(b.time || ''));
  for (const r of finalRows) ws.addRow(r);
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } };
  await wb.xlsx.writeFile(OUT_XLSX);
  console.log(`[scrape] wrote ${OUT_XLSX} rows=${finalRows.length}`);

  // -------- Write log xlsx --------
  const wb2 = new ExcelJS.Workbook();
  const ws2 = wb2.addWorksheet('log');
  ws2.columns = [
    { header: '地区', key: 'region', width: 18 },
    { header: '原始地区要闻网址', key: 'origUrl', width: 50 },
    { header: '最终抓取基准网址', key: 'baseUrl', width: 50 },
    { header: '基准网址类型', key: 'baseKind', width: 14 },
    { header: '是否使用原始网址', key: 'usedOrig', width: 14 },
    { header: '翻页规则', key: 'pagingRule', width: 16 },
    { header: '抓取新闻总数', key: 'totalNews', width: 12 },
    { header: '领导活动总数', key: 'leaderTotal', width: 12 },
    { header: '一把手活动总数', key: 'top1Total', width: 14 },
    { header: '二把手活动总数', key: 'top2Total', width: 14 },
    { header: '起始日期', key: 'startDate', width: 12 },
    { header: '终止日期', key: 'endDate', width: 12 },
    { header: '是否成功', key: 'success', width: 10 },
    { header: '失败原因', key: 'failReason', width: 30 },
    { header: '实际抓取网址', key: 'pagesText', width: 60 },
    { header: '备注', key: 'note', width: 30 },
  ];
  allLogs.sort((a, b) => (a.region || '').localeCompare(b.region || '', 'zh'));
  for (const l of allLogs) {
    ws2.addRow({ ...l, pagesText: (l.pages || []).join('；') });
  }
  ws2.getRow(1).font = { bold: true };
  ws2.views = [{ state: 'frozen', ySplit: 1 }];
  ws2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws2.columns.length } };
  await wb2.xlsx.writeFile(OUT_LOG_XLSX);
  console.log(`[scrape] wrote ${OUT_LOG_XLSX} rows=${allLogs.length}`);

  // -------- Write log md --------
  const okN = allLogs.filter((l) => l.success === '是').length;
  const failN = allLogs.length - okN;
  const totalLeader = allLogs.reduce((s, l) => s + (l.leaderTotal || 0), 0);
  const lines = [];
  lines.push(`# 领导活动抓取日志`);
  lines.push('');
  lines.push(`- 抓取时间：${new Date().toISOString()}`);
  lines.push(`- 处理地区：${allLogs.length}`);
  lines.push(`- 成功：${okN}；失败/跳过：${failN}`);
  lines.push(`- 累计领导活动条目：${totalLeader}`);
  lines.push(`- 主表：${OUT_XLSX}`);
  lines.push(`- 翻页日志：${OUT_LOG_XLSX}`);
  lines.push('');
  lines.push(`## 失败 / 跳过地区`);
  for (const l of allLogs.filter((x) => x.success !== '是')) {
    lines.push(`- **${l.region}**：${l.failReason || '未知'}${l.note ? `（${l.note}）` : ''}`);
  }
  lines.push('');
  lines.push(`## 基准网址被升级 / 切换的地区`);
  for (const l of allLogs.filter((x) => x.usedOrig === '否')) {
    lines.push(`- **${l.region}**：原 ${l.origUrl} → 升级 ${l.baseUrl}（${l.baseKind}）`);
  }
  lines.push('');
  lines.push(`## 备注`);
  lines.push(`- 字段抽取采用关键词规则 + （可选）Anthropic LLM 兜底；首批仅省级 31 条，含 7 条因要闻栏目尚未识别而跳过。`);
  lines.push(`- 缺失要闻栏目的省份需先在 \`probe-column\` 中补全后再抓取。`);
  if (mdLogs.length) {
    lines.push('');
    lines.push(`## 其他记录`);
    for (const m of mdLogs) lines.push(m);
  }
  fs.writeFileSync(OUT_LOG_MD, lines.join('\n'), 'utf8');
  console.log(`[scrape] wrote ${OUT_LOG_MD}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
