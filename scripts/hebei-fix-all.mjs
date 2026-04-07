#!/usr/bin/env node
/**
 * Hebei Province: Fix homepage-only URLs → find actual 预决算公开 pages
 * Also discover missing county URLs.
 * 
 * Phase 1: For each existing URL that's just a homepage/fiscal-bureau-home,
 *          try common 预决算 sub-paths and homepage link crawling.
 * Phase 2: For empty URLs, try domain patterns + common paths.
 */

import https from 'https';
import http from 'http';

const CONCURRENCY = 6;
const TIMEOUT = 8000;
const REDIRECT_TIMEOUT = 6000;

// ─── Fiscal sub-paths to probe (in priority order) ───
const FISCAL_PATHS_GOV = [
  '/zwgk/czzj/',
  '/zwgk/czxx/',
  '/zwgk/czyjsgk/',
  '/zwgk/czyjszl/',
  '/zwgk/zdly/czzj/',
  '/zwgk/zdlyxxgk/czyjshsgjf/',
  '/zfxxgk/fdzdgknr/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/',
  '/zfxxgk/czxx/',
  '/yjsgk/',
];
const FISCAL_PATHS_CZJ = [
  '/',
  '/zwgk/yjsgk/',
  '/zwgk/czyjsgk/',
  '/col/',
];

// ─── Keywords for scoring ───
const HIGH_KW = ['预决算公开', '财政预决算'];
const MED_KW = ['预算公开', '决算公开', '一般公共预算', '政府性基金预算', '政府预算', '政府决算'];
const LOW_KW = ['部门预算', '部门决算', '预算', '决算'];

function scoreContent(html) {
  let s = 0;
  for (const k of HIGH_KW) if (html.includes(k)) s += 5;
  for (const k of MED_KW) if (html.includes(k)) s += 3;
  for (const k of LOW_KW) if (html.includes(k)) s += 1;
  return s;
}

function fetchUrl(url, timeout = TIMEOUT) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => { try { req.destroy(); } catch {}; resolve({ error: 'TIMEOUT' }); }, timeout);
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: timeout,
      rejectUnauthorized: false,
    }, (res) => {
      // Follow one redirect
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        clearTimeout(timer);
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = u.protocol + '//' + u.host + loc;
        }
        res.resume();
        const timer2 = setTimeout(() => { resolve({ error: 'REDIRECT_TIMEOUT' }); }, REDIRECT_TIMEOUT);
        const mod2 = loc.startsWith('https') ? https : http;
        const req2 = mod2.get(loc, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: REDIRECT_TIMEOUT,
          rejectUnauthorized: false,
        }, (res2) => {
          if (res2.statusCode !== 200) {
            clearTimeout(timer2);
            res2.resume();
            resolve({ error: `HTTP_${res2.statusCode}`, redirectedTo: loc });
            return;
          }
          let body = '';
          res2.setEncoding('utf-8');
          res2.on('data', (chunk) => { body += chunk; if (body.length > 200000) res2.destroy(); });
          res2.on('end', () => { clearTimeout(timer2); resolve({ status: 200, body, url: loc, redirected: true }); });
          res2.on('error', () => { clearTimeout(timer2); resolve({ error: 'READ_ERROR' }); });
        });
        req2.on('error', (e) => { clearTimeout(timer2); resolve({ error: e.code || 'REQ_ERROR' }); });
        return;
      }
      if (res.statusCode !== 200) {
        clearTimeout(timer);
        res.resume();
        resolve({ error: `HTTP_${res.statusCode}` });
        return;
      }
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => { body += chunk; if (body.length > 200000) res.destroy(); });
      res.on('end', () => { clearTimeout(timer); resolve({ status: 200, body, url }); });
      res.on('error', () => { clearTimeout(timer); resolve({ error: 'READ_ERROR' }); });
    });
    req.on('error', (e) => { clearTimeout(timer); resolve({ error: e.code || 'REQ_ERROR' }); });
  });
}

