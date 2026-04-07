/**
 * 增强版：Phase 1 HEAD 筛活 → Phase 2 GET 首页 → Phase 3 从首页链接中查找财政栏目
 * 对存活但首页不直接匹配的城市，爬取首页链接，找包含财政/预决算关键词的子页面
 */
import http from 'http';
import https from 'https';

const HEAD_TIMEOUT  = 3000;
const FETCH_TIMEOUT = 8000;
const CONCURRENCY   = 30;
const BUDGET_KW = ['预算', '决算', '预决算', '财政'];
const LINK_KW = ['预算', '决算', '财政', 'czj', 'czzj', 'czxx', 'yjsgk', 'czyjsgk', 'czyjs'];

function headCheck(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    let parsed;
    try { parsed = new URL(url); } catch { return resolve({ url, alive: false }); }
    const opts = {
      method: 'HEAD', hostname: parsed.hostname,
      port: parsed.port || (url.startsWith('https') ? 443 : 80),
      path: parsed.pathname + parsed.search,
      timeout: HEAD_TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      rejectUnauthorized: false,
    };
    try {
      const req = mod.request(opts, (res) => {
        res.resume();
        const s = res.statusCode;
        resolve({ url, alive: s >= 200 && s < 400, status: s,
          redirect: (s >= 300 && s < 400) ? res.headers.location : null });
      });
      req.on('error', () => resolve({ url, alive: false }));
      req.on('timeout', () => { req.destroy(); resolve({ url, alive: false }); });
      req.end();
    } catch { resolve({ url, alive: false }); }
  });
}

function fetchGet(url, timeout = FETCH_TIMEOUT) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, rejectUnauthorized: false };
    try {
      const req = mod.get(url, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ ok: false, redirect: res.headers.location, status: res.statusCode });
          res.resume(); return;
        }
        if (res.statusCode >= 400) { resolve({ ok: false, status: res.statusCode }); res.resume(); return; }
        let data = ''; res.setEncoding('utf-8');
        res.on('data', d => data += d);
        res.on('end', () => resolve({ ok: true, data, len: data.length }));
      });
      req.on('error', e => resolve({ ok: false, err: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: 'timeout' }); });
    } catch (e) { resolve({ ok: false, err: e.message }); }
  });
}

async function pool(tasks, concurrency) {
  const results = []; let idx = 0;
  async function worker() { while (idx < tasks.length) { const i = idx++; results[i] = await tasks[i](); } }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

// 从 HTML 中提取链接
function extractLinks(html, baseUrl) {
  const links = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    if (href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      links.push(abs);
    } catch {}
  }
  return [...new Set(links)];
}

// 判断链接是否可能是财政预决算栏目
function isFiscalLink(url, text) {
  const combined = url + (text || '');
  return LINK_KW.some(k => combined.includes(k));
}

// 从 HTML 中提取带文本的链接
function extractLinksWithText(html, baseUrl) {
  const results = [];
  const re = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1]; let text = m[2].replace(/<[^>]+>/g, '').trim();
    if (href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      // 只保留 .gov.cn 链接
      if (abs.includes('.gov.cn')) results.push({ url: abs, text });
    } catch {}
  }
  return results;
}

function scoreContent(html) {
  let s = 0;
  if (html.includes('预决算公开')) s += 5;
  if (html.includes('预算公开')) s += 3;
  if (html.includes('决算公开')) s += 3;
  if (html.includes('部门预算')) s += 2;
  if (html.includes('部门决算')) s += 2;
  if (html.includes('一般公共预算')) s += 3;
  if (html.includes('政府性基金预算')) s += 3;
  for (const kw of BUDGET_KW) { if (html.includes(kw)) s += 2; }
  return s;
}

function classifySource(url) {
  if (/czj\.|czt\.|cz\.[a-z]/i.test(url)) return '财政局官网';
  if (/xxgk\.|gk\./i.test(url)) return '政务公开平台';
  if (/www\..+\.gov\.cn/i.test(url)) return '市政府官网';
  return '其他官方站点';
}

