import https from 'https';
import http from 'http';

function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        const rurl = loc.startsWith('http') ? loc : new URL(loc, url).href;
        res.resume();
        resolve({ redirect: rurl, status: res.statusCode });
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ body: Buffer.concat(chunks).toString('utf-8'), status: res.statusCode }));
    });
    req.on('error', e => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
// Must match at least 3 different fiscal keywords to count as a fiscal listing page (not just one mention)
const fiscalTerms = ['预决算', '财政预决算', '预算公开', '决算公开', '政府预算', '政府决算', '部门预算', '部门决算', '财政资金', '财政信息', '财政收支', '财政预算'];
const fiscalTitleRe = /预决算|财政预决算|预算公开|决算公开|财政资金|财政信息|财政收支/;

function countFiscalTerms(html) {
  let count = 0;
  for (const t of fiscalTerms) {
    if (html.includes(t)) count++;
  }
  return count;
}

// All remaining Shaanxi counties (url: "") except already confirmed ones
// Format: [name, govUrl, city]
const counties = [
  // 西安 - confirmed 4 above, but remaining:
  ['灞桥区', 'http://www.baqiao.gov.cn', '西安'],
  ['雁塔区', 'http://www.yanta.gov.cn', '西安'],
  ['阎良区', 'http://www.yanliang.gov.cn', '西安'],
  ['长安区', 'http://www.changan.gov.cn', '西安'],
  ['高陵区', 'http://www.gaoling.gov.cn', '西安'],
  ['鄠邑区', 'http://www.huyi.gov.cn', '西安'],
  ['蓝田县', 'http://www.lantian.gov.cn', '西安'],
  ['周至县', 'http://www.zhouzhi.gov.cn', '西安'],
  // 铜川
  ['王益区', 'http://www.tcwy.gov.cn', '铜川'],
  ['印台区', 'http://www.yintai.gov.cn', '铜川'],
  ['耀州区', 'http://www.yaozhou.gov.cn', '铜川'],
  ['宜君县', 'http://www.yijun.gov.cn', '铜川'],
  // 宝鸡
  ['渭滨区', 'http://www.weibin.gov.cn', '宝鸡'],
  ['金台区', 'http://www.jintai.gov.cn', '宝鸡'],
  ['陈仓区', 'http://www.chencang.gov.cn', '宝鸡'],
  ['凤翔区', 'http://www.fengxiang.gov.cn', '宝鸡'],
  ['岐山县', 'http://www.qishan.gov.cn', '宝鸡'],
  ['扶风县', 'http://www.fufeng.gov.cn', '宝鸡'],
  ['眉县', 'http://www.meixian.gov.cn', '宝鸡'],
  ['陇县', 'http://www.longxian.gov.cn', '宝鸡'],
  ['千阳县', 'http://www.qianyang.gov.cn', '宝鸡'],
  ['麟游县', 'http://www.linyou.gov.cn', '宝鸡'],
  ['凤县', 'http://www.sxfx.gov.cn', '宝鸡'],
  ['太白县', 'http://www.taibai.gov.cn', '宝鸡'],
  // 咸阳 remaining (泾阳县, 彬州市 already confirmed)
  ['秦都区', 'https://www.snqindu.gov.cn', '咸阳'],
  ['渭城区', 'https://www.weic.gov.cn', '咸阳'],
  ['兴平市', 'http://www.xingping.gov.cn', '咸阳'],
  ['三原县', 'https://www.snsanyuan.gov.cn', '咸阳'],
  ['武功县', 'http://www.sxwg.gov.cn', '咸阳'],
  ['乾县', 'https://www.snqianxian.gov.cn', '咸阳'],
  ['礼泉县', 'https://www.liquan.gov.cn', '咸阳'],
  ['长武县', 'http://www.changwu.gov.cn', '咸阳'],
  ['旬邑县', 'https://www.snxunyi.gov.cn', '咸阳'],
  ['淳化县', 'http://www.snchunhua.gov.cn', '咸阳'],
  ['杨陵区', 'https://www.ylq.gov.cn', '咸阳'],
  // 渭南 
  ['临渭区', 'http://www.linwei.gov.cn', '渭南'],
  ['华州区', 'http://www.hzq.gov.cn', '渭南'],
  ['潼关县', 'http://www.tongguan.gov.cn', '渭南'],
  ['大荔县', 'http://www.dalisn.gov.cn', '渭南'],
  ['合阳县', 'http://www.heyang.gov.cn', '渭南'],
  ['澄城县', 'http://www.chengcheng.gov.cn', '渭南'],
  ['蒲城县', 'http://www.pucheng.gov.cn', '渭南'],
  ['白水县', 'http://www.baishui.gov.cn', '渭南'],
  ['富平县', 'http://www.fuping.gov.cn', '渭南'],
  ['华阴市', 'http://www.huayin.gov.cn', '渭南'],
  ['韩城市', 'http://www.hancheng.gov.cn', '渭南'],
  // 延安
  ['宝塔区', 'https://btq.yanan.gov.cn', '延安'],
  ['安塞区', 'https://asq.yanan.gov.cn', '延安'],
  ['延长县', 'https://ycx.yanan.gov.cn', '延安'],
  ['延川县', 'https://yct.yanan.gov.cn', '延安'],
  ['子长市', 'https://zcs.yanan.gov.cn', '延安'],
  ['志丹县', 'https://zdk.yanan.gov.cn', '延安'],
  ['吴起县', 'https://wqx.yanan.gov.cn', '延安'],
  ['甘泉县', 'https://gqx.yanan.gov.cn', '延安'],
  ['富县', 'https://fx.yanan.gov.cn', '延安'],
  ['洛川县', 'https://lcx.yanan.gov.cn', '延安'],
  ['宜川县', 'https://yc.yanan.gov.cn', '延安'],
  ['黄龙县', 'https://hlx.yanan.gov.cn', '延安'],
  ['黄陵县', 'https://hly.yanan.gov.cn', '延安'],
  // 汉中
  ['汉台区', 'http://www.htq.gov.cn', '汉中'],
  ['南郑区', 'http://www.nanzheng.gov.cn', '汉中'],
  ['城固县', 'http://www.chenggu.gov.cn', '汉中'],
  ['洋县', 'http://www.yangxian.gov.cn', '汉中'],
  ['西乡县', 'http://www.snxx.gov.cn', '汉中'],
  ['勉县', 'http://www.mianxian.gov.cn', '汉中'],
  ['宁强县', 'http://www.nq.gov.cn', '汉中'],
  ['略阳县', 'http://www.lueyang.gov.cn', '汉中'],
  ['镇巴县', 'http://www.zhenba.gov.cn', '汉中'],
  ['留坝县', 'http://www.liuba.gov.cn', '汉中'],
  ['佛坪县', 'http://www.foping.gov.cn', '汉中'],
  // 榆林 remaining (靖边, 吴堡, 子洲, 神木, 榆阳 already confirmed) 
  ['横山区', 'https://www.hszf.gov.cn', '榆林'],
  ['府谷县', 'https://www.fugu.gov.cn', '榆林'],
  ['定边县', 'https://www.dingbian.gov.cn', '榆林'],
  ['米脂县', 'https://www.mizhi.gov.cn', '榆林'],
  // 安康
  ['汉滨区', 'http://www.hanbin.gov.cn', '安康'],
  ['汉阴县', 'https://www.hanyin.gov.cn', '安康'],
  ['石泉县', 'https://www.shiquan.gov.cn', '安康'],
  ['宁陕县', 'http://www.ningshan.gov.cn', '安康'],
  ['紫阳县', 'https://www.zyx.gov.cn', '安康'],
  ['岚皋县', 'https://www.langao.gov.cn', '安康'],
  ['平利县', 'https://www.pingli.gov.cn', '安康'],
  ['镇坪县', 'https://www.zhp.gov.cn', '安康'],
  ['旬阳市', 'https://www.xyx.gov.cn', '安康'],
  ['白河县', 'http://www.baihe.gov.cn', '安康'],
  // 商洛
  ['商州区', 'https://www.shangzhou.gov.cn', '商洛'],
  ['洛南县', 'https://www.luonan.gov.cn', '商洛'],
  ['丹凤县', 'http://www.danfeng.gov.cn', '商洛'],
  ['商南县', 'https://www.shangnan.gov.cn', '商洛'],
  ['山阳县', 'http://www.shy.gov.cn', '商洛'],
  ['镇安县', 'https://www.zazf.gov.cn', '商洛'],
  ['柞水县', 'http://www.zhashui.gov.cn', '商洛'],
];

// Extended set of paths to try
const paths = [
  '/zwgk/zdxxgk/czxx/',
  '/zwgk/zdxxgk/czxx/1.html',
  '/zwgk/xxgkml/czxx/',
  '/zwgk/xxgkml/czxx/1.html',
  '/zwgk/czzjxx/',
  '/zwgk/czzjxx/1.html',
  '/zwgk/jcxxgk/czxx/',
  '/zwgk/jcxxgk/czxx/1.html',
  '/zwgk/fdzdgknr/czxx/',
  '/zfxxgk/fdzdgknr/czxx/',
  '/zwgk/fdzdgknr/czzj/',
  '/gk/fdzdgknr/czxx/',
  '/gk/fdzdgknr/czxx/czyjs/',
  '/gk/czzj/',
  '/zwgk/czzj/',
  '/gk/czxx/',
];

async function probeCounty(name, base, city) {
  for (const path of paths) {
    const url = base + path;
    try {
      let data = await fetchUrl(url);
      if (data.redirect) {
        try { data = await fetchUrl(data.redirect); } catch { continue; }
      }
      if (data.status === 200 && data.body && data.body.length > 500) {
        const title = (data.body.match(titleRe)?.[1] || '').trim();
        const titleMatch = fiscalTitleRe.test(title);
        const bodyTerms = countFiscalTerms(data.body);
        // Accept if title matches fiscal, OR body has 3+ different fiscal terms
        if (titleMatch || bodyTerms >= 3) {
          return { name, url, title: title.substring(0, 80), titleMatch, bodyTerms, bodyLen: data.body.length };
        }
      }
    } catch(e) { /* skip */ }
  }
  return null;
}

(async () => {
  const confirmed = [];
  const notfound = [];
  
  for (const [name, base, city] of counties) {
    const result = await probeCounty(name, base, city);
    if (result) {
      console.log(`CONFIRMED ${result.name} [${city}] | ${result.url} | title="${result.title}" | titleMatch=${result.titleMatch} bodyTerms=${result.bodyTerms}`);
      confirmed.push(result);
    } else {
      console.log(`NOTFOUND ${name} [${city}]`);
      notfound.push(name);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Confirmed: ${confirmed.length}`);
  console.log(`Not found: ${notfound.length}`);
  console.log(`\nConfirmed list:`);
  confirmed.forEach(r => console.log(`  ${r.name}: ${r.url}  (title="${r.title}", titleMatch=${r.titleMatch}, bodyTerms=${r.bodyTerms})`));
})();