function headCheck(url, timeout = 4000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => { try { req.destroy(); } catch {}; resolve(false); }, timeout);
    const req = mod.request(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: timeout,
      rejectUnauthorized: false,
    }, (res) => {
      clearTimeout(timer);
      res.resume();
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        resolve(true); // redirects are alive
      } else {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      }
    });
    req.on('error', () => { clearTimeout(timer); resolve(false); });
    req.end();
  });
}

// Extract fiscal-related links from HTML
function extractFiscalLinks(html, baseUrl) {
  const links = [];
  // Match <a> tags with href
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    // Filter for fiscal keywords in text or href
    const fiscalTextKw = ['预算', '决算', '财政预决算', '预决算', '财政资金', '财政信息', '财务'];
    const fiscalUrlKw = ['czyjs', 'czyjsgk', 'czyjszl', 'czzj', 'czxx', 'yjsgk', 'YuJueSuan', 'czgk'];
    const textMatch = fiscalTextKw.some(k => text.includes(k));
    const urlMatch = fiscalUrlKw.some(k => href.includes(k));
    if (textMatch || urlMatch) {
      let fullUrl = href;
      if (href.startsWith('/')) {
        try {
          const u = new URL(baseUrl);
          fullUrl = u.protocol + '//' + u.host + href;
        } catch { continue; }
      } else if (!href.startsWith('http')) {
        continue;
      }
      // Skip external/national sites
      if (/mof\.gov\.cn|www\.gov\.cn|most\.gov\.cn|czj\.cq\.gov\.cn|czj\.sh\.gov\.cn/.test(fullUrl)) continue;
      if (fullUrl.includes('javascript:')) continue;
      links.push({ url: fullUrl, text });
    }
  }
  return links;
}

// ─── Run parallel tasks with concurrency limit ───
async function parallelLimit(tasks, limit) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── Phase 1: Fix homepage-only URLs ───
async function findFiscalPage(name, currentUrl) {
  let baseUrl;
  try {
    baseUrl = new URL(currentUrl);
  } catch {
    return { name, currentUrl, result: 'INVALID_URL', newUrl: '' };
  }

  const domain = baseUrl.hostname;
  const isCzj = domain.startsWith('czj.') || domain.startsWith('czt.') || domain.startsWith('cz.');

  // Step 1: Try known sub-paths
  const pathsToTry = isCzj ? FISCAL_PATHS_CZJ : FISCAL_PATHS_GOV;
  const candidates = [];

  for (const path of pathsToTry) {
    if (path === '/') continue; // Skip root for now
    const testUrl = `${baseUrl.protocol}//${domain}${path}`;
    candidates.push(testUrl);
  }

  // Also try HTTPS/HTTP variant
  const altProto = baseUrl.protocol === 'https:' ? 'http:' : 'https:';
  for (const path of pathsToTry.slice(0, 3)) {
    if (path === '/') continue;
    candidates.push(`${altProto}//${domain}${path}`);
  }

  // HEAD-check all candidates
  const headTasks = candidates.map(url => () => headCheck(url).then(alive => ({ url, alive })));
  const headResults = await parallelLimit(headTasks, 4);
  const alive = headResults.filter(r => r.alive);

  // GET + score alive ones
  let bestUrl = '';
  let bestScore = 0;

  for (const { url } of alive) {
    const res = await fetchUrl(url);
    if (res.error) continue;
    const score = scoreContent(res.body);
    const finalUrl = res.redirected ? res.url : url;
    if (score > bestScore) {
      bestScore = score;
      bestUrl = finalUrl;
    }
  }

  if (bestScore >= 3) {
    return { name, currentUrl, result: 'FIXED_BY_PATH', newUrl: bestUrl, score: bestScore };
  }

  // Step 2: Crawl homepage for fiscal links
  const homeRes = await fetchUrl(currentUrl);
  if (homeRes.error) {
    return { name, currentUrl, result: 'HOME_UNREACHABLE', newUrl: '', error: homeRes.error };
  }

  const fiscalLinks = extractFiscalLinks(homeRes.body, currentUrl);
  
  for (const link of fiscalLinks) {
    const res = await fetchUrl(link.url);
    if (res.error) continue;
    const score = scoreContent(res.body);
    const finalUrl = res.redirected ? res.url : link.url;
    if (score > bestScore) {
      bestScore = score;
      bestUrl = finalUrl;
    }
  }

  if (bestScore >= 3) {
    return { name, currentUrl, result: 'FIXED_BY_CRAWL', newUrl: bestUrl, score: bestScore };
  }

  // If we found something with lower score but still relevant
  if (bestScore > 0 && bestUrl) {
    return { name, currentUrl, result: 'LOW_SCORE', newUrl: bestUrl, score: bestScore };
  }

  return { name, currentUrl, result: 'NOT_FOUND', newUrl: '' };
}