// ── 候选 URL 生成（扩展版，更多路径模式）──
function genCandidates(domains) {
  const urls = [];
  for (const d of domains) {
    // 财政局独立站
    for (const sub of ['czj','czt','cz']) {
      urls.push(`http://${sub}.${d}.gov.cn/`);
      urls.push(`https://${sub}.${d}.gov.cn/`);
    }
    // 财政局 预决算子页
    for (const sub of ['czj','czt','cz']) {
      for (const path of ['zwgk/yjsgk/','zwgk/yjs/','zfxxgk/fdzdgknr/czyjs/','xxgk/yjsgk/','zfxxgk/czyjs/']) {
        urls.push(`http://${sub}.${d}.gov.cn/${path}`);
      }
    }
    // 政府门户 - 各种栏目路径
    for (const proto of ['http','https']) {
      for (const path of [
        'zwgk/czzj/', 'zwgk/czxx/', 'zwgk/zdly/czzj/',
        'zwgk/zdlyxxgk/czyjshsgjf/', 'zwgk/czyjsgk/',
        'zfxxgk/fdzdgknr/czyjsgk/', 'zfxxgk/fdzdgknr/czyjs/',
        'zfxxgk/fdzdgknr/czxx/', 'zfxxgk/czxx/',
        'zfxxgk/czyjs/', 'xxgk/czgk/', 'xxgk/czxx/',
        'col/col_czyjsgk/', 'col/col_czysgk/',
      ]) {
        urls.push(`${proto}://www.${d}.gov.cn/${path}`);
      }
    }
    // 政务公开子站
    urls.push(`http://xxgk.${d}.gov.cn/`);
    urls.push(`https://xxgk.${d}.gov.cn/`);
    // 也试一下不带 www 的
    urls.push(`http://${d}.gov.cn/`);
    urls.push(`https://${d}.gov.cn/`);
  }
  return [...new Set(urls)];
}

// ── 缺失数据 ──
const MISSING = {
  河南省: {
    郑州市: ['zhengzhou'],
    安阳市: ['anyang'],
    濮阳市: ['puyang'],
    南阳市: ['nanyang'],
  },
  湖北省: {
    宜昌市: ['yichang'],
    黄冈市: ['huanggang'],
    随州市: ['suizhou'],
    仙桃市: ['xiantao'],
    潜江市: ['qianjiang'],
    天门市: ['tianmen'],
    神农架林区: ['snj','shennongjia'],
  },
  湖南省: {
    衡阳市: ['hengyang'],
    益阳市: ['yiyang'],
    郴州市: ['chenzhou'],
    永州市: ['yongzhou'],
    怀化市: ['huaihua'],
    娄底市: ['loudi'],
    湘西土家族苗族自治州: ['xiangxi'],
  },
  广西壮族自治区: {
    南宁市: ['nanning'],
    柳州市: ['liuzhou'],
    北海市: ['beihai'],
    防城港市: ['fcg','fangchenggang'],
    贵港市: ['guigang'],
    贺州市: ['hezhou'],
    河池市: ['hechi'],
    来宾市: ['laibin'],
    崇左市: ['chongzuo'],
  },
  贵州省: {
    安顺市: ['anshun'],
    毕节市: ['bijie'],
    铜仁市: ['tongren'],
    黔西南布依族苗族自治州: ['qxn','qianxinan'],
    黔南布依族苗族自治州: ['qiannan'],
  },
  云南省: {
    玉溪市: ['yuxi'],
    保山市: ['baoshan'],
    昭通市: ['zhaotong'],
    丽江市: ['lijiang'],
    普洱市: ['puer'],
    临沧市: ['lincang'],
    楚雄彝族自治州: ['chuxiong'],
    红河哈尼族彝族自治州: ['honghe'],
    西双版纳傣族自治州: ['xsbn','banna'],
    大理白族自治州: ['dali'],
    德宏傣族景颇族自治州: ['dehong'],
    怒江傈僳族自治州: ['nujiang'],
    迪庆藏族自治州: ['diqing'],
  },
  西藏自治区: {
    林芝市: ['linzhi'],
    那曲市: ['naqu'],
  },
  甘肃省: {
    金昌市: ['jinchang'],
    白银市: ['baiyin'],
    天水市: ['tianshui'],
    武威市: ['wuwei'],
    张掖市: ['zhangye'],
    庆阳市: ['qingyang'],
    陇南市: ['longnan'],
    临夏回族自治州: ['linxia'],
    甘南藏族自治州: ['gannan'],
  },
  青海省: {
    海东市: ['haidong'],
    海北藏族自治州: ['haibei'],
    黄南藏族自治州: ['huangnan'],
    海南藏族自治州: ['hainan'],
    果洛藏族自治州: ['guoluo'],
    玉树藏族自治州: ['yushu'],
  },
  宁夏回族自治区: {
    石嘴山市: ['shizuishan'],
    吴忠市: ['wuzhong'],
    固原市: ['guyuan'],
    中卫市: ['zhongwei'],
  },
  吉林省: {
    吉林市: ['jlcity'],
    四平市: ['siping'],
    通化市: ['tonghua'],
    白山市: ['baishan'],
    松原市: ['songyuan'],
    白城市: ['baicheng'],
  },
  黑龙江省: {
    鸡西市: ['jixi'],
    鹤岗市: ['hegang'],
    双鸭山市: ['shuangyashan','sys'],
    绥化市: ['suihua'],
  },
  海南省: {
    三沙市: ['sansha'],
  },
};

