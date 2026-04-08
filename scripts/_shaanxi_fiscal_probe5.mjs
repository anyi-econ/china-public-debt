import https from 'https';
import http from 'http';

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|财政资金|财政信息|财政收支/;

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
  '/zwgk/qzfxxgkml/czxx/qzfyjs/1.html',
  '/zwgk/qzfxxgkml/czxx/1.html',
  '/zwgk/czxx/1.html',
  '/zwgk/czxx/',
  '/zwgk/czxx/czyjs/',
  '/zwgk/czxx/czyjs/1.html',
  '/zwgk/zdxxgk/czxx/1.html',
  '/zwgk/zdxxgk/czxx/',
  '/zwgk/xxgkml/czxx/1.html',
  '/zwgk/xxgkml/czxx/',
  '/zwgk/czzjxx/1.html',
  '/zwgk/czzjxx/',
  '/zwgk/jcxxgk/czxx/1.html',
  '/zwgk/jcxxgk/czxx/',
  '/zfxxgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czzj/',
  '/gk/fdzdgknr/czxx/',
  '/gk/fdzdgknr/czxx/czyjs/',
  '/gk/czzj/',
  '/gk/czxx/',
  '/zwgk/czzj/',
];

const counties = [
  // Xi'an remaining
  ['高陵区', 'http://www.gaoling.gov.cn'],
  ['雁塔区', 'http://www.yanta.gov.cn'],
  ['阎良区', 'http://www.yanliang.gov.cn'],
  ['长安区', 'http://www.changan.gov.cn'],
  ['鄠邑区', 'http://www.huyi.gov.cn'],
  ['蓝田县', 'http://www.lantian.gov.cn'],
  ['周至县', 'http://www.zhouzhi.gov.cn'],
  // Tongchuan
  ['王益区', 'http://www.tcwy.gov.cn'],
  ['印台区', 'http://www.yintai.gov.cn'],
  ['耀州区', 'http://www.yaozhou.gov.cn'],
  ['宜君县', 'http://www.yijun.gov.cn'],
  // Baoji
  ['渭滨区', 'http://www.weibin.gov.cn'],
  ['金台区', 'http://www.jintai.gov.cn'],
  ['陈仓区', 'http://www.chencang.gov.cn'],
  ['凤翔区', 'http://www.fengxiang.gov.cn'],
  ['岐山县', 'http://www.qishan.gov.cn'],
  ['扶风县', 'http://www.fufeng.gov.cn'],
  ['眉县', 'http://www.meixian.gov.cn'],
  ['陇县', 'http://www.longxian.gov.cn'],
  ['千阳县', 'http://www.qianyang.gov.cn'],
  ['麟游县', 'http://www.linyou.gov.cn'],
  ['凤县', 'http://www.sxfx.gov.cn'],
  ['太白县', 'http://www.taibai.gov.cn'],
  // Xianyang remaining
  ['秦都区', 'https://www.snqindu.gov.cn'],
  ['渭城区', 'https://www.weic.gov.cn'],
  ['兴平市', 'http://www.xingping.gov.cn'],
  ['三原县', 'https://www.snsanyuan.gov.cn'],
  ['武功县', 'http://www.sxwg.gov.cn'],
  ['乾县', 'https://www.snqianxian.gov.cn'],
  ['礼泉县', 'https://www.liquan.gov.cn'],
  ['长武县', 'http://www.changwu.gov.cn'],
  ['旬邑县', 'https://www.snxunyi.gov.cn'],
  ['淳化县', 'http://www.snchunhua.gov.cn'],
  ['杨陵区', 'https://www.ylq.gov.cn'],
  // Weinan
  ['临渭区', 'http://www.linwei.gov.cn'],
  ['华州区', 'http://www.hzq.gov.cn'],
  ['潼关县', 'http://www.tongguan.gov.cn'],
  ['大荔县', 'http://www.dalisn.gov.cn'],
  ['合阳县', 'http://www.heyang.gov.cn'],
  ['澄城县', 'http://www.chengcheng.gov.cn'],
  ['蒲城县', 'http://www.pucheng.gov.cn'],
  ['白水县', 'http://www.baishui.gov.cn'],
  ['富平县', 'http://www.fuping.gov.cn'],
  ['华阴市', 'http://www.huayin.gov.cn'],
  ['韩城市', 'http://www.hancheng.gov.cn'],
  // Yanan
  ['宝塔区', 'https://btq.yanan.gov.cn'],
  ['安塞区', 'https://asq.yanan.gov.cn'],
  ['延长县', 'https://ycx.yanan.gov.cn'],
  ['延川县', 'https://yct.yanan.gov.cn'],
  ['子长市', 'https://zcs.yanan.gov.cn'],
  ['志丹县', 'https://zdk.yanan.gov.cn'],
  ['吴起县', 'https://wqx.yanan.gov.cn'],
  ['甘泉县', 'https://gqx.yanan.gov.cn'],
  ['富县', 'https://fx.yanan.gov.cn'],
  ['洛川县', 'https://lcx.yanan.gov.cn'],
  ['宜川县', 'https://yc.yanan.gov.cn'],
  ['黄龙县', 'https://hlx.yanan.gov.cn'],
  ['黄陵县', 'https://hly.yanan.gov.cn'],
  // Hanzhong
  ['汉台区', 'http://www.htq.gov.cn'],
  ['南郑区', 'http://www.nanzheng.gov.cn'],
  ['城固县', 'http://www.chenggu.gov.cn'],
  ['洋县', 'http://www.yangxian.gov.cn'],
  ['西乡县', 'http://www.snxx.gov.cn'],
  ['勉县', 'http://www.mianxian.gov.cn'],
  ['宁强县', 'http://www.nq.gov.cn'],
  ['略阳县', 'http://www.lueyang.gov.cn'],
  ['镇巴县', 'http://www.zhenba.gov.cn'],
  ['留坝县', 'http://www.liuba.gov.cn'],
  ['佛坪县', 'http://www.foping.gov.cn'],
  // Yulin remaining
  ['横山区', 'https://www.hszf.gov.cn'],
  ['府谷县', 'https://www.fugu.gov.cn'],
  ['定边县', 'https://www.dingbian.gov.cn'],
  ['米脂县', 'https://www.mizhi.gov.cn'],
  // Ankang
  ['汉滨区', 'http://www.hanbin.gov.cn'],
  ['汉阴县', 'https://www.hanyin.gov.cn'],
  ['石泉县', 'https://www.shiquan.gov.cn'],
  ['宁陕县', 'http://www.ningshan.gov.cn'],
  ['紫阳县', 'https://www.zyx.gov.cn'],
  ['岚皋县', 'https://www.langao.gov.cn'],
  ['平利县', 'https://www.pingli.gov.cn'],
  ['镇坪县', 'https://www.zhp.gov.cn'],
  ['旬阳市', 'https://www.xyx.gov.cn'],
  ['白河县', 'http://www.baihe.gov.cn'],
  // Shangluo
  ['商州区', 'https://www.shangzhou.gov.cn'],
  ['洛南县', 'https://www.luonan.gov.cn'],
  ['丹凤县', 'http://www.danfeng.gov.cn'],
  ['商南县', 'https://www.shangnan.gov.cn'],
  ['山阳县', 'http://www.shy.gov.cn'],
  ['镇安县', 'https://www.zazf.gov.cn'],
  ['柞水县', 'http://www.zhashui.gov.cn'],
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
            console.log(`OK ${name} | ${url} | ${title.substring(0,60)}`);
            confirmed.push([name, url, title.substring(0,60)]);
            found = true;
            break;
          }
        }
      } catch(e) { /* skip */ }
    }
    if (!found) console.log(`- ${name}`);
  }
  console.log(`\n=== TOTAL: ${confirmed.length} ===`);
  confirmed.forEach(([n,u,t]) => console.log(`${n}: ${u}`));
})();
