/**
 * 两阶段批量 URL 检验脚本
 * Phase 1: 并发 HEAD 请求（3s 超时），快速筛出存活 URL
 * Phase 2: 对存活 URL 做 GET 抓取，检查页面内容是否包含财政预决算关键词
 */
import http from 'http';
import https from 'https';

// ── 配置 ────────────────────────────────────
const HEAD_TIMEOUT  = 3000;   // HEAD 超时 (ms)
const FETCH_TIMEOUT = 8000;   // GET 超时 (ms)
const CONCURRENCY   = 30;     // Phase 1 并发数
const BUDGET_KEYWORDS = ['预算', '决算', '预决算', '财政', '财务'];

// ── HTTP 工具 ──────────────────────────────
function headCheck(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const opts = {
      method: 'HEAD',
      hostname: parsed.hostname,
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
        resolve({
          url,
          alive: s >= 200 && s < 400,
          status: s,
          redirect: (s >= 300 && s < 400) ? res.headers.location : null,
        });
      });
      req.on('error', () => resolve({ url, alive: false, status: 0, err: 'error' }));
      req.on('timeout', () => { req.destroy(); resolve({ url, alive: false, status: 0, err: 'timeout' }); });
      req.end();
    } catch { resolve({ url, alive: false, status: 0, err: 'exception' }); }
  });
}

function fetchGet(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = {
      timeout: FETCH_TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      rejectUnauthorized: false,
    };
    try {
      const req = mod.get(url, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ ok: false, redirect: res.headers.location, status: res.statusCode });
          res.resume(); return;
        }
        if (res.statusCode >= 400) { resolve({ ok: false, status: res.statusCode }); res.resume(); return; }
        let data = '';
        res.setEncoding('utf-8');
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ ok: true, data, len: data.length }));
      });
      req.on('error', (e) => resolve({ ok: false, err: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: 'timeout' }); });
    } catch (e) { resolve({ ok: false, err: e.message }); }
  });
}