async function main() {
  let totalCities = 0;
  const allEntries = [];
  for (const [prov, cities] of Object.entries(MISSING)) {
    for (const [city, domains] of Object.entries(cities)) {
      totalCities++;
      allEntries.push({ province: prov, city, domains, urls: genCandidates(domains) });
    }
  }
  const totalUrls = allEntries.reduce((s, e) => s + e.urls.length, 0);
  console.log(`共 ${totalCities} 个城市，${totalUrls} 个候选 URL\n`);

  // ═══ Phase 1: HEAD ═══
  console.log('═══ Phase 1: HEAD 检测 ═══');
  const urlCityMap = new Map();
  const headTasks = [];
  for (const entry of allEntries) {
    for (const url of entry.urls) {
      urlCityMap.set(url, { province: entry.province, city: entry.city });
      headTasks.push(() => headCheck(url));
    }
  }
  const headResults = await pool(headTasks, CONCURRENCY);
  const alive = headResults.filter(r => r.alive);
  const redir = headResults.filter(r => !r.alive && r.redirect);
  console.log(`  存活: ${alive.length}  重定向: ${redir.length}  死链: ${headResults.length - alive.length - redir.length}`);

  // 按城市归组
  const cityAlive = new Map();
  for (const r of [...alive]) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAlive.has(key)) cityAlive.set(key, []);
    cityAlive.get(key).push(r.url);
  }
  for (const r of redir) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAlive.has(key)) cityAlive.set(key, []);
    const target = r.redirect?.startsWith('http') ? r.redirect : (() => { try { return new URL(r.redirect, r.url).href; } catch { return null; } })();
    if (target) cityAlive.get(key).push(target);
  }
  console.log(`  有存活的城市: ${cityAlive.size}/${totalCities}\n`);

  // ═══ Phase 2: GET + 内容匹配 ═══
  console.log('═══ Phase 2: GET 抓取 + 内容评分 ═══');
  const results = {};

  for (const [key, urls] of cityAlive) {
    const [prov, city] = key.split('|');
    let best = { url: '', score: 0, source: '' };

    // 先对子路径 URL（非首页）做检查，它们更可能直接是目标页面
    const subpathUrls = urls.filter(u => { try { return new URL(u).pathname !== '/'; } catch { return false; } });
    const homepageUrls = urls.filter(u => { try { return new URL(u).pathname === '/'; } catch { return false; } });

    // 先检查子路径
    for (const url of subpathUrls) {
      const r = await fetchGet(url, 6000);
      let html = '';
      if (r.ok && r.len > 300) html = r.data;
      else if (r.redirect) {
        const t = r.redirect.startsWith('http') ? r.redirect : (() => { try { return new URL(r.redirect, url).href; } catch { return null; } })();
        if (t) { const r2 = await fetchGet(t, 6000); if (r2.ok && r2.len > 300) html = r2.data; }
      }
      if (!html) continue;
      const score = scoreContent(html);
      if (score > best.score) { best = { url, score, source: classifySource(url) }; }
      if (best.score >= 8) break; // 足够好了
    }

    // 如果子路径没有好结果，检查首页并爬链接
    if (best.score < 5) {
      for (const url of homepageUrls) {
        const r = await fetchGet(url, 6000);
        if (!r.ok || r.len < 500) continue;
        const score = scoreContent(r.data);
        if (score > best.score) { best = { url, score, source: classifySource(url) }; }

        // Phase 3: 从首页提取财政相关链接
        const linksWithText = extractLinksWithText(r.data, url);
        const fiscalLinks = linksWithText.filter(l => isFiscalLink(l.url, l.text));

        if (fiscalLinks.length > 0) {
          // 只检查前 8 个财政相关链接
          for (const fl of fiscalLinks.slice(0, 8)) {
            const r3 = await fetchGet(fl.url, 6000);
            if (!r3.ok || r3.len < 300) continue;
            const s3 = scoreContent(r3.data);
            const combinedScore = s3 + 3; // 额外加分：从官方首页链出
            if (combinedScore > best.score) {
              best = { url: fl.url, score: combinedScore, source: classifySource(fl.url), linkText: fl.text };
            }
          }
        }
        if (best.score >= 5) break;
      }
    }

    if (!results[prov]) results[prov] = {};
    if (best.score > 0) {
      results[prov][city] = best;
      console.log(`  ✓ ${city} → ${best.url}  [${best.source}, score=${best.score}${best.linkText ? ', "' + best.linkText + '"' : ''}]`);
    } else if (best.url) {
      results[prov][city] = { ...best, note: '存活但未匹配' };
      console.log(`  ~ ${city} → ${best.url}  [存活但不确定]`);
    } else {
      console.log(`  ✗ ${city}: ${urls.length} 个存活URL无有效结果`);
    }
  }

  // 无存活城市
  const allKeys = allEntries.map(e => `${e.province}|${e.city}`);
  const noAlive = allKeys.filter(k => !cityAlive.has(k));
  console.log(`\n  无存活URL城市 (${noAlive.length}):`);
  for (const k of noAlive) {
    const [p, c] = k.split('|');
    console.log(`    ${p} → ${c}`);
    if (!results[p]) results[p] = {};
    results[p][c] = { url: '', score: 0, note: '所有候选域名无法连接' };
  }

  // ── 汇总 ──
  console.log('\n════════════════════════════════');
  let found = 0, maybe = 0, miss = 0;
  for (const [prov, cities] of Object.entries(results)) {
    for (const [city, info] of Object.entries(cities)) {
      if (info.score >= 5) found++;
      else if (info.score > 0) maybe++;
      else miss++;
    }
  }
  console.log(`确认找到: ${found}  可能找到: ${maybe}  未找到: ${miss}  总计: ${totalCities}`);

  const fs = await import('fs');
  fs.writeFileSync('scripts/validated-urls.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('结果已写入 scripts/validated-urls.json');
}

main().catch(console.error);
