import https from 'https';
import http from 'http';

function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const rurl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
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
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|政府预算|政府决算|部门预算|部门决算|财政资金|财政信息|财政收支/;

// county: [name, [[path1, path2, ...]]]  
// We generate URLs from gov portal + paths
const counties = [
  // 西安 - discovered patterns: /zwgk/zdxxgk/czxx/, /zwgk/xxgkml/czxx/, /zwgk/czzjxx/
  ['新城区', 'http://www.xincheng.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/zdxxgk/czxx/czyjs/1.html', '/zwgk/zdxxgk/czxx/gdwsgjf/1.html']],
  ['莲湖区', 'http://www.lianhu.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/jcxxgk/czxx/1.html', '/zwgk/zdxxgk/czxx/czyjs/1.html']],
  ['灞桥区', 'http://www.baqiao.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['未央区', 'http://www.weiyang.gov.cn', ['/zwgk/czzjxx/1.html', '/zwgk/czzjxx/qzfczyjsgkml/1.html']],
  ['雁塔区', 'http://www.yanta.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['阎良区', 'http://www.yanliang.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['临潼区', 'http://www.lintong.gov.cn', ['/zwgk/xxgkml/czxx/1.html', '/zwgk/xxgkml/czxx/czyjs/1.html']],
  ['长安区', 'http://www.changan.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['高陵区', 'http://www.gaoling.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['鄠邑区', 'http://www.huyi.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['蓝田县', 'http://www.lantian.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  ['周至县', 'http://www.zhouzhi.gov.cn', ['/zwgk/zdxxgk/czxx/1.html', '/zwgk/xxgkml/czxx/1.html', '/zwgk/czzjxx/1.html']],
  // 铜川
  ['王益区', 'http://www.tcwy.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['印台区', 'http://www.yintai.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['耀州区', 'http://www.yaozhou.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['宜君县', 'http://www.yijun.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  // 宝鸡
  ['渭滨区', 'http://www.weibin.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['金台区', 'http://www.jintai.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['陈仓区', 'http://www.chencang.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['凤翔区', 'http://www.fengxiang.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['岐山县', 'http://www.qishan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['扶风县', 'http://www.fufeng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['眉县', 'http://www.meixian.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['陇县', 'http://www.longxian.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['千阳县', 'http://www.qianyang.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['麟游县', 'http://www.linyou.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['凤县', 'http://www.sxfx.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['太白县', 'http://www.taibai.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  // 咸阳市 - remaining
  ['秦都区', 'https://www.snqindu.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['渭城区', 'https://www.weic.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['兴平市', 'http://www.xingping.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['武功县', 'http://www.sxwg.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['乾县', 'https://www.snqianxian.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['礼泉县', 'https://www.liquan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['三原县', 'https://www.snsanyuan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['长武县', 'http://www.changwu.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['旬邑县', 'https://www.snxunyi.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['淳化县', 'http://www.snchunhua.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  ['杨陵区', 'https://www.ylq.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/zdxxgk/czxx/']],
  // 渭南
  ['临渭区', 'http://www.linwei.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['华州区', 'http://www.hzq.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['潼关县', 'http://www.tongguan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['大荔县', 'http://www.dalisn.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['合阳县', 'http://www.heyang.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['澄城县', 'http://www.chengcheng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['蒲城县', 'http://www.pucheng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['白水县', 'http://www.baishui.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['富平县', 'http://www.fuping.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['华阴市', 'http://www.huayin.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['韩城市', 'http://www.hancheng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/']],
  // 延安
  ['宝塔区', 'https://btq.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/czyjs/sj/1.html', '/gk/fdzdgknr/czxx/']],
  ['安塞区', 'https://asq.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/czyjs/sj/1.html', '/gk/fdzdgknr/czxx/']],
  ['延长县', 'https://ycx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['延川县', 'https://yct.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['子长市', 'https://zcs.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['志丹县', 'https://zdk.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['吴起县', 'https://wqx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['甘泉县', 'https://gqx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['富县', 'https://fx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['洛川县', 'https://lcx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['宜川县', 'https://yc.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['黄龙县', 'https://hlx.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  ['黄陵县', 'https://hly.yanan.gov.cn', ['/gk/fdzdgknr/czxx/czyjs/', '/gk/fdzdgknr/czxx/']],
  // 汉中
  ['汉台区', 'http://www.htq.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/', '/gk/fdzdgknr/czxx/czyjs/']],
  ['南郑区', 'http://www.nanzheng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['城固县', 'http://www.chenggu.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['洋县', 'http://www.yangxian.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['西乡县', 'http://www.snxx.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['勉县', 'http://www.mianxian.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['宁强县', 'http://www.nq.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['略阳县', 'http://www.lueyang.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['镇巴县', 'http://www.zhenba.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['留坝县', 'http://www.liuba.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  ['佛坪县', 'http://www.foping.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/zwgk/czzj/']],
  // 榆林 remaining
  ['横山区', 'https://www.hszf.gov.cn', ['/zfxxgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czzj/']],
  ['府谷县', 'https://www.fugu.gov.cn', ['/zfxxgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czzj/']],
  ['定边县', 'https://www.dingbian.gov.cn', ['/zfxxgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czzj/']],
  ['米脂县', 'https://www.mizhi.gov.cn', ['/zfxxgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czxx/', '/zwgk/fdzdgknr/czzj/']],
  // 安康
  ['汉滨区', 'http://www.hanbin.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['汉阴县', 'https://www.hanyin.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['石泉县', 'https://www.shiquan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['宁陕县', 'http://www.ningshan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['紫阳县', 'https://www.zyx.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['岚皋县', 'https://www.langao.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['平利县', 'https://www.pingli.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['镇坪县', 'https://www.zhp.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['旬阳市', 'https://www.xyx.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['白河县', 'http://www.baihe.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  // 商洛
  ['商州区', 'https://www.shangzhou.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['洛南县', 'https://www.luonan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['丹凤县', 'http://www.danfeng.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['商南县', 'https://www.shangnan.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['山阳县', 'http://www.shy.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['镇安县', 'https://www.zazf.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
  ['柞水县', 'http://www.zhashui.gov.cn', ['/zwgk/fdzdgknr/czxx/', '/zfxxgk/fdzdgknr/czxx/', '/gk/fdzdgknr/czxx/czyjs/', '/zwgk/czzj/']],
];

(async () => {
  const confirmed = [];
  const notfound = [];
  
  for (const [name, base, paths] of counties) {
    let found = false;
    for (const path of paths) {
      const url = base + path;
      try {
        let data = await fetchUrl(url);
        if (data.redirect) {
          try { data = await fetchUrl(data.redirect); } catch { continue; }
        }
        if (data.status === 200 && data.body && data.body.length > 500) {
          const title = (data.body.match(titleRe)?.[1] || '').trim();
          if (fiscalRe.test(title) || fiscalRe.test(data.body)) {
            console.log(`CONFIRMED ${name} | ${url} | title="${title.substring(0,80)}" | len=${data.body.length}`);
            confirmed.push([name, url]);
            found = true;
            break;
          }
        }
      } catch(e) { /* skip */ }
    }
    if (!found) {
      console.log(`NOTFOUND ${name}`);
      notfound.push(name);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Confirmed: ${confirmed.length}`);
  console.log(`Not found: ${notfound.length}`);
  confirmed.forEach(([n, u]) => console.log(`  ${n}: ${u}`));
})();
