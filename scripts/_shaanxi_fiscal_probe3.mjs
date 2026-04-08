import https from 'https';
import http from 'http';

function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, rejectUnauthorized: false }, (res) => {
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
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|财政资金|财政信息|财政收支/;

// Common URL patterns to try for all counties
const commonPaths = [
  '/zwgk/zdxxgk/czxx/1.html',
  '/zwgk/zdxxgk/czxx/',
  '/zwgk/xxgkml/czxx/1.html',
  '/zwgk/xxgkml/czxx/',
  '/zwgk/czzjxx/1.html',
  '/zwgk/czzjxx/',
  '/zwgk/jcxxgk/czxx/1.html',
  '/zwgk/czzjxx/qzfczyjsgkml/1.html',
  '/zwgk/fdzdgknr/czzj/',
  '/gk/fdzdgknr/czxx/czyjs/',
  '/gk/czzj/',
];

// Extra patterns for Xi'an districts
const xianExtraPaths = [
  '/zwgk/zdxxgk/czxx/czszjjd/1.html',
  '/zwgk/zdxxgk/czxx/gdwsgjf/1.html',
];

// [city, name, govBaseUrl, isXian]
const counties = [
  // ── 西安市 ──
  ['西安', '新城区', 'http://www.xincheng.gov.cn', true],
  ['西安', '莲湖区', 'http://www.lianhu.gov.cn', true],
  ['西安', '灞桥区', 'http://www.baqiao.gov.cn', true],
  ['西安', '未央区', 'http://www.weiyang.gov.cn', true],
  ['西安', '雁塔区', 'http://www.yanta.gov.cn', true],
  ['西安', '阎良区', 'http://www.yanliang.gov.cn', true],
  ['西安', '临潼区', 'http://www.lintong.gov.cn', true],
  ['西安', '长安区', 'http://www.changan.gov.cn', true],
  ['西安', '高陵区', 'http://www.gaoling.gov.cn', true],
  ['西安', '鄠邑区', 'http://www.huyi.gov.cn', true],
  ['西安', '蓝田县', 'http://www.lantian.gov.cn', true],
  ['西安', '周至县', 'http://www.zhouzhi.gov.cn', true],
  // ── 铜川市 ──
  ['铜川', '王益区', 'http://www.tcwy.gov.cn', false],
  ['铜川', '印台区', 'http://www.yintai.gov.cn', false],
  ['铜川', '耀州区', 'http://www.yaozhou.gov.cn', false],
  ['铜川', '宜君县', 'http://www.yijun.gov.cn', false],
  // ── 宝鸡市 ──
  ['宝鸡', '渭滨区', 'http://www.weibin.gov.cn', false],
  ['宝鸡', '金台区', 'http://www.jintai.gov.cn', false],
  ['宝鸡', '陈仓区', 'http://www.chencang.gov.cn', false],
  ['宝鸡', '凤翔区', 'http://www.fengxiang.gov.cn', false],
  ['宝鸡', '岐山县', 'http://www.qishan.gov.cn', false],
  ['宝鸡', '扶风县', 'http://www.fufeng.gov.cn', false],
  ['宝鸡', '眉县', 'http://www.meixian.gov.cn', false],
  ['宝鸡', '陇县', 'http://www.longxian.gov.cn', false],
  ['宝鸡', '千阳县', 'http://www.qianyang.gov.cn', false],
  ['宝鸡', '麟游县', 'http://www.linyou.gov.cn', false],
  ['宝鸡', '凤县', 'http://www.sxfx.gov.cn', false],
  ['宝鸡', '太白县', 'http://www.taibai.gov.cn', false],
  // ── 咸阳市 (skip 泾阳县, 彬州市 - confirmed; 永寿县 - has URL) ──
  ['咸阳', '秦都区', 'https://www.snqindu.gov.cn', false],
  ['咸阳', '渭城区', 'https://www.weic.gov.cn', false],
  ['咸阳', '兴平市', 'http://www.xingping.gov.cn', false],
  ['咸阳', '武功县', 'http://www.sxwg.gov.cn', false],
  ['咸阳', '乾县', 'https://www.snqianxian.gov.cn', false],
  ['咸阳', '礼泉县', 'https://www.liquan.gov.cn', false],
  ['咸阳', '三原县', 'https://www.snsanyuan.gov.cn', false],
  ['咸阳', '长武县', 'http://www.changwu.gov.cn', false],
  ['咸阳', '旬邑县', 'https://www.snxunyi.gov.cn', false],
  ['咸阳', '淳化县', 'http://www.snchunhua.gov.cn', false],
  ['咸阳', '杨陵区', 'https://www.ylq.gov.cn', false],
  // ── 渭南市 ──
  ['渭南', '临渭区', 'http://www.linwei.gov.cn', false],
  ['渭南', '华州区', 'http://www.hzq.gov.cn', false],
  ['渭南', '潼关县', 'http://www.tongguan.gov.cn', false],
  ['渭南', '大荔县', 'http://www.dalisn.gov.cn', false],
  ['渭南', '合阳县', 'http://www.heyang.gov.cn', false],
  ['渭南', '澄城县', 'http://www.chengcheng.gov.cn', false],
  ['渭南', '蒲城县', 'http://www.pucheng.gov.cn', false],
  ['渭南', '白水县', 'http://www.baishui.gov.cn', false],
  ['渭南', '富平县', 'http://www.fuping.gov.cn', false],
  ['渭南', '华阴市', 'http://www.huayin.gov.cn', false],
  ['渭南', '韩城市', 'http://www.hancheng.gov.cn', false],
  // ── 延安市 (subdomain pattern) ──
  ['延安', '宝塔区', 'https://btq.yanan.gov.cn', false],
  ['延安', '安塞区', 'https://asq.yanan.gov.cn', false],
  ['延安', '延长县', 'https://ycx.yanan.gov.cn', false],
  ['延安', '延川县', 'https://yct.yanan.gov.cn', false],
  ['延安', '子长市', 'https://zcs.yanan.gov.cn', false],
  ['延安', '志丹县', 'https://zdk.yanan.gov.cn', false],
  ['延安', '吴起县', 'https://wqx.yanan.gov.cn', false],
  ['延安', '甘泉县', 'https://gqx.yanan.gov.cn', false],
  ['延安', '富县', 'https://fx.yanan.gov.cn', false],
  ['延安', '洛川县', 'https://lcx.yanan.gov.cn', false],
  ['延安', '宜川县', 'https://yc.yanan.gov.cn', false],
  ['延安', '黄龙县', 'https://hlx.yanan.gov.cn', false],
  ['延安', '黄陵县', 'https://hly.yanan.gov.cn', false],
  // ── 汉中市 ──
  ['汉中', '汉台区', 'http://www.htq.gov.cn', false],
  ['汉中', '南郑区', 'http://www.nanzheng.gov.cn', false],
  ['汉中', '城固县', 'http://www.chenggu.gov.cn', false],
  ['汉中', '洋县', 'http://www.yangxian.gov.cn', false],
  ['汉中', '西乡县', 'http://www.snxx.gov.cn', false],
  ['汉中', '勉县', 'http://www.mianxian.gov.cn', false],
  ['汉中', '宁强县', 'http://www.nq.gov.cn', false],
  ['汉中', '略阳县', 'http://www.lueyang.gov.cn', false],
  ['汉中', '镇巴县', 'http://www.zhenba.gov.cn', false],
  ['汉中', '留坝县', 'http://www.liuba.gov.cn', false],
  ['汉中', '佛坪县', 'http://www.foping.gov.cn', false],
  // ── 榆林市 (skip 榆阳区, 靖边县, 吴堡县, 子洲县, 神木市 - confirmed; 绥德县, 佳县, 清涧县 - have URLs) ──
  ['榆林', '横山区', 'https://www.hszf.gov.cn', false],
  ['榆林', '府谷县', 'https://www.fugu.gov.cn', false],
  ['榆林', '定边县', 'https://www.dingbian.gov.cn', false],
  ['榆林', '米脂县', 'https://www.mizhi.gov.cn', false],
  // ── 安康市 ──
  ['安康', '汉滨区', 'http://www.hanbin.gov.cn', false],
  ['安康', '汉阴县', 'https://www.hanyin.gov.cn', false],
  ['安康', '石泉县', 'https://www.shiquan.gov.cn', false],
  ['安康', '宁陕县', 'http://www.ningshan.gov.cn', false],
  ['安康', '紫阳县', 'https://www.zyx.gov.cn', false],
  ['安康', '岚皋县', 'https://www.langao.gov.cn', false],
  ['安康', '平利县', 'https://www.pingli.gov.cn', false],
  ['安康', '镇坪县', 'https://www.zhp.gov.cn', false],
  ['安康', '旬阳市', 'https://www.xyx.gov.cn', false],
  ['安康', '白河县', 'http://www.baihe.gov.cn', false],
  // ── 商洛市 ──
  ['商洛', '商州区', 'https://www.shangzhou.gov.cn', false],
  ['商洛', '洛南县', 'https://www.luonan.gov.cn', false],
  ['商洛', '丹凤县', 'http://www.danfeng.gov.cn', false],
  ['商洛', '商南县', 'https://www.shangnan.gov.cn', false],
  ['商洛', '山阳县', 'http://www.shy.gov.cn', false],
  ['商洛', '镇安县', 'https://www.zazf.gov.cn', false],
  ['商洛', '柞水县', 'http://www.zhashui.gov.cn', false],
];

async function probeCounty(city, name, base, isXian) {
  const paths = [...commonPaths];
  if (isXian) paths.push(...xianExtraPaths);

  for (const path of paths) {
    const url = base + path;
    try {
      let data = await fetchUrl(url);
      // Follow one redirect
      if (data.redirect) {
        try { data = await fetchUrl(data.redirect); } catch { continue; }
      }
      if (data.status === 200 && data.body && data.body.length > 500) {
        const title = (data.body.match(titleRe)?.[1] || '').trim();
        // Title-only matching to avoid false positives
        if (fiscalRe.test(title)) {
          return { url, title };
        }
      }
    } catch (e) {
      // timeout / connection error - skip this path
    }
  }
  return null;
}

(async () => {
  const confirmed = [];
  const notfound = [];

  console.log(`Probing ${counties.length} Shaanxi counties...\n`);

  for (const [city, name, base, isXian] of counties) {
    const result = await probeCounty(city, name, base, isXian);
    if (result) {
      console.log(`CONFIRMED [${city}] ${name} | ${result.url} | title="${result.title.substring(0, 80)}"`);
      confirmed.push({ city, name, url: result.url });
    } else {
      console.log(`NOTFOUND  [${city}] ${name}`);
      notfound.push({ city, name });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROBE 3 SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total probed: ${counties.length}`);
  console.log(`Confirmed:    ${confirmed.length}`);
  console.log(`Not found:    ${notfound.length}`);
  console.log(`\n── Confirmed URLs ──`);
  for (const c of confirmed) {
    console.log(`  ${c.name}: ${c.url}`);
  }
  console.log(`\n── Not Found ──`);
  for (const n of notfound) {
    console.log(`  [${n.city}] ${n.name}`);
  }
})();