// ── 并发控制 ──────────────────────────────
async function pool(tasks, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

// ── 候选 URL 生成 ─────────────────────────
function generateCandidates(domains) {
  const urls = [];
  for (const d of domains) {
    // 1. 财政局官网首页
    urls.push(`http://czj.${d}.gov.cn/`);
    urls.push(`https://czj.${d}.gov.cn/`);
    urls.push(`http://czt.${d}.gov.cn/`);
    urls.push(`http://cz.${d}.gov.cn/`);

    // 2. 财政局 预决算公开栏目
    urls.push(`http://czj.${d}.gov.cn/zwgk/yjsgk/`);
    urls.push(`http://czj.${d}.gov.cn/zwgk/yjs/`);
    urls.push(`http://czj.${d}.gov.cn/zfxxgk/fdzdgknr/czyjs/`);
    urls.push(`http://czj.${d}.gov.cn/xxgk/yjsgk/`);

    // 3. 政府官网 — 财政信息公开栏目（兜底路径）
    urls.push(`http://www.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`https://www.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/czxx/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/zdly/czzj/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/zdlyxxgk/czyjshsgjf/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/czyjsgk/`);
    urls.push(`http://www.${d}.gov.cn/zfxxgk/fdzdgknr/czyjsgk/`);
    urls.push(`http://www.${d}.gov.cn/zfxxgk/fdzdgknr/czyjs/`);
    urls.push(`https://www.${d}.gov.cn/zfxxgk/fdzdgknr/czyjsgk/`);
    urls.push(`https://www.${d}.gov.cn/zfxxgk/fdzdgknr/czyjs/`);

    // 4. 政务公开信息子站
    urls.push(`http://xxgk.${d}.gov.cn/`);
    urls.push(`http://xxgk.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`http://gk.${d}.gov.cn/`);
  }
  return urls;
}

// ── 缺失城市数据 ────────────────────────────
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
    双鸭山市: ['shuangyashan'],
    绥化市: ['suihua'],
  },
  海南省: {
    三沙市: ['sansha'],
  },
};

// ── 主流程 ──────────────────────────────────
async function main() {
  // 统计
  let totalCities = 0;
  const allEntries = []; // { province, city, urls: string[] }

  for (const [prov, cities] of Object.entries(MISSING)) {
    for (const [city, domains] of Object.entries(cities)) {
      totalCities++;
      allEntries.push({ province: prov, city, urls: generateCandidates(domains) });
    }
  }

  const totalUrls = allEntries.reduce((s, e) => s + e.urls.length, 0);
  console.log(`共 ${totalCities} 个城市，${totalUrls} 个候选 URL\n`);

  // ══════ Phase 1: HEAD 并发检测存活 ══════
  console.log('═══ Phase 1: HEAD 检测存活 URL ═══');
  const allHeadTasks = [];
  const urlCityMap = new Map(); // url → { province, city }

  for (const entry of allEntries) {
    for (const url of entry.urls) {
      urlCityMap.set(url, { province: entry.province, city: entry.city });
      allHeadTasks.push(() => headCheck(url));
    }
  }

  const headResults = await pool(allHeadTasks, CONCURRENCY);

  // 统计存活
  const alive = headResults.filter(r => r.alive);
  const redirects = headResults.filter(r => !r.alive && r.redirect);
  const dead = headResults.filter(r => !r.alive && !r.redirect);

  console.log(`  存活: ${alive.length}  重定向: ${redirects.length}  死链: ${dead.length}`);

  // 按城市分组存活 URL
  const cityAliveUrls = new Map(); // "province|city" → url[]
  for (const r of alive) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAliveUrls.has(key)) cityAliveUrls.set(key, []);
    cityAliveUrls.get(key).push(r.url);
  }
  // 也把重定向目标加进去
  for (const r of redirects) {
    const info = urlCityMap.get(r.url);
    const key = `${info.province}|${info.city}`;
    if (!cityAliveUrls.has(key)) cityAliveUrls.set(key, []);
    const target = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, r.url).href;
    cityAliveUrls.get(key).push(target);
  }

  const citiesWithAlive = cityAliveUrls.size;
  const citiesNoAlive = totalCities - citiesWithAlive;
  console.log(`  有存活URL的城市: ${citiesWithAlive}  无任何存活: ${citiesNoAlive}\n`);

  // 列出无任何存活 URL 的城市
  const allKeys = allEntries.map(e => `${e.province}|${e.city}`);
  const noAliveKeys = allKeys.filter(k => !cityAliveUrls.has(k));
  if (noAliveKeys.length > 0) {
    console.log('  ✗ 无存活URL城市:');
    for (const k of noAliveKeys) {
      const [p, c] = k.split('|');
      console.log(`    ${p} → ${c}`);
    }
    console.log('');
  }

  // ══════ Phase 2: GET 抓取存活 URL，检查内容 ══════
  console.log('═══ Phase 2: GET 抓取存活 URL ═══');
  const foundResults = {}; // province → { city → { url, source } }

  for (const [key, urls] of cityAliveUrls) {
    const [province, city] = key.split('|');
    if (!foundResults[province]) foundResults[province] = {};

    let bestUrl = '';
    let bestSource = '';
    let bestScore = 0;

    for (const url of urls) {
      const r = await fetchGet(url);
      if (r.redirect) {
        const target = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, url).href;
        const r2 = await fetchGet(target);
        if (r2.ok && r2.len > 500) {
          const score = scoreContent(r2.data, target);
          if (score > bestScore) {
            bestScore = score;
            bestUrl = target;
            bestSource = classifySource(target);
          }
        }
        continue;
      }
      if (!r.ok || r.len < 500) continue;

      const score = scoreContent(r.data, url);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = url;
        bestSource = classifySource(url);
      }
    }

    if (bestUrl && bestScore > 0) {
      foundResults[province][city] = { url: bestUrl, source: bestSource, score: bestScore };
      console.log(`  ✓ ${city} → ${bestUrl}  [${bestSource}, score=${bestScore}]`);
    } else if (bestUrl) {
      // URL 活着但内容不含财政关键词 — 也记录
      foundResults[province][city] = { url: bestUrl, source: classifySource(bestUrl), score: 0, note: '存活但未匹配财政关键词' };
      console.log(`  ~ ${city} → ${bestUrl}  [存活但不确定是预决算页面]`);
    } else {
      console.log(`  ✗ ${city}: ${urls.length} 个存活URL均无有效内容`);
    }
  }

  // ── 汇总 ──
  console.log('\n════════════════════════════════');
  console.log('汇总结果:\n');

  let totalFound = 0, totalMaybe = 0;
  for (const [prov, cities] of Object.entries(foundResults)) {
    const confirmed = Object.entries(cities).filter(([,v]) => v.score > 0);
    const maybe = Object.entries(cities).filter(([,v]) => v.score === 0);
    if (confirmed.length + maybe.length === 0) continue;

    console.log(`${prov}:`);
    for (const [city, info] of confirmed) {
      totalFound++;
      console.log(`  ✓ ${city}: ${info.url}  [${info.source}]`);
    }
    for (const [city, info] of maybe) {
      totalMaybe++;
      console.log(`  ~ ${city}: ${info.url}  [${info.source}, 待人工确认]`);
    }
  }
  console.log(`\n确认: ${totalFound}  待确认: ${totalMaybe}  总计: ${totalFound + totalMaybe}/${totalCities}`);

  // 输出 JSON 供后续脚本使用
  const output = {};
  for (const [prov, cities] of Object.entries(foundResults)) {
    for (const [city, info] of Object.entries(cities)) {
      if (!output[prov]) output[prov] = {};
      output[prov][city] = info;
    }
  }
  const fs = await import('fs');
  fs.writeFileSync('scripts/validated-urls.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log('\n结果已写入 scripts/validated-urls.json');
}

// ── 内容评分 ──────────────────────────────
function scoreContent(html, url) {
  let score = 0;
  for (const kw of BUDGET_KEYWORDS) {
    if (html.includes(kw)) score += 2;
  }
  // 特殊加分
  if (html.includes('预决算公开')) score += 5;
  if (html.includes('预算公开')) score += 3;
  if (html.includes('决算公开')) score += 3;
  if (html.includes('部门预算')) score += 2;
  if (html.includes('部门决算')) score += 2;
  if (html.includes('一般公共预算')) score += 3;
  if (html.includes('政府性基金预算')) score += 3;
  // URL 路径加分
  if (/yjs|czjs|yjsgk|czyjsgk/i.test(url)) score += 2;
  return score;
}

// ── URL 来源分类 ─────────────────────────
function classifySource(url) {
  if (/czj\.|czt\.|cz\./i.test(url)) return '财政局官网';
  if (/xxgk\.|gk\./i.test(url)) return '政务公开平台';
  if (/www\..+\.gov\.cn/i.test(url)) return '市政府官网';
  return '其他官方站点';
}

main().catch(console.error);
