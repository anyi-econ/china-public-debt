import https from 'https';
import http from 'http';

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|财政资金|财政信息|财政收支/;
const bodyRe = /预决算|财政预决算|预算公开|决算公开|政府预算|部门预算|财政资金|财政信息|财政收支/g;

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

// Gansu-specific patterns + common ones
const paths = [
  '/zfxxgk/fdzdgknr/czxx/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/ysjs/',
  '/zfxxgk/fdzdgknr/ysjs/sjjgxxgk/',
  '/zfxxgk/fdzdgknr/cwxx/',
  '/zwgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/fdzdgknr/czzj/',
  '/zwgk/czxx/',
  '/zwgk/czxx/czyjs/',
  '/zwgk/czzj/',
  '/zwgk/zdxxgk/czxx/',
  '/gk/fdzdgknr/czxx/',
  '/gk/fdzdgknr/czxx/czyjs/',
  '/gk/czxx/',
  '/gk/czzj/',
  '/info/iList.jsp?tm_id=177',  // common in Gansu gov sites
];

const counties = [
  // 兰州
  ['城关区', 'https://www.lzcgq.gov.cn'],
  ['七里河区', 'http://www.qilihe.gov.cn'],
  ['西固区', 'https://www.lzxigu.gov.cn'],
  ['安宁区', 'http://www.lzan.gov.cn'],
  ['红古区', 'http://www.lzhonggu.gov.cn'],
  ['永登县', 'http://www.yongdeng.gov.cn'],
  ['皋兰县', 'http://www.gaolan.gov.cn'],
  ['榆中县', 'http://www.yuzhong.gov.cn'],
  // 金昌
  ['金川区', 'http://www.jinchuan.gov.cn'],
  ['永昌县', 'https://www.yongchang.gov.cn'],
  // 白银
  ['白银区', 'https://www.baiyinqu.gov.cn'],
  ['平川区', 'https://www.bypc.gov.cn'],
  ['靖远县', 'https://www.jingyuan.gov.cn'],
  ['会宁县', 'https://www.huining.gov.cn'],
  ['景泰县', 'https://www.jingtai.gov.cn'],
  // 天水
  ['秦州区', 'http://www.qinzhouqu.gov.cn'],
  ['麦积区', 'http://www.maiji.gov.cn'],
  ['清水县', 'http://www.qingshui.gov.cn'],
  ['秦安县', 'http://www.qinan.gov.cn'],
  ['甘谷县', 'http://www.gangu.gov.cn'],
  ['武山县', 'http://www.wushan.gov.cn'],
  ['张家川回族自治县', 'http://www.zjc.gov.cn'],
  // 武威
  ['凉州区', 'http://www.gsliangzhou.gov.cn'],
  ['民勤县', 'http://www.minqin.gov.cn'],
  ['古浪县', 'https://www.gulang.gov.cn'],
  ['天祝藏族自治县', 'http://www.gstianzhu.gov.cn'],
  // 张掖
  ['甘州区', 'http://gsgz.gov.cn'],
  ['肃南裕固族自治县', 'http://www.gssn.gov.cn'],
  ['民乐县', 'http://www.gsml.gov.cn'],
  ['临泽县', 'http://www.gslz.gov.cn'],
  ['高台县', 'http://www.gaotai.gov.cn'],
  ['山丹县', 'https://www.shandan.gov.cn'],
  // 平凉 (泾川 and 华亭 already have URLs)
  ['崆峒区', 'http://www.kongtong.gov.cn'],
  ['灵台县', 'https://www.lingtai.gov.cn'],
  ['崇信县', 'https://www.chongxin.gov.cn'],
  ['庄浪县', 'https://www.gszhuanglang.gov.cn'],
  ['静宁县', 'https://www.gsjn.gov.cn'],
  // 酒泉
  ['肃州区', 'http://www.jqsz.gov.cn'],
  ['金塔县', 'http://www.jtxzf.gov.cn'],
  ['瓜州县', 'http://www.guazhou.gov.cn'],
  ['肃北蒙古族自治县', 'https://www.subei.gov.cn'],
  ['阿克塞哈萨克族自治县', 'http://www.akesai.gov.cn'],
  ['玉门市', 'http://www.yumen.gov.cn'],
  ['敦煌市', 'http://www.dunhuang.gov.cn'],
  // 庆阳
  ['西峰区', 'https://www.gsxf.gov.cn'],
  ['庆城县', 'https://www.chinaqingcheng.gov.cn'],
  ['环县', 'http://www.huanxian.gov.cn'],
  ['华池县', 'https://www.hcx.gov.cn'],
  ['合水县', 'https://www.hsxzf.gov.cn'],
  ['正宁县', 'https://www.zninfo.gov.cn'],
  ['宁县', 'http://www.gsnx.gov.cn'],
  ['镇原县', 'http://www.gszhenyuan.gov.cn'],
  // 定西
  ['安定区', 'http://www.anding.gov.cn'],
  ['通渭县', 'http://www.tongwei.gov.cn'],
  ['陇西县', 'http://www.cnlongxi.gov.cn'],
  ['渭源县', 'https://www.cnwy.gov.cn'],
  ['临洮县', 'http://www.lintao.gov.cn'],
  ['漳县', 'http://www.zhangxian.gov.cn'],
  ['岷县', 'http://www.minxian.gov.cn'],
  // 陇南
  ['武都区', 'http://www.gslnwd.gov.cn'],
  ['成县', 'http://www.gscx.gov.cn'],
  ['文县', 'https://www.lnwx.gov.cn'],
  ['宕昌县', 'https://www.tanchang.gov.cn'],
  ['康县', 'http://www.gskx.gov.cn'],
  ['西和县', 'https://www.xihe.gov.cn'],
  ['礼县', 'https://www.gslx.gov.cn'],
  ['徽县', 'https://www.gshxzf.gov.cn'],
  ['两当县', 'http://www.ldxzf.gov.cn'],
  // 临夏
  ['临夏市', 'https://www.lxs.gov.cn'],
  ['临夏县', 'https://www.linxiaxian.gov.cn'],
  ['康乐县', 'https://www.kangle.gov.cn'],
  ['永靖县', 'https://www.yongjing.gov.cn'],
  ['广河县', 'https://www.guanghe.gov.cn'],
  ['和政县', 'https://www.hezheng.gov.cn'],
  ['东乡族自治县', 'https://www.dongxiang.gov.cn'],
  ['积石山保安族东乡族撒拉族自治县', 'https://www.jishishan.gov.cn'],
  // 甘南
  ['合作市', 'http://www.hezuo.gov.cn'],
  ['临潭县', 'http://www.lintan.gov.cn'],
  ['卓尼县', 'http://www.zhuoni.gov.cn'],
  ['舟曲县', 'http://www.zhouqu.gov.cn'],
  ['迭部县', 'http://www.diebu.gov.cn'],
  ['玛曲县', 'http://www.maqu.gov.cn'],
  ['碌曲县', 'http://www.luqu.gov.cn'],
  ['夏河县', 'http://www.xiahe.gov.cn'],
];

(async () => {
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
          // Body check: 3+ distinct fiscal terms
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
