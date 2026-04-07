import http from 'http';
import https from 'https';

function fetch(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } };
    if (url.startsWith('https')) opts.rejectUnauthorized = false;
    try {
      const req = mod.get(url, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ ok: false, status: res.statusCode, redirect: res.headers.location });
          res.resume(); return;
        }
        if (res.statusCode >= 400) { resolve({ ok: false, status: res.statusCode }); res.resume(); return; }
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ ok: true, data, len: data.length }));
      });
      req.on('error', (e) => resolve({ ok: false, err: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: 'timeout' }); });
    } catch (e) { resolve({ ok: false, err: e.message }); }
  });
}

async function tryUrls(urls) {
  const results = [];
  for (const url of urls) {
    const r = await fetch(url, 6000);
    if (r.ok && r.len > 500) return { url, results };
    if (!r.ok && r.redirect) {
      const redir = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, url).href;
      const r2 = await fetch(redir, 6000);
      if (r2.ok && r2.len > 500) return { url: redir, results };
    }
    results.push(`${url}→${r.ok?r.len:r.status||r.err}`);
  }
  return { url: '', results };
}

// Extended patterns: city-specific domains, gov portal variants, fiscal dept subdomains
function extendedCandidates(domains, extraDomains = []) {
  const urls = [];
  const all = [...domains, ...extraDomains];
  for (const d of all) {
    // Tier 2: Dedicated fiscal bureau
    urls.push(`http://czj.${d}.gov.cn/`);
    urls.push(`https://czj.${d}.gov.cn/`);
    urls.push(`http://czt.${d}.gov.cn/`);
    urls.push(`https://czt.${d}.gov.cn/`);
    urls.push(`http://cz.${d}.gov.cn/`);
    urls.push(`https://cz.${d}.gov.cn/`);
    // Tier 3: City portal fiscal section
    urls.push(`https://www.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`https://www.${d}.gov.cn/zwgk/czxx/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/czxx/`);
    urls.push(`https://www.${d}.gov.cn/zwgk/zdly/czzj/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/zdlyxxgk/czyjshsgjf/`);
  }
  return urls;
}

const MISSING = {
  河南省: {
    郑州市: { d: ['zhengzhou','zz'], extra: ['zzjj'] },
    安阳市: { d: ['anyang','ay'], extra: [] },
    濮阳市: { d: ['puyang','py'], extra: [] },
    南阳市: { d: ['nanyang','ny'], extra: [] },
  },
  湖北省: {
    宜昌市: { d: ['yichang','yc'], extra: [] },
    黄冈市: { d: ['huanggang','hg'], extra: [] },
    随州市: { d: ['suizhou','sz'], extra: [] },
    仙桃市: { d: ['xiantao','xt'], extra: [] },
    潜江市: { d: ['qianjiang','qj-hb'], extra: [] },
    天门市: { d: ['tianmen','tm'], extra: [] },
    神农架林区: { d: ['snj','shennongjia'], extra: [] },
  },
  湖南省: {
    衡阳市: { d: ['hengyang','hy'], extra: [] },
    益阳市: { d: ['yiyang','yy-hn'], extra: [] },
    郴州市: { d: ['chenzhou','cz-hn'], extra: [] },
    永州市: { d: ['yongzhou','yz'], extra: [] },
    怀化市: { d: ['huaihua','hh'], extra: [] },
    娄底市: { d: ['loudi','ld'], extra: [] },
    湘西土家族苗族自治州: { d: ['xiangxi','xx'], extra: [] },
  },
  广西壮族自治区: {
    南宁市: { d: ['nanning','nn'], extra: [] },
    柳州市: { d: ['liuzhou','lz-gx'], extra: [] },
    北海市: { d: ['beihai','bh'], extra: [] },
    防城港市: { d: ['fcg','fangchenggang'], extra: [] },
    贵港市: { d: ['guigang','gg'], extra: [] },
    贺州市: { d: ['hezhou','hz'], extra: [] },
    河池市: { d: ['hechi','hc'], extra: [] },
    来宾市: { d: ['laibin','lb'], extra: [] },
    崇左市: { d: ['chongzuo','cz-gx'], extra: [] },
  },
  贵州省: {
    安顺市: { d: ['anshun','as'], extra: [] },
    毕节市: { d: ['bijie','bj'], extra: [] },
    铜仁市: { d: ['tongren','tr'], extra: [] },
    黔西南布依族苗族自治州: { d: ['qxn','qianxinan'], extra: [] },
    黔南布依族苗族自治州: { d: ['qn','qiannan'], extra: [] },
  },
  云南省: {
    玉溪市: { d: ['yuxi','yx'], extra: [] },
    保山市: { d: ['baoshan','bs'], extra: [] },
    昭通市: { d: ['zhaotong','zt'], extra: [] },
    丽江市: { d: ['lijiang','lj'], extra: [] },
    普洱市: { d: ['puer','pe'], extra: [] },
    临沧市: { d: ['lincang','lc'], extra: [] },
    楚雄彝族自治州: { d: ['chuxiong','cx'], extra: [] },
    红河哈尼族彝族自治州: { d: ['honghe','hh-yn'], extra: [] },
    西双版纳傣族自治州: { d: ['xsbn','banna'], extra: [] },
    大理白族自治州: { d: ['dali','dl-yn'], extra: [] },
    德宏傣族景颇族自治州: { d: ['dehong','dh'], extra: [] },
    怒江傈僳族自治州: { d: ['nujiang','nj'], extra: [] },
    迪庆藏族自治州: { d: ['diqing','dq'], extra: [] },
  },
  西藏自治区: {
    林芝市: { d: ['linzhi','lz-xz'], extra: [] },
    那曲市: { d: ['naqu','nq'], extra: [] },
  },
  甘肃省: {
    金昌市: { d: ['jinchang','jc'], extra: [] },
    白银市: { d: ['baiyin','by'], extra: [] },
    天水市: { d: ['tianshui','ts'], extra: [] },
    武威市: { d: ['wuwei','ww'], extra: [] },
    张掖市: { d: ['zhangye','zy'], extra: [] },
    庆阳市: { d: ['qingyang','qy'], extra: [] },
    陇南市: { d: ['longnan','ln-gs'], extra: [] },
    临夏回族自治州: { d: ['linxia','lx'], extra: [] },
    甘南藏族自治州: { d: ['gannan','gn'], extra: [] },
  },
  青海省: {
    海东市: { d: ['haidong','hd'], extra: [] },
    海北藏族自治州: { d: ['haibei','hb-qh'], extra: [] },
    黄南藏族自治州: { d: ['huangnan','hn'], extra: [] },
    海南藏族自治州: { d: ['hainan-qh'], extra: [] },
    果洛藏族自治州: { d: ['guoluo','gl'], extra: [] },
    玉树藏族自治州: { d: ['yushu','ys'], extra: [] },
  },
  宁夏回族自治区: {
    石嘴山市: { d: ['szs','shizuishan'], extra: [] },
    吴忠市: { d: ['wuzhong','wz-nx'], extra: [] },
    固原市: { d: ['guyuan','gy-nx'], extra: [] },
    中卫市: { d: ['zhongwei','zw'], extra: [] },
  },
};

async function main() {
  let total = 0, found = 0;
  const foundUrls = {};
  
  for (const [prov, cities] of Object.entries(MISSING)) {
    console.log(`\n=== ${prov} ===`);
    foundUrls[prov] = {};
    for (const [city, {d, extra}] of Object.entries(cities)) {
      total++;
      // Only use clean domain names (no hyphens in actual domains)
      const cleanDomains = d.filter(x => !x.includes('-'));
      const urls = extendedCandidates(cleanDomains, extra);
      const {url, results} = await tryUrls(urls);
      if (url) {
        found++;
        foundUrls[prov][city] = url;
        console.log(`  ✓ ${city} → ${url}`);
      } else {
        console.log(`  ✗ ${city} [${results.slice(0,5).join(', ')}]`);
      }
    }
  }
  
  console.log(`\n════════════════════════════════`);
  console.log(`Total: ${found}/${total} found`);
  console.log(JSON.stringify(foundUrls, null, 2));
}

main();
