/**
 * batch-validate-v3: 增强版批量 URL 验证
 * 修复：过滤外部域名（mof.gov.cn）、添加更多域名别名、改进评分
 */
import http from 'http';
import https from 'https';

const HEAD_TIMEOUT  = 3500;
const FETCH_TIMEOUT = 8000;
const CONCURRENCY   = 30;

// ── 黑名单：这些域名的链接不应作为城市结果 ──
const DOMAIN_BLACKLIST = ['mof.gov.cn', 'most.gov.cn', 'mca.gov.cn', 'gov.cn/zhengce',
  'www.gov.cn', 'baidu.com', 'weibo.com', 'toutiao.com'];

function headCheck(url) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    let parsed; try { parsed = new URL(url); } catch { return resolve({ url, alive: false }); }
    const opts = {
      method: 'HEAD', hostname: parsed.hostname,
      port: parsed.port || (url.startsWith('https') ? 443 : 80),
      path: parsed.pathname + parsed.search,
      timeout: HEAD_TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      rejectUnauthorized: false,
    };
    try {
      const req = mod.request(opts, res => {
        res.resume(); const s = res.statusCode;
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
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    try {
      const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, rejectUnauthorized: false }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400) { resolve({ ok: false, redirect: res.headers.location }); res.resume(); return; }
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

// ── 从 HTML 提取链接（带文本），过滤外部域名 ──
function extractFiscalLinks(html, baseUrl, allowedDomains) {
  const results = [];
  const re = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1], text = m[2].replace(/<[^>]+>/g, '').trim();
    if (href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) continue;
    let abs; try { abs = new URL(href, baseUrl).href; } catch { continue; }
    // 必须是 .gov.cn 且不在黑名单
    if (!abs.includes('.gov.cn')) continue;
    if (DOMAIN_BLACKLIST.some(b => abs.includes(b))) continue;
    // 链接文本或 URL 路径须含财政关键词
    const combined = abs.toLowerCase() + text;
    const hasFiscalKw = /预算|决算|财政|czj|czt|czzj|czxx|yjsgk|czyjsgk|czyjs|财务/.test(combined);
    if (hasFiscalKw) results.push({ url: abs, text });
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
  if (html.includes('市级预算')) s += 2;
  if (html.includes('市级决算')) s += 2;
  for (const kw of ['预算','决算','预决算','财政']) { if (html.includes(kw)) s += 1; }
  return s;
}

function classifySource(url) {
  if (/czj\.|czt\.|cz\.[a-z]/i.test(url)) return '财政局官网';
  if (/xxgk\.|gk\./i.test(url)) return '政务公开平台';
  if (/www\..+\.gov\.cn/i.test(url)) return '市政府官网';
  return '其他官方站点';
}

// ── 候选 URL ──
function genCandidates(domains) {
  const urls = new Set();
  for (const d of domains) {
    // 财政局 (http + https)
    for (const sub of ['czj','czt','cz']) {
      for (const proto of ['http','https']) {
        urls.add(`${proto}://${sub}.${d}.gov.cn/`);
        // 子路径
        for (const p of ['zwgk/yjsgk/','zwgk/yjs/','zfxxgk/fdzdgknr/czyjs/','xxgk/yjsgk/','zfxxgk/czyjs/','xxgk/czyjsgk/']) {
          urls.add(`${proto}://${sub}.${d}.gov.cn/${p}`);
        }
      }
    }
    // 特殊域名模式: czj 是子域名形式
    urls.add(`http://www.czj.${d}.gov.cn/`);
    urls.add(`https://www.czj.${d}.gov.cn/`);

    // 政府门户
    for (const proto of ['http','https']) {
      for (const p of [
        '', // 首页
        'zwgk/czzj/', 'zwgk/czxx/', 'zwgk/zdly/czzj/',
        'zwgk/zdlyxxgk/czyjshsgjf/', 'zwgk/czyjsgk/',
        'zfxxgk/fdzdgknr/czyjsgk/', 'zfxxgk/fdzdgknr/czyjs/',
        'zfxxgk/fdzdgknr/czxx/', 'zfxxgk/czxx/',
        'zfxxgk/czyjs/', 'xxgk/czgk/', 'xxgk/czxx/',
        'zfxxgk/zfxxgkml/czyjsgk/',
        'zwgk/zdlyxx/', // 重点领域信息
      ]) {
        urls.add(`${proto}://www.${d}.gov.cn/${p}`);
      }
    }
    // 政务公开子站
    for (const proto of ['http','https']) {
      urls.add(`${proto}://xxgk.${d}.gov.cn/`);
    }
    // 不带 www
    urls.add(`http://${d}.gov.cn/`);
    urls.add(`https://${d}.gov.cn/`);
  }
  return [...urls];
}

// ── 缺失数据（扩展域名别名）──
const MISSING = {
  河南省: {
    郑州市: ['zhengzhou','zz'],
    安阳市: ['anyang','ay'],
    濮阳市: ['puyang','py'],
    南阳市: ['nanyang','ny'],
  },
  湖北省: {
    宜昌市: ['yichang','yc'],
    黄冈市: ['huanggang','hg'],
    随州市: ['suizhou','sz'],
    仙桃市: ['xiantao','xt'],
    潜江市: ['qianjiang','qj'],
    天门市: ['tianmen','tm'],
    神农架林区: ['snj','shennongjia'],
  },
  湖南省: {
    衡阳市: ['hengyang','hy'],
    益阳市: ['yiyang','yy'],
    郴州市: ['chenzhou','cz'],
    永州市: ['yongzhou','yz'],
    怀化市: ['huaihua','hh'],
    娄底市: ['loudi','ld'],
    湘西土家族苗族自治州: ['xiangxi','xx'],
  },
  广西壮族自治区: {
    南宁市: ['nanning','nn'],
    柳州市: ['liuzhou','lz'],
    北海市: ['beihai','bh'],
    防城港市: ['fcg','fangchenggang'],
    贵港市: ['guigang','gg'],
    贺州市: ['hezhou','hz'],
    河池市: ['hechi','hc'],
    来宾市: ['laibin','lb'],
    崇左市: ['chongzuo','cz'],
  },
  贵州省: {
    安顺市: ['anshun','as'],
    毕节市: ['bijie','bj'],
    铜仁市: ['tongren','tr'],
    黔西南布依族苗族自治州: ['qxn','qianxinan'],
    黔南布依族苗族自治州: ['qiannan','qn'],
  },
  云南省: {
    玉溪市: ['yuxi','yx'],
    保山市: ['baoshan','bs'],
    昭通市: ['zhaotong','zt'],
    丽江市: ['lijiang','lj'],
    普洱市: ['puer','pe'],
    临沧市: ['lincang','lc'],
    楚雄彝族自治州: ['chuxiong','cx'],
    红河哈尼族彝族自治州: ['honghe','hh'],
    西双版纳傣族自治州: ['xsbn','banna'],
    大理白族自治州: ['dali','dl'],
    德宏傣族景颇族自治州: ['dehong','dh'],
    怒江傈僳族自治州: ['nujiang','nj'],
    迪庆藏族自治州: ['diqing','dq'],
  },
  西藏自治区: {
    林芝市: ['linzhi','lz'],
    那曲市: ['naqu','nq'],
  },
  甘肃省: {
    金昌市: ['jinchang','jc'],
    白银市: ['baiyin','by'],
    天水市: ['tianshui','ts'],
    武威市: ['wuwei','ww'],
    张掖市: ['zhangye','zy'],
    庆阳市: ['qingyang','qy'],
    陇南市: ['longnan','ln'],
    临夏回族自治州: ['linxia','lx'],
    甘南藏族自治州: ['gannan','gn'],
  },
  青海省: {
    海东市: ['haidong','hd'],
    海北藏族自治州: ['haibei','hb'],
    黄南藏族自治州: ['huangnan','hn'],
    海南藏族自治州: ['hainan'],
    果洛藏族自治州: ['guoluo','gl'],
    玉树藏族自治州: ['yushu','ys'],
  },
  宁夏回族自治区: {
    石嘴山市: ['shizuishan','szs'],
    吴忠市: ['wuzhong','wz'],
    固原市: ['guyuan','gy'],
    中卫市: ['zhongwei','zw'],
  },
  吉林省: {
    吉林市: ['jlcity','jilin'],
    四平市: ['siping','sp'],
    通化市: ['tonghua','th'],
    白山市: ['baishan','bs'],
    松原市: ['songyuan','sy'],
    白城市: ['baicheng','bc'],
  },
  黑龙江省: {
    鸡西市: ['jixi','jx'],
    鹤岗市: ['hegang','hg'],
    双鸭山市: ['shuangyashan','sys'],
    绥化市: ['suihua','sh'],
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
  for (const e of allEntries) {
    for (const url of e.urls) {
      urlCityMap.set(url, { province: e.province, city: e.city, domains: e.domains });
      headTasks.push(() => headCheck(url));
    }
  }
  const t0 = Date.now();
  const headResults = await pool(headTasks, CONCURRENCY);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const alive = headResults.filter(r => r.alive);
  const redir = headResults.filter(r => r.redirect);
  console.log(`  ${totalUrls} URLs checked in ${elapsed}s`);
  console.log(`  存活: ${alive.length}  重定向: ${redir.length}  死链: ${totalUrls - alive.length - redir.length}`);

  // 按城市归组存活 URL
  const cityAlive = new Map();
  for (const r of alive) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAlive.has(key)) cityAlive.set(key, { urls: [], domains: info.domains });
    cityAlive.get(key).urls.push(r.url);
  }
  for (const r of redir) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAlive.has(key)) cityAlive.set(key, { urls: [], domains: info.domains });
    let target; try { target = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, r.url).href; } catch { continue; }
    if (!DOMAIN_BLACKLIST.some(b => target.includes(b))) cityAlive.get(key).urls.push(target);
  }
  const withAlive = [...cityAlive].filter(([,v]) => v.urls.length > 0).length;
  console.log(`  有存活的城市: ${withAlive}/${totalCities}\n`);

  // ═══ Phase 2+3: GET + 爬链接 ═══
  console.log('═══ Phase 2: GET + 链接爬取 ═══');
  const results = {};
  const noAliveSet = new Set(allEntries.map(e => `${e.province}|${e.city}`));

  for (const [key, { urls, domains }] of cityAlive) {
    noAliveSet.delete(key);
    const [prov, city] = key.split('|');
    let best = { url: '', score: 0, source: '', linkText: '' };

    // 子路径优先
    const sub = urls.filter(u => { try { return new URL(u).pathname.length > 2; } catch { return false; } });
    const home = urls.filter(u => { try { return new URL(u).pathname.length <= 2; } catch { return false; } });

    for (const url of sub) {
      const r = await fetchGet(url, 6000);
      let html = r.ok && r.len > 300 ? r.data : '';
      if (!html && r.redirect) {
        let t; try { t = new URL(r.redirect, url).href; } catch { continue; }
        if (DOMAIN_BLACKLIST.some(b => t.includes(b))) continue;
        const r2 = await fetchGet(t, 6000);
        if (r2.ok && r2.len > 300) html = r2.data;
      }
      if (!html) continue;
      const score = scoreContent(html);
      if (score > best.score) best = { url, score, source: classifySource(url) };
      if (best.score >= 8) break;
    }

    if (best.score < 5) {
      for (const url of home) {
        const r = await fetchGet(url, 6000);
        if (!r.ok || r.len < 500) continue;
        const homeScore = scoreContent(r.data);
        if (homeScore > best.score) best = { url, score: homeScore, source: classifySource(url) };

        // 爬链接 — 只爬同域或本城市域名
        const fiscalLinks = extractFiscalLinks(r.data, url, domains);
        for (const fl of fiscalLinks.slice(0, 10)) {
          // 过滤外部域名
          if (DOMAIN_BLACKLIST.some(b => fl.url.includes(b))) continue;
          const r3 = await fetchGet(fl.url, 6000);
          if (!r3.ok || r3.len < 300) continue;
          const s3 = scoreContent(r3.data) + 2;
          if (s3 > best.score) best = { url: fl.url, score: s3, source: classifySource(fl.url), linkText: fl.text };
        }
        if (best.score >= 5) break;
      }
    }

    if (!results[prov]) results[prov] = {};
    if (best.score >= 3) {
      results[prov][city] = best;
      console.log(`  ✓ ${city} → ${best.url}  [${best.source}, score=${best.score}${best.linkText ? `, "${best.linkText}"` : ''}]`);
    } else {
      results[prov][city] = { url: best.url || '', score: best.score, note: best.url ? '存活但内容不匹配' : '无有效结果' };
      console.log(`  ✗ ${city}: ${urls.length} 个存活URL${best.url ? '内容不匹配' : '无有效结果'}`);
    }
  }

  // 无存活
  for (const key of noAliveSet) {
    const [prov, city] = key.split('|');
    if (!results[prov]) results[prov] = {};
    results[prov][city] = { url: '', score: 0, note: '所有候选域名无法连接' };
    console.log(`  ✗ ${city}: 域名无法连接`);
  }

  // ── 汇总 ──
  console.log('\n════════════════════════════════');
  let found = 0, miss = 0;
  const foundList = [], missList = [];
  for (const [prov, cities] of Object.entries(results)) {
    for (const [city, info] of Object.entries(cities)) {
      if (info.score >= 3) { found++; foundList.push({ prov, city, ...info }); }
      else { miss++; missList.push({ prov, city, note: info.note }); }
    }
  }
  console.log(`\n找到: ${found}  未找到: ${miss}  总计: ${totalCities}`);
  console.log('\n── 找到的城市 ──');
  for (const f of foundList) console.log(`  ${f.prov} ${f.city}: ${f.url}  [${f.source}]`);
  console.log('\n── 未找到的城市 ──');
  for (const m of missList) console.log(`  ${m.prov} ${m.city} (${m.note})`);

  const fs = await import('fs');
  fs.writeFileSync('scripts/validated-urls.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('\n结果已写入 scripts/validated-urls.json');
}

main().catch(console.error);
