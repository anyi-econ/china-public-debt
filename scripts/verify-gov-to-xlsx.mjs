/**
 * 批量核查 gov-website-links.ts 中的政府官网网址，结果直接写入 XLSX
 *
 * 用法:
 *   node scripts/verify-gov-to-xlsx.mjs [--concurrency=20] [--timeout=30000]
 *   node scripts/verify-gov-to-xlsx.mjs --retry    # 跳过已成功/空，只重验失败条目
 *
 * 输出: data/gov-website-links.xlsx
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as cheerio from 'cheerio';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (w.name === 'Warning' && w.message.includes('NODE_TLS_REJECT_UNAUTHORIZED')) return;
  console.warn(w);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'gov-website-links.ts');
const XLSX_FILE = path.join(ROOT, 'data', 'gov-website-links.xlsx');
const JSON_TMP = path.join(ROOT, 'data', '_gov-verify-results.json');

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v || 'true']; })
);
const CONCURRENCY = parseInt(args.concurrency || '20', 10);
const TIMEOUT = parseInt(args.timeout || '30000', 10);
const RETRY_MODE = args['retry'] !== undefined || args['retry-only'] !== undefined;
const NO_PLAYWRIGHT = args['no-pw'] !== undefined;

// ════════════════════════════════════════════
// 1. Parse TS file
// ════════════════════════════════════════════
function parseTS(content) {
  const entries = [];
  const lines = content.split('\n');
  const stack = []; // parent names
  let curName = null;

  for (const line of lines) {
    const nm = line.match(/name:\s*"([^"]*)"/);
    if (nm) curName = nm[1];

    const um = line.match(/url:\s*"([^"]*)"/);
    if (um) {
      const url = um[1];
      const level = stack.length;
      const municipalities = ['北京市', '天津市', '上海市', '重庆市'];
      let adminLevel = level === 0 ? '省级' : level === 1 ? '地级' : '县级';
      if (level === 1 && stack[0] && municipalities.includes(stack[0].name))
        adminLevel = '县级';

      // 新疆兵团本级 and 大兴安岭4个林区 classified as "其他"
      const OTHER_NAMES = ['新疆生产建设兵团', '加格达奇区', '松岭区', '新林区', '呼中区'];
      if (OTHER_NAMES.includes(curName))
        adminLevel = '其他';

      entries.push({
        adminLevel,
        name: curName,
        url,
        province: stack[0]?.name || curName,
        city: level >= 1 ? (level === 1 ? curName : stack[1]?.name || '') : '',
      });
    }

    if (line.includes('children:')) stack.push({ name: curName });
    if (/^\s*\]\s*,?\s*$/.test(line) && stack.length > 0) stack.pop();
  }
  return entries;
}

// ════════════════════════════════════════════
// 2. HTTP request with http/https module (works better for .gov.cn SSL)
// ════════════════════════════════════════════
function decodeBody(buffer, contentType) {
  const charsetMatch = contentType?.match(/charset=([^\s;]+)/i);
  let charset = charsetMatch ? charsetMatch[1].toLowerCase().replace(/['"]/g, '') : '';
  if (!charset) {
    const preview = buffer.toString('ascii', 0, Math.min(2000, buffer.length));
    const metaCharset = preview.match(/charset=["']?([^"'\s;>]+)/i);
    if (metaCharset) charset = metaCharset[1].toLowerCase();
  }
  if (['gb2312','gbk','gb18030'].includes(charset)) {
    try { return new TextDecoder('gbk').decode(buffer); } catch {}
    try { return new TextDecoder('gb18030').decode(buffer); } catch {}
  }
  return buffer.toString('utf8');
}

function httpGet(url, timeoutMs = TIMEOUT, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const hardTimer = setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('HARD_TIMEOUT')); }
    }, timeoutMs + 5000);

    const doRequest = (currentUrl, redirectCount) => {
      if (settled) return;
      if (redirectCount > maxRedirects) {
        if (!settled) { settled = true; clearTimeout(hardTimer); reject(new Error('Too many redirects')); }
        return;
      }
      let parsedUrl;
      try { parsedUrl = new URL(currentUrl); } catch (e) {
        if (!settled) { settled = true; clearTimeout(hardTimer); reject(e); }
        return;
      }
      const mod = parsedUrl.protocol === 'https:' ? https : http;
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET', timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'identity', 'Connection': 'close',
        },
        rejectUnauthorized: false,
      };
      const req = mod.request(options, (res) => {
        if (settled) return;
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, currentUrl).href;
          res.resume();
          doRequest(redirectUrl, redirectCount + 1);
          return;
        }
        const chunks = []; let totalSize = 0;
        res.on('data', (chunk) => {
          totalSize += chunk.length;
          if (totalSize <= 300000) chunks.push(chunk);
        });
        res.on('end', () => {
          if (settled) return;
          settled = true; clearTimeout(hardTimer);
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || '';
          resolve({
            statusCode: res.statusCode, headers: res.headers,
            body: decodeBody(buffer, contentType),
            finalUrl: currentUrl, contentType,
          });
        });
        res.on('error', (e) => {
          if (!settled) { settled = true; clearTimeout(hardTimer); reject(e); }
        });
      });
      req.on('timeout', () => { req.destroy(); });
      req.on('error', (e) => {
        if (!settled) { settled = true; clearTimeout(hardTimer); reject(e); }
      });
      req.end();
    };
    doRequest(url, 0);
  });
}

// ════════════════════════════════════════════
// 3. Verify single URL
// ════════════════════════════════════════════
async function verify(entry) {
  const { name, url, adminLevel } = entry;
  const r = {
    adminLevel, name, url,
    status: '', errorType: '', basis: '',
    isHttps: url.startsWith('https') ? '是' : '否',
    isMobile: '不明', hasSearch: '不明',
    hasLocalNews: '不明', hasPolicy: '不明', hasPolicyInterp: '不明',
    hasBizPolicy: '不明', hasGovOpen: '不明', hasGovSvc: '不明',
    hasInteraction: '不明', hasFiscal: '不明', hasStats: '不明',
    updateSign: '不明',
  };

  if (!url) { r.status = '空'; r.basis = '网址为空'; return r; }

  const tryVerify = async (tryUrl) => {
    const resp = await httpGet(tryUrl, TIMEOUT);
    r.isHttps = resp.finalUrl.startsWith('https') ? '是' : '否';

    if (resp.statusCode >= 400) {
      r.status = '无法访问'; r.errorType = `HTTP${resp.statusCode}`;
      r.basis = `HTTP ${resp.statusCode}`; return r;
    }

    const ct = resp.contentType || '';
    if (!ct.includes('html') && !ct.includes('xhtml') && resp.body.length < 100) {
      r.status = '存疑'; r.basis = `非HTML: ${ct.slice(0, 40)}`; return r;
    }

    const body = resp.body.slice(0, 200000);
    const $ = cheerio.load(body);
    const title = $('title').text().trim();

    // Check for meta refresh redirect
    const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
    if (metaRefresh) {
      const urlMatch = metaRefresh.match(/url=(.+)/i);
      if (urlMatch) {
        const refreshUrl = new URL(urlMatch[1].trim(), tryUrl).href;
        if (refreshUrl !== tryUrl) {
          const resp2 = await httpGet(refreshUrl, TIMEOUT);
          if (resp2.statusCode < 400) {
            const body2 = resp2.body.slice(0, 200000);
            const $2 = cheerio.load(body2);
            return analyzeHtml($2, body2, name, r);
          }
        }
      }
    }

    return analyzeHtml($, body, name, r);
  };

  try {
    return await tryVerify(url);
  } catch (e) {
    // Try alternate protocol
    const altUrl = url.startsWith('https://') ? url.replace('https://', 'http://') : url.replace('http://', 'https://');
    try {
      const rv = await tryVerify(altUrl);
      rv.url = url;
      rv.basis = `(协议切换→${altUrl.split('://')[0]}) ${rv.basis}`;
      return rv;
    } catch {}

    r.status = '无法访问';
    const code = e.cause?.code || e.code || '';
    if (e.message === 'HARD_TIMEOUT' || e.message === 'timeout') {
      r.basis = '请求超时'; r.errorType = 'timeout';
    } else if (code === 'ENOTFOUND') {
      r.basis = `域名无法解析`; r.errorType = 'DNS';
    } else if (code === 'ECONNREFUSED') {
      r.basis = '连接被拒绝'; r.errorType = 'refused';
    } else if (code === 'ECONNRESET') {
      r.basis = '连接被重置'; r.errorType = 'reset';
    } else {
      r.basis = (code || e.message || '未知错误').slice(0, 60);
    }
    return r;
  }
}

function analyzeHtml($, body, name, r) {
    const title = $('title').text().trim();
    const hdrs = [];
    $('h1, h2, .header, .logo, #header, .site-name, .site-title').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length < 200) hdrs.push(t);
    });
    const navTexts = [];
    $('nav a, .nav a, .menu a, .navbar a, #nav a').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length < 50) navTexts.push(t);
    });

    const allText = body.slice(0, 50000);
    const cleanName = name.replace(/(省|市|区|县|自治州|自治县|自治区|地区|盟|林区|特别行政区)$/, '');
    // Alias map for names whose official abbreviations differ from suffix-stripped forms
    const NAME_ALIASES = {
      '木里藏族自治县': '木里',
      '察哈尔右翼中旗': '察右中旗',
      '察哈尔右翼前旗': '察右前旗',
      '察哈尔右翼后旗': '察右后旗',
    };
    const altName = NAME_ALIASES[name] || '';
    const matchAny = (text) => text.includes(cleanName) || (altName && text.includes(altName));
    const titleMatch = matchAny(title);
    const headerMatch = hdrs.some(h => matchAny(h));
    const bodyMatch = matchAny(allText);
    const isGov = title.includes('人民政府') || title.includes('政府门户') ||
                  title.includes('政府网') || hdrs.some(h => h.includes('人民政府') || h.includes('政府门户'));

    const deptKw = ['财政局','财政厅','发改委','住建局','教育局','卫健委','人社局','民政局',
      '交通局','水利局','农业农村','自然资源','生态环境','市场监管','应急管理','司法局','公安局','税务局'];
    const isDept = deptKw.some(k => title.includes(k) && !title.includes('人民政府'));

    if (titleMatch && isGov && !isDept) {
      r.status = '正确'; r.basis = `标题"${title.slice(0,40)}"含"${cleanName}"及"人民政府"`;
    } else if (titleMatch && bodyMatch && !isDept) {
      r.status = '正确'; r.basis = `标题"${title.slice(0,40)}"含"${cleanName}"`;
    } else if (isDept) {
      r.status = '存疑'; r.errorType = '部门网站';
      r.basis = `标题"${title.slice(0,40)}"疑似部门网站`;
    } else if (!titleMatch && !headerMatch && !bodyMatch) {
      if (isGov) {
        r.status = '存疑'; r.errorType = '非本地区';
        r.basis = `政府官网但未含"${cleanName}"`;
      } else {
        r.status = '存疑'; r.errorType = '其他';
        r.basis = `标题"${title.slice(0,40)}"未含"${cleanName}"`;
      }
    } else if (headerMatch && !isDept) {
      r.status = '正确'; r.basis = `页头包含"${cleanName}"`;
    } else if (bodyMatch && !isDept) {
      r.status = '正确'; r.basis = `页面包含"${cleanName}"`;
    } else {
      r.status = '存疑'; r.basis = `需人工确认，标题:"${title.slice(0,40)}"`;
    }

    // Supplementary checks
    const vp = $('meta[name="viewport"]').length > 0;
    const mob = allText.includes('手机版') || allText.includes('移动版') ||
                allText.includes('无障碍') || allText.includes('适老化');
    if (vp || mob) r.isMobile = '是';

    const hasSearchEl = $('input[type="search"], input[name="searchword"], input[name="keyword"], input[name="q"], input[placeholder*="搜索"], .search-input, #search, .search-box').length > 0;
    if (hasSearchEl || allText.includes('站内搜索') || allText.includes('全站搜索')) r.hasSearch = '是';

    const combined = title + ' ' + navTexts.join(' ') + ' ' + hdrs.join(' ') + ' ' + allText.slice(0, 10000);
    const checks = [
      ['hasLocalNews', ['要闻','新闻','动态','资讯','今日','头条']],
      ['hasPolicy', ['政策文件','政策发布','政策法规','法规文件','规范性文件','政府文件']],
      ['hasPolicyInterp', ['政策解读','解读回应','图解政策']],
      ['hasBizPolicy', ['惠企','营商环境','助企','企业服务']],
      ['hasGovOpen', ['政务公开','信息公开','公开指南','政府信息公开']],
      ['hasGovSvc', ['政务服务','办事服务','便民服务','网上办事','在线办理']],
      ['hasInteraction', ['互动交流','领导信箱','意见征集','在线访谈','投诉建议','县长信箱','市长信箱']],
      ['hasFiscal', ['财政预决算','财政公开','预算公开','预算决算','财政信息']],
      ['hasStats', ['统计公报','统计信息','数据发布','统计数据','数据开放']],
    ];
    for (const [f, kws] of checks) r[f] = kws.some(k => combined.includes(k)) ? '有' : '无';

    const recent = /202[56][-年/.](?:0[1-9]|1[0-2])[-月/.](?:[0-2]\d|3[01])/;
    const older = /20(?:2[0-4]|1\d)[-年/.](?:0[1-9]|1[0-2])[-月/.](?:[0-2]\d|3[01])/;
    const vis = allText.slice(0, 20000);
    if (recent.test(vis)) r.updateSign = '最近有更新';
    else if (older.test(vis)) r.updateSign = '更新较旧';

    return r;
}

// ════════════════════════════════════════════
// 3b. Playwright headless browser fallback
// ════════════════════════════════════════════
let _browser = null;

async function getBrowser() {
  if (!_browser) {
    const { chromium } = await import('playwright');
    _browser = await chromium.launch({ headless: true });
  }
  return _browser;
}

async function closeBrowser() {
  if (_browser) { await _browser.close(); _browser = null; }
}

async function verifyPlaywright(entry) {
  const { name, url, adminLevel } = entry;
  const r = {
    adminLevel, name, url,
    status: '', errorType: '', basis: '',
    isHttps: url.startsWith('https') ? '是' : '否',
    isMobile: '不明', hasSearch: '不明',
    hasLocalNews: '不明', hasPolicy: '不明', hasPolicyInterp: '不明',
    hasBizPolicy: '不明', hasGovOpen: '不明', hasGovSvc: '不明',
    hasInteraction: '不明', hasFiscal: '不明', hasStats: '不明',
    updateSign: '不明',
  };
  if (!url) { r.status = '空'; r.basis = '网址为空'; return r; }

  const tryUrl = async (targetUrl) => {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    try {
      const response = await page.goto(targetUrl, { waitUntil: 'load', timeout: TIMEOUT });
      try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
      const finalUrl = page.url();
      r.isHttps = finalUrl.startsWith('https') ? '是' : '否';
      if (response && response.status() >= 400) {
        r.status = '无法访问'; r.errorType = `HTTP${response.status()}`;
        r.basis = `(Playwright) HTTP ${response.status()}`; return r;
      }
      const body = await page.content();
      const $ = cheerio.load(body);
      const result = analyzeHtml($, body, name, r);
      result.basis = `(Playwright) ${result.basis}`;
      return result;
    } finally {
      await context.close();
    }
  };

  try {
    return await tryUrl(url);
  } catch (e) {
    const altUrl = url.startsWith('https://') ? url.replace('https://', 'http://') : url.replace('http://', 'https://');
    try {
      const rv = await tryUrl(altUrl);
      rv.url = url;
      rv.basis = rv.basis.replace('(Playwright) ', `(Playwright协议切换→${altUrl.split('://')[0]}) `);
      return rv;
    } catch {}
    r.status = '无法访问';
    const msg = (e.message || '未知错误').replace(/\x1b\[[0-9;]*m/g, '').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 60);
    r.basis = `(Playwright) ${msg}`;
    r.errorType = msg.includes('Timeout') ? 'timeout' : '';
    return r;
  }
}

async function runPlaywrightRetry(results) {
  const needRetry = [];
  const indexMap = new Map();
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === '无法访问' || r.status === '存疑') {
      needRetry.push(r);
      indexMap.set(r.name + '||' + r.url, i);
    }
  }
  if (needRetry.length === 0) {
    console.log('所有条目均已成功，无需 Playwright 重验');
    return results;
  }
  console.log(`\n使用 Playwright 无头浏览器重验 ${needRetry.length} 条 (无法访问/存疑)...`);
  const PW_CONC = Math.min(3, CONCURRENCY);
  let done = 0;
  const stats = {};
  const t0 = Date.now();
  renderProgress(0, needRetry.length, stats, t0);
  for (let i = 0; i < needRetry.length; i += PW_CONC) {
    const batch = needRetry.slice(i, i + PW_CONC);
    const br = await Promise.all(batch.map(e => verifyPlaywright(e)));
    for (const r of br) {
      const key = r.name + '||' + r.url;
      const idx = indexMap.get(key);
      if (idx !== undefined) results[idx] = r;
      stats[r.status] = (stats[r.status] || 0) + 1;
    }
    done += br.length;
    renderProgress(done, needRetry.length, stats, t0);
  }
  process.stderr.write('\n');
  console.log('Playwright 重验统计:', JSON.stringify(stats, null, 2));
  await closeBrowser();
  return results;
}

// ════════════════════════════════════════════
// 4. Batch processing
// ════════════════════════════════════════════
function fmtTime(sec) {
  sec = Math.round(sec);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2,'0')}s`;
}

function renderProgress(done, total, stats, t0) {
  const cols = Math.min(process.stderr.columns || 80, 120);
  const pct = ((done / total) * 100).toFixed(1);
  const elapsed = (Date.now() - t0) / 1000;
  const eta = done > 0 ? ((elapsed / done) * (total - done)) : 0;

  const ok = stats['正确'] || 0;
  const fail = stats['无法访问'] || 0;
  const warn = stats['存疑'] || 0;
  const empty = stats['空'] || 0;

  const statsStr = `✔${ok} ✘${fail} ?${warn} ○${empty}`;
  const timeStr = `${fmtTime(elapsed)}/${fmtTime(elapsed + eta)}`;
  const suffix = ` ${done}/${total} ${statsStr} ${timeStr}`;
  const prefix = `${pct.padStart(5)}% `;
  const barWidth = Math.max(5, cols - prefix.length - suffix.length - 1);
  const filled = Math.round((done / total) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

  const line = `${prefix}${bar}${suffix}`;
  process.stderr.write(`\r${line}`);
}

async function runAll(entries, concurrency) {
  const results = [];
  let done = 0;
  const total = entries.length;
  const t0 = Date.now();
  const stats = {};

  renderProgress(0, total, stats, t0);

  for (let i = 0; i < total; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    const br = await Promise.all(batch.map(e => verify(e)));
    results.push(...br);
    for (const r of br) stats[r.status] = (stats[r.status] || 0) + 1;
    done += br.length;
    renderProgress(done, total, stats, t0);

    // Periodic save every 200
    if (done % 200 < concurrency) {
      fs.writeFileSync(JSON_TMP, JSON.stringify(results, null, 0), 'utf8');
    }
  }

  process.stderr.write('\n');
  return results;
}

// ════════════════════════════════════════════
// 5. Write XLSX via Python/openpyxl
// ════════════════════════════════════════════
function writeXlsx(results) {
  // Save full results JSON
  fs.writeFileSync(JSON_TMP, JSON.stringify(results, null, 0), 'utf8');

  const pyScript = `
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

data = json.load(open(r'${JSON_TMP.replace(/\\/g, '\\\\')}', encoding='utf-8'))
wb = Workbook()
ws = wb.active
ws.title = '政府官网核查'

headers = [
    '行政层级','地区名称','网址','状态','错误类型','判断依据',
    '是否HTTPS','移动端友好','站内搜索',
    '本地要闻','政策公开','政策解读','惠企政策','政务公开','政务服务','互动交流','财政信息','统计数据',
    '更新迹象'
]
fields = [
    'adminLevel','name','url','status','errorType','basis',
    'isHttps','isMobile','hasSearch',
    'hasLocalNews','hasPolicy','hasPolicyInterp','hasBizPolicy','hasGovOpen','hasGovSvc','hasInteraction','hasFiscal','hasStats',
    'updateSign'
]

# Header style
hfont = Font(name='Arial', bold=True, size=11, color='FFFFFF')
hfill = PatternFill('solid', fgColor='4472C4')
halign = Alignment(horizontal='center', vertical='center', wrap_text=True)
thin = Side(style='thin', color='D0D0D0')
border = Border(bottom=thin)

for c, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=c, value=h)
    cell.font = hfont
    cell.fill = hfill
    cell.alignment = halign

# Status colors
ok_fill = PatternFill('solid', fgColor='E2EFDA')
fail_fill = PatternFill('solid', fgColor='FCE4EC')
warn_fill = PatternFill('solid', fgColor='FFF3E0')
empty_fill = PatternFill('solid', fgColor='F5F5F5')

import re as _re
_CTRL_RE = _re.compile('[' + ''.join(chr(c) for c in range(0,9)) + chr(11) + chr(12) + ''.join(chr(c) for c in range(14,32)) + chr(127) + ']')
_ANSI_RE = _re.compile(chr(27) + r'\\[[0-9;]*m')

for i, row in enumerate(data, 2):
    for j, f in enumerate(fields):
        val = row.get(f, '')
        if isinstance(val, str):
            val = _CTRL_RE.sub('', val)
            val = _ANSI_RE.sub('', val)
        cell = ws.cell(row=i, column=j+1, value=val)
        cell.font = Font(name='Arial', size=10)
        cell.alignment = Alignment(vertical='center', wrap_text=(f=='basis'))
        cell.border = border

    st = row.get('status','')
    fill = ok_fill if st == '正确' else fail_fill if st == '无法访问' else warn_fill if st == '存疑' else empty_fill
    for j in range(len(fields)):
        ws.cell(row=i, column=j+1).fill = fill

# Column widths
widths = {'A':8,'B':14,'C':38,'D':10,'E':12,'F':42,'G':9,'H':9,'I':9,
          'J':8,'K':8,'L':8,'M':8,'N':8,'O':8,'P':8,'Q':8,'R':8,'S':12}
for col, w in widths.items():
    ws.column_dimensions[col].width = w

ws.freeze_panes = 'A2'
ws.auto_filter.ref = ws.dimensions

# ── Summary sheet ──
ws2 = wb.create_sheet('统计')
ws2['A1'] = '状态'
ws2['B1'] = '数量'
for c in ['A1','B1']:
    ws2[c].font = hfont
    ws2[c].fill = hfill
    ws2[c].alignment = halign

from collections import Counter
cnt = Counter(r.get('status','') for r in data)
for i, (k, v) in enumerate(sorted(cnt.items(), key=lambda x: -x[1]), 2):
    ws2.cell(row=i, column=1, value=k or '(空)')
    ws2.cell(row=i, column=2, value=v)
ws2.column_dimensions['A'].width = 14
ws2.column_dimensions['B'].width = 10

wb.save(r'${XLSX_FILE.replace(/\\/g, '\\\\')}')
print(f'已保存 {len(data)} 条记录到 XLSX')
`;

  const pyFile = path.join(ROOT, 'scripts', '_gen_xlsx.py');
  fs.writeFileSync(pyFile, pyScript, 'utf8');

  const cmd = `D:/Anaconda3/Scripts/conda.exe run -p D:\\Anaconda3 --no-capture-output python "${pyFile}"`;
  const out = execSync(cmd, { encoding: 'utf8', timeout: 180000 });
  console.log(out.trim());

  // Cleanup temp files
  try { fs.unlinkSync(pyFile); } catch {}
}

// ════════════════════════════════════════════
// Main
// ════════════════════════════════════════════
async function main() {
  console.log('解析 gov-website-links.ts ...');
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const entries = parseTS(content);
  console.log(`共 ${entries.length} 条，有URL ${entries.filter(e => e.url).length} 条`);
  console.log(`并发=${CONCURRENCY}  超时=${TIMEOUT}ms  模式=${RETRY_MODE ? '重验失败' : '全量'}`);

  let results;

  if (RETRY_MODE && fs.existsSync(JSON_TMP)) {
    // Load previous results, keep 正确/空, re-verify others
    const prev = JSON.parse(fs.readFileSync(JSON_TMP, 'utf8'));
    const prevMap = new Map();
    for (const r of prev) prevMap.set(r.name + '||' + r.url, r);

    const skipStatuses = new Set(['正确', '空']);
    const kept = [];     // entries to keep as-is
    const toRetry = [];  // entries to re-verify

    for (const e of entries) {
      const key = e.name + '||' + e.url;
      const old = prevMap.get(key);
      if (old && skipStatuses.has(old.status)) {
        kept.push(old);
      } else {
        toRetry.push(e);
      }
    }

    console.log(`已完成: ${kept.length} 条 (正确/空)，待重验: ${toRetry.length} 条`);
    console.log('开始重验...');
    const retried = await runAll(toRetry, CONCURRENCY);

    // Merge: rebuild in original order
    const retriedMap = new Map();
    for (const r of retried) retriedMap.set(r.name + '||' + r.url, r);
    const keptMap = new Map();
    for (const r of kept) keptMap.set(r.name + '||' + r.url, r);

    results = entries.map(e => {
      const key = e.name + '||' + e.url;
      return retriedMap.get(key) || keptMap.get(key) || e;
    });
  } else {
    console.log('开始核查...');
    results = await runAll(entries, CONCURRENCY);
  }

  // Playwright fallback for failed entries
  if (!NO_PLAYWRIGHT) {
    results = await runPlaywrightRetry(results);
  }

  // Stats
  const stats = {};
  for (const r of results) stats[r.status] = (stats[r.status] || 0) + 1;
  console.log('统计:', JSON.stringify(stats, null, 2));

  console.log('生成 XLSX...');
  writeXlsx(results);

  console.log('完成!');
}

main().catch(e => { console.error(e); process.exit(1); });
