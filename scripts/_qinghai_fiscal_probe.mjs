import https from 'https';
import http from 'http';

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const fiscalRe = /预决算|预算决算|财政预决算|预算公开|决算公开|财政资金|财政信息|财政收支/;
const bodyRe = /预决算|预算决算|财政预决算|预算公开|决算公开|政府预算|部门预算|财政资金|财政信息|财政收支/g;

function fetchUrl(url, timeout = 8000, maxRedirects = 2) {
  return new Promise((resolve, reject) => {
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
          res.resume();
          try {
            const loc = res.headers.location;
            const rurl = loc.startsWith('http') ? loc : new URL(loc, url).href;
            fetchUrl(rurl, timeout, maxRedirects - 1).then(resolve, reject);
          } catch(e) { reject(e); }
          return;
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({ body: Buffer.concat(chunks).toString('utf-8'), status: res.statusCode }));
        res.on('error', e => reject(e));
      });
      req.on('error', e => reject(e));
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    } catch(e) { reject(e); }
  });
}

const paths = [
  '/zfxxgk/fdzdgknr/czxx/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/ysjs/',
  '/zfxxgk/fdzdgknr/ysjs/index.html',
  '/zfxxgk/fdzdgknr/cwxx/',
  '/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/fdzdgknr/czzj/',
  '/zwgk/fdzdgknr/ysjs/',
  '/zwgk/czxx/',
  '/zwgk/czzj/',
  '/zwgk/czyjs/',
  '/zwgk/czyjs/',
  '/zwgk/zdxxgk/czxx/',
  '/xxgk/fdzdgknr/czxx/',
  '/xxgk/fdzdgknr/ysjs/',
  '/xxgk/fgwj/ysjs/',
  '/xxgk/czxx/',
  '/xxgk/ysjs/',
  '/gk/fdzdgknr/czxx/',
  '/gk/fdzdgknr/ysjs/',
  '/FDZDGKNR/ysjs/index.html',
  '/fdzdgknr/ysjs/index.html',
  '/fdzdgknr/czxx/index.html',
];

const counties = [
  // Xining
  ['城东区', 'http://www.xncd.gov.cn'],
  ['城中区', 'https://xncz.gov.cn'],
  ['城西区', 'https://www.xncx.gov.cn'],
  ['城北区', 'http://www.xncbq.gov.cn'],
  ['湟中区', 'https://www.xnhzq.gov.cn'],
  ['大通回族土族自治县', 'https://www.datong.gov.cn'],
  ['湟源县', 'https://www.huangyuan.gov.cn'],
  // Haidong
  ['乐都区', 'https://www.ledu.gov.cn'],
  ['平安区', 'https://www.pinganqu.gov.cn'],
  ['民和回族土族自治县', 'http://www.minhe.gov.cn'],
  ['互助土族自治县', 'http://www.huzhu.gov.cn'],
  ['化隆回族自治县', 'http://www.hualong.gov.cn'],
  ['循化撒拉族自治县', 'http://www.xunhua.gov.cn'],
  // Haibei
  ['门源回族自治县', 'http://www.menyuan.gov.cn'],
  ['祁连县', 'http://www.qilian.gov.cn'],
  ['海晏县', 'http://www.haiyanxian.gov.cn'],
  ['刚察县', 'https://www.gangcha.gov.cn'],
  // Huangnan
  ['同仁市', 'http://www.hntongren.gov.cn'],
  ['尖扎县', 'http://www.jianzha.gov.cn'],
  ['泽库县', 'http://www.zeku.gov.cn'],
  ['河南蒙古族自治县', 'http://www.henanxian.gov.cn'],
  // Hainan
  ['共和县', 'https://www.gonghe.gov.cn'],
  ['同德县', 'https://www.tongde.gov.cn'],
  ['贵德县', 'https://www.guide.gov.cn'],
  ['兴海县', 'https://www.xinghai.gov.cn'],
  ['贵南县', 'https://www.guinan.gov.cn'],
  // Guoluo
  ['玛沁县', 'http://www.maqin.gov.cn'],
  ['班玛县', 'http://www.banma.gov.cn'],
  ['甘德县', 'http://www.gande.gov.cn'],
  ['达日县', 'http://www.dari.gov.cn'],
  ['久治县', 'http://www.jiuzhixian.gov.cn'],
  ['玛多县', 'http://www.maduo.gov.cn'],
  // Yushu
  ['玉树市', 'http://www.yss.gov.cn'],
  ['杂多县', 'http://www.qhzaduo.gov.cn'],
  ['称多县', 'http://www.qhcd.gov.cn'],
  ['治多县', 'http://www.zhiduo.gov.cn'],
  ['囊谦县', 'http://www.nangqian.gov.cn'],
  ['曲麻莱县', 'http://www.qml.gov.cn'],
  // Haixi
  ['格尔木市', 'https://www.geermu.gov.cn'],
  ['德令哈市', 'http://www.delingha.gov.cn'],
  ['茫崖市', 'https://www.mangya.gov.cn'],
  ['乌兰县', 'http://www.wulanxian.gov.cn'],
  ['都兰县', 'http://www.dulan.gov.cn'],
  ['天峻县', 'http://www.tianjun.gov.cn'],
];

(async () => {
  process.on('uncaughtException', e => { console.error('UNCAUGHT:', e.message); });
  process.on('unhandledRejection', e => { console.error('UNHANDLED:', e?.message || e); });
  
  const confirmed = [];
  for (const [name, base] of counties) {
    let found = false;
    for (const path of paths) {
      const url = base + path;
      try {
        const data = await fetchUrl(url);
        if (data.status === 200 && data.body && data.body.length > 500) {
          const title = (data.body.match(titleRe)?.[1] || '').trim();
          if (fiscalRe.test(title)) {
            console.log(`OK ${name} | ${url} | title: ${title.substring(0,60)}`);
            confirmed.push([name, url]);
            found = true;
            break;
          }
          const bodyMatches = [...new Set(data.body.match(bodyRe) || [])];
          if (bodyMatches.length >= 3) {
            console.log(`OK* ${name} | ${url} | body(${bodyMatches.length}): ${bodyMatches.join(',')} | title: ${title.substring(0,40)}`);
            confirmed.push([name, url]);
            found = true;
            break;
          }
        }
      } catch(e) { /* skip */ }
    }
    if (!found) console.log(`- ${name}`);
  }
  console.log(`\n=== TOTAL: ${confirmed.length} ===`);
  confirmed.forEach(([n,u]) => console.log(`${n}: ${u}`));
})();