// ─── Phase 2: Discover missing county URLs ───
async function discoverMissingUrl(name, cityDomain) {
  // Generate candidate domains
  // For Hebei counties, try {pinyin}.gov.cn and www.{pinyin}.gov.cn
  // We don't know pinyin, so we need to use cityDomain-based exploration

  // Try to find from city portal
  // (This will be handled by homepage link crawling from city URL)
  return { name, result: 'SKIP' };
}

// ─── Main: Collect all Hebei entries ───
async function main() {
  // Hardcode all non-empty Hebei county/city URLs that are just homepages
  // (i.e., URLs ending with just domain/ or without fiscal-specific path)
  
  const homepageOnlyEntries = [
    // === City-level fiscal bureau homepages ===
    { name: "唐山市", url: "https://czj.tangshan.gov.cn/" },
    { name: "张家口市", url: "http://czj.zjk.gov.cn/" },
    { name: "廊坊市", url: "https://czj.lf.gov.cn/" },
    { name: "衡水市", url: "http://czj.hengshui.gov.cn/" },
    
    // === County-level government homepages ===
    // 唐山
    { name: "唐山-路北区", url: "http://www.tslb.gov.cn/" },
    { name: "唐山-曹妃甸区", url: "http://www.caofeidian.gov.cn/" },
    { name: "唐山-滦南县", url: "http://www.luannan.gov.cn/" },
    { name: "唐山-乐亭县", url: "http://www.laoting.gov.cn/" },
    { name: "唐山-迁西县", url: "http://www.qianxi.gov.cn/" },
    { name: "唐山-玉田县", url: "http://www.yutian.gov.cn/" },
    // 秦皇岛
    { name: "秦皇岛-山海关区", url: "http://www.shanhaiguan.gov.cn/" },
    { name: "秦皇岛-北戴河区", url: "http://www.beidaihe.gov.cn/" },
    // 邯郸
    { name: "邯郸-邯山区", url: "http://www.hdhs.gov.cn/" },
    { name: "邯郸-复兴区", url: "http://www.hdfx.gov.cn/" },
    { name: "邯郸-临漳县", url: "http://www.linzhang.gov.cn/" },
    { name: "邯郸-大名县", url: "http://www.daming.gov.cn/" },
    { name: "邯郸-涉县", url: "http://www.shexian.gov.cn/" },
    { name: "邯郸-磁县", url: "http://www.cixian.gov.cn/" },
    { name: "邯郸-邱县", url: "http://www.qiuxian.gov.cn/" },
    { name: "邯郸-鸡泽县", url: "http://www.jize.gov.cn/" },
    { name: "邯郸-馆陶县", url: "http://www.guantao.gov.cn/" },
    { name: "邯郸-武安市", url: "http://www.wuan.gov.cn/" },
    // 邢台
    { name: "邢台-襄都区", url: "http://www.xiangdu.gov.cn/" },
    { name: "邢台-信都区", url: "http://www.xindu.gov.cn/" },
    { name: "邢台-任泽区", url: "http://www.renze.gov.cn/" },
    { name: "邢台-南和区", url: "https://www.nanhe.gov.cn/" },
    { name: "邢台-临城县", url: "http://www.lincheng.gov.cn/" },
    { name: "邢台-隆尧县", url: "http://www.longyao.gov.cn/" },
    { name: "邢台-宁晋县", url: "http://www.ningjin.gov.cn/" },
    { name: "邢台-巨鹿县", url: "http://www.julu.gov.cn/" },
    { name: "邢台-平乡县", url: "http://www.pingxiang.gov.cn/" },
    { name: "邢台-威县", url: "http://www.weixian.gov.cn/" },
    { name: "邢台-临西县", url: "http://www.linxi.gov.cn/" },
    { name: "邢台-南宫市", url: "http://www.nangong.gov.cn/" },
    // 保定
    { name: "保定-竞秀区", url: "http://www.jingxiu.gov.cn/" },
    { name: "保定-莲池区", url: "https://www.lianchi.gov.cn/" },
    { name: "保定-满城区", url: "http://www.mancheng.gov.cn/" },
    { name: "保定-徐水区", url: "http://www.xushui.gov.cn/" },
    { name: "保定-涞水县", url: "http://www.laishui.gov.cn/" },
    { name: "保定-唐县", url: "https://www.tangxian.gov.cn/" },
    { name: "保定-高阳县", url: "http://www.gaoyang.gov.cn/" },
    { name: "保定-涞源县", url: "http://www.laiyuan.gov.cn/" },
    { name: "保定-望都县", url: "http://www.wangdu.gov.cn/" },
    { name: "保定-安新县", url: "http://www.anxin.gov.cn/" },
    { name: "保定-曲阳县", url: "http://www.quyang.gov.cn/" },
    { name: "保定-蠡县", url: "http://www.lixian.gov.cn/" },
    { name: "保定-雄县", url: "http://www.xiongxian.gov.cn/" },
    { name: "保定-涿州市", url: "http://www.zhuozhou.gov.cn/" },
    { name: "保定-安国市", url: "http://www.anguo.gov.cn/" },
    { name: "保定-高碑店市", url: "http://www.gaobeidian.gov.cn/" },
    // 张家口
    { name: "张家口-桥东区", url: "http://www.zjkqd.gov.cn/" },
    { name: "张家口-怀来县", url: "http://www.huailai.gov.cn/" },
    // 承德
    { name: "承德-鹰手营子矿区", url: "http://www.ysyz.gov.cn/" },
    { name: "承德-承德县", url: "http://www.cdx.gov.cn/" },
    { name: "承德-丰宁满族自治县", url: "http://www.fengning.gov.cn/" },
    { name: "承德-围场满族蒙古族自治县", url: "http://www.weichang.gov.cn/" },
    { name: "承德-平泉市", url: "http://www.pingquan.gov.cn/" },
    // 沧州
    { name: "沧州-新华区", url: "http://www.czxh.gov.cn/" },
    { name: "沧州-运河区", url: "http://www.czyh.gov.cn/" },
    { name: "沧州-沧县", url: "http://www.cangxian.gov.cn/" },
    { name: "沧州-青县", url: "http://www.qingxian.gov.cn/" },
    { name: "沧州-东光县", url: "http://www.dongguang.gov.cn/" },
    { name: "沧州-海兴县", url: "http://www.haixing.gov.cn/" },
    { name: "沧州-肃宁县", url: "http://www.suning.gov.cn/" },
    { name: "沧州-南皮县", url: "http://www.nanpi.gov.cn/" },
    { name: "沧州-吴桥县", url: "http://www.wuqiao.gov.cn/" },
    { name: "沧州-献县", url: "http://www.xianxian.gov.cn/" },
    { name: "沧州-孟村回族自治县", url: "http://www.mengcun.gov.cn/" },
    { name: "沧州-泊头市", url: "http://www.botou.gov.cn/" },
    { name: "沧州-任丘市", url: "http://www.renqiu.gov.cn/" },
    { name: "沧州-黄骅市", url: "http://www.huanghua.gov.cn/" },
    { name: "沧州-河间市", url: "http://www.hejian.gov.cn/" },
    // 廊坊
    { name: "廊坊-安次区", url: "http://www.anci.gov.cn/" },
    { name: "廊坊-广阳区", url: "http://www.guangyang.gov.cn/" },
    { name: "廊坊-永清县", url: "http://www.yongqing.gov.cn/" },
    { name: "廊坊-香河县", url: "http://www.xianghe.gov.cn/" },
    { name: "廊坊-大城县", url: "http://www.dacheng.gov.cn/" },
    { name: "廊坊-文安县", url: "http://www.wenan.gov.cn/" },
    { name: "廊坊-霸州市", url: "http://www.bazhou.gov.cn/" },
    // 衡水
    { name: "衡水-桃城区", url: "http://www.taocheng.gov.cn/" },
    { name: "衡水-冀州区", url: "http://www.jizhou.gov.cn/" },
    { name: "衡水-枣强县", url: "http://www.zaoqiang.gov.cn/" },
    { name: "衡水-武邑县", url: "http://www.wuyi.gov.cn/" },
    { name: "衡水-武强县", url: "http://www.wuqiang.gov.cn/" },
    { name: "衡水-饶阳县", url: "http://www.raoyang.gov.cn/" },
    { name: "衡水-安平县", url: "http://www.anping.gov.cn/" },
    { name: "衡水-故城县", url: "http://www.gucheng.gov.cn/" },
    { name: "衡水-景县", url: "http://www.jingxian.gov.cn/" },
    { name: "衡水-深州市", url: "http://www.shenzhou.gov.cn/" },
    // 石家庄
    { name: "石家庄-平山县", url: "http://www.pingshan.gov.cn/" },
  ];

  console.log(`\n=== Phase 1: Fixing ${homepageOnlyEntries.length} homepage-only URLs ===\n`);

  const tasks = homepageOnlyEntries.map(entry => async () => {
    const result = await findFiscalPage(entry.name, entry.url);
    const status = result.result === 'FIXED_BY_PATH' ? '✅ PATH' :
                   result.result === 'FIXED_BY_CRAWL' ? '✅ CRAWL' :
                   result.result === 'LOW_SCORE' ? '⚠️ LOW' :
                   result.result === 'HOME_UNREACHABLE' ? '❌ DOWN' :
                   '❌ NONE';
    console.log(`${status} ${entry.name}: ${result.newUrl || '(none)'} ${result.score ? `[score=${result.score}]` : ''}`);
    return result;
  });

  const results = await parallelLimit(tasks, CONCURRENCY);

  // Summary
  const fixed = results.filter(r => r.result === 'FIXED_BY_PATH' || r.result === 'FIXED_BY_CRAWL');
  const lowScore = results.filter(r => r.result === 'LOW_SCORE');
  const notFound = results.filter(r => r.result === 'NOT_FOUND');
  const down = results.filter(r => r.result === 'HOME_UNREACHABLE');

  console.log(`\n=== Summary ===`);
  console.log(`Fixed: ${fixed.length}`);
  console.log(`Low score (needs review): ${lowScore.length}`);
  console.log(`Not found: ${notFound.length}`);
  console.log(`Unreachable: ${down.length}`);

  // Output results for applying
  console.log(`\n=== RESULTS FOR APPLICATION ===`);
  for (const r of [...fixed, ...lowScore]) {
    console.log(`UPDATE|${r.name}|${r.currentUrl}|${r.newUrl}|${r.score}`);
  }
  for (const r of down) {
    console.log(`CLEAR|${r.name}|${r.currentUrl}||${r.error}`);
  }
}

main().catch(console.error);
