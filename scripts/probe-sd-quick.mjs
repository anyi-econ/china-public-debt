// Quick probe - homepage only, then fiscal paths for responsive sites
const COUNTIES = [
  { city: "DZ", county: "NJ", url: "http://www.sdningjin.gov.cn" },
  { city: "DZ", county: "QY", url: "http://www.qingyun.gov.cn" },
  { city: "DZ", county: "LYX", url: "http://www.linyixian.gov.cn" },
  { city: "DZ", county: "QH", url: "http://www.qihe.gov.cn" },
  { city: "DZ", county: "PY", url: "http://www.zgpingyuan.gov.cn" },
  { city: "DZ", county: "XJ", url: "http://www.xiajin.gov.cn" },
  { city: "DZ", county: "WC", url: "http://www.wucheng.gov.cn" },
  { city: "DZ", county: "YC", url: "http://www.yucheng.gov.cn" },
  { city: "DZ", county: "LL", url: "http://www.laoling.gov.cn" },
  { city: "LC", county: "DCF", url: "http://www.dongchangfu.gov.cn" },
  { city: "LC", county: "CP", url: "http://www.chiping.gov.cn" },
  { city: "LC", county: "YGu", url: "http://www.yanggu.gov.cn" },
  { city: "LC", county: "SX", url: "http://www.shenxian.gov.cn" },
  { city: "LC", county: "DA", url: "http://www.donge.gov.cn" },
  { city: "LC", county: "GX", url: "http://www.guanxian.gov.cn" },
  { city: "LC", county: "GT", url: "http://www.gaotang.gov.cn" },
  { city: "BZ", county: "BC", url: "http://www.bincheng.gov.cn" },
  { city: "BZ", county: "ZH", url: "http://www.zhanhua.gov.cn" },
  { city: "BZ", county: "HM", url: "http://www.huimin.gov.cn" },
  { city: "BZ", county: "YXin", url: "http://www.yangxin.gov.cn" },
  { city: "BZ", county: "WD", url: "http://www.wudi.gov.cn" },
  { city: "BZ", county: "BX", url: "http://www.boxing.gov.cn" },
  { city: "BZ", county: "ZP", url: "http://www.zouping.gov.cn" },
  { city: "HZ", county: "MD", url: "http://www.mudan.gov.cn" },
  { city: "HZ", county: "DT", url: "http://www.dingtao.gov.cn" },
  { city: "HZ", county: "CaoX", url: "http://www.caoxian.gov.cn" },
  { city: "HZ", county: "ShanX", url: "http://www.shanxian.gov.cn" },
  { city: "HZ", county: "CW", url: "http://www.chengwu.gov.cn" },
  { city: "HZ", county: "JY", url: "http://www.juye.gov.cn" },
  { city: "HZ", county: "YunC", url: "http://www.yuncheng.gov.cn" },
  { city: "HZ", county: "JuanC", url: "http://www.juancheng.gov.cn" },
  { city: "HZ", county: "DM", url: "http://www.dongming.gov.cn" },
];

async function probe(url, timeout = 6000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, { 
      signal: ac.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    clearTimeout(t);
    const status = res.status;
    if (status >= 300 && status < 400) {
      return { status, redirect: res.headers.get('location'), len: 0, body: '' };
    }
    const text = await res.text();
    return { status, len: text.length, body: text };
  } catch (e) {
    clearTimeout(t);
    return { status: 0, error: e.message?.slice(0, 60), len: 0, body: '' };
  }
}

function findFiscalLinks(html) {
  const results = [];
  // Match href before text that contains fiscal keywords
  const patterns = [
    /href=["']([^"']+?)["'][^>]*>[^<]*(?:财政信息|财政预决算|财政预算|预算公开|预决算公开)[^<]*/gi,
    /href=["']([^"']+?)["'][^>]*>[^<]*(?:财政资金|财政收支)[^<]*/gi,
    /href=["']((?:[^"']*?)(?:czxx|czyjs|czyjsgk|czzj|caizhen|caizheng)(?:[^"']*?))["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!results.find(r => r.href === m[1])) {
        results.push({ href: m[1] });
      }
    }
  }
  return results;
}

const PATHS = [
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/',
  '/zwgk/czxx/',
  '/zwgk/fdzdgknr/czyjs/',
  '/xxgk/czyjs/',
  '/xxgk/czxx/',
  '/czyjs/',
  '/czxx/',
];

async function checkCounty(c) {
  // 1. Homepage
  const home = await probe(c.url + '/', 8000);
  let links = [];
  let pathHits = [];
  
  if (home.status === 200 && home.body) {
    links = findFiscalLinks(home.body);
  }
  
  // 2. Try common paths (only if homepage didn't yield clear results)
  if (links.length === 0 && home.status === 200) {
    for (const p of PATHS) {
      const r = await probe(c.url + p, 5000);
      if (r.status === 200 && r.len > 1000 && /预算|决算/.test(r.body)) {
        const isHome = /首页.*走进/.test(r.body);
        if (!isHome) {
          pathHits.push(p);
          break; // first hit is enough
        }
      }
    }
  }
  
  return { city: c.city, county: c.county, url: c.url, homeStatus: home.status,
    homeRedirect: home.redirect || '', links, pathHits };
}

async function main() {
  console.log('Starting probe of', COUNTIES.length, 'counties...');
  const results = [];
  
  // Process 3 at a time
  for (let i = 0; i < COUNTIES.length; i += 3) {
    const batch = COUNTIES.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(checkCounty));
    for (const r of batchResults) {
      results.push(r);
      const label = `${r.city}/${r.county}`;
      let info = `home=${r.homeStatus}`;
      if (r.homeRedirect) info += ` redir=${r.homeRedirect}`;
      if (r.links.length > 0) info += ` LINKS=${JSON.stringify(r.links.map(l=>l.href))}`;
      if (r.pathHits.length > 0) info += ` PATHS=${r.pathHits.join(',')}`;
      if (r.links.length === 0 && r.pathHits.length === 0) info += ' NONE';
      console.log(`${label}: ${info}`);
    }
  }
  
  // Write results
  const fs = await import('fs');
  fs.writeFileSync('scripts/shandong-batch-results.json', JSON.stringify(results, null, 2));
  console.log('Done. Saved to scripts/shandong-batch-results.json');
}

main();
