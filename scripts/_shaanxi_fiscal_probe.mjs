// Probe fiscal budget disclosure pages for Shaanxi (陕西) counties
import https from 'https';
import http from 'http';

const counties = [
  // 西安市 (13)
  { city: '西安市', name: '新城区', gov: 'http://www.xincheng.gov.cn/' },
  { city: '西安市', name: '莲湖区', gov: 'http://www.lianhu.gov.cn/' },
  { city: '西安市', name: '灞桥区', gov: 'http://www.baqiao.gov.cn/' },
  { city: '西安市', name: '未央区', gov: 'http://www.weiyang.gov.cn/' },
  { city: '西安市', name: '雁塔区', gov: 'http://www.yanta.gov.cn/' },
  { city: '西安市', name: '阎良区', gov: 'http://www.yanliang.gov.cn/' },
  { city: '西安市', name: '临潼区', gov: 'http://www.lintong.gov.cn/' },
  { city: '西安市', name: '长安区', gov: 'http://www.changan.gov.cn/' },
  { city: '西安市', name: '高陵区', gov: 'http://www.gaoling.gov.cn/' },
  { city: '西安市', name: '鄠邑区', gov: 'http://www.huyi.gov.cn/' },
  { city: '西安市', name: '蓝田县', gov: 'http://www.lantian.gov.cn/' },
  { city: '西安市', name: '周至县', gov: 'http://www.zhouzhi.gov.cn/' },
  // 铜川市 (4)
  { city: '铜川市', name: '王益区', gov: 'http://www.tcwy.gov.cn/' },
  { city: '铜川市', name: '印台区', gov: 'http://www.yintai.gov.cn/' },
  { city: '铜川市', name: '耀州区', gov: 'http://www.yaozhou.gov.cn/' },
  { city: '铜川市', name: '宜君县', gov: 'http://www.yijun.gov.cn/' },
  // 宝鸡市 (12)
  { city: '宝鸡市', name: '渭滨区', gov: 'http://www.weibin.gov.cn/' },
  { city: '宝鸡市', name: '金台区', gov: 'http://www.jintai.gov.cn/' },
  { city: '宝鸡市', name: '陈仓区', gov: 'http://www.chencang.gov.cn/' },
  { city: '宝鸡市', name: '凤翔区', gov: 'http://www.fengxiang.gov.cn/' },
  { city: '宝鸡市', name: '岐山县', gov: 'http://www.qishan.gov.cn/' },
  { city: '宝鸡市', name: '扶风县', gov: 'http://www.fufeng.gov.cn/' },
  { city: '宝鸡市', name: '眉县', gov: 'http://www.meixian.gov.cn/' },
  { city: '宝鸡市', name: '陇县', gov: 'http://www.longxian.gov.cn/' },
  { city: '宝鸡市', name: '千阳县', gov: 'http://www.qianyang.gov.cn/' },
  { city: '宝鸡市', name: '麟游县', gov: 'http://www.linyou.gov.cn/' },
  { city: '宝鸡市', name: '凤县', gov: 'http://www.sxfx.gov.cn/' },
  { city: '宝鸡市', name: '太白县', gov: 'http://www.taibai.gov.cn/' },
  // 咸阳市 (13, excluding 永寿县)
  { city: '咸阳市', name: '秦都区', gov: 'https://www.snqindu.gov.cn/' },
  { city: '咸阳市', name: '渭城区', gov: 'https://www.weic.gov.cn/' },
  { city: '咸阳市', name: '兴平市', gov: 'http://www.xingping.gov.cn/' },
  { city: '咸阳市', name: '武功县', gov: 'http://www.sxwg.gov.cn/' },
  { city: '咸阳市', name: '乾县', gov: 'https://www.snqianxian.gov.cn/' },
  { city: '咸阳市', name: '礼泉县', gov: 'https://www.liquan.gov.cn/' },
  { city: '咸阳市', name: '泾阳县', gov: 'https://www.snjingyang.gov.cn/' },
  { city: '咸阳市', name: '三原县', gov: 'https://www.snsanyuan.gov.cn/' },
  { city: '咸阳市', name: '彬州市', gov: 'https://www.snbinzhou.gov.cn/' },
  { city: '咸阳市', name: '长武县', gov: 'http://www.changwu.gov.cn/' },
  { city: '咸阳市', name: '旬邑县', gov: 'https://www.snxunyi.gov.cn/' },
  { city: '咸阳市', name: '淳化县', gov: 'http://www.snchunhua.gov.cn/' },
  { city: '咸阳市', name: '杨陵区', gov: 'https://www.ylq.gov.cn/' },
  // 渭南市 (11)
  { city: '渭南市', name: '临渭区', gov: 'http://www.linwei.gov.cn/' },
  { city: '渭南市', name: '华州区', gov: 'http://www.hzq.gov.cn/' },
  { city: '渭南市', name: '潼关县', gov: 'http://www.tongguan.gov.cn/' },
  { city: '渭南市', name: '大荔县', gov: 'http://www.dalisn.gov.cn/' },
  { city: '渭南市', name: '合阳县', gov: 'http://www.heyang.gov.cn/' },
  { city: '渭南市', name: '澄城县', gov: 'http://www.chengcheng.gov.cn/' },
  { city: '渭南市', name: '蒲城县', gov: 'http://www.pucheng.gov.cn/' },
  { city: '渭南市', name: '白水县', gov: 'http://www.baishui.gov.cn/' },
  { city: '渭南市', name: '富平县', gov: 'http://www.fuping.gov.cn/' },
  { city: '渭南市', name: '华阴市', gov: 'http://www.huayin.gov.cn/' },
  { city: '渭南市', name: '韩城市', gov: 'http://www.hancheng.gov.cn/' },
  // 延安市 (13)
  { city: '延安市', name: '宝塔区', gov: 'https://btq.yanan.gov.cn/' },
  { city: '延安市', name: '安塞区', gov: 'https://asq.yanan.gov.cn/' },
  { city: '延安市', name: '延长县', gov: 'https://ycx.yanan.gov.cn/' },
  { city: '延安市', name: '延川县', gov: 'https://yct.yanan.gov.cn/' },
  { city: '延安市', name: '子长市', gov: 'https://zcs.yanan.gov.cn/' },
  { city: '延安市', name: '志丹县', gov: 'https://zdk.yanan.gov.cn/' },
  { city: '延安市', name: '吴起县', gov: 'https://wqx.yanan.gov.cn/' },
  { city: '延安市', name: '甘泉县', gov: 'https://gqx.yanan.gov.cn/' },
  { city: '延安市', name: '富县', gov: 'https://fx.yanan.gov.cn/' },
  { city: '延安市', name: '洛川县', gov: 'https://lcx.yanan.gov.cn/' },
  { city: '延安市', name: '宜川县', gov: 'https://yc.yanan.gov.cn/' },
  { city: '延安市', name: '黄龙县', gov: 'https://hlx.yanan.gov.cn/' },
  { city: '延安市', name: '黄陵县', gov: 'https://hly.yanan.gov.cn/' },
  // 汉中市 (11)
  { city: '汉中市', name: '汉台区', gov: 'http://www.htq.gov.cn/' },
  { city: '汉中市', name: '南郑区', gov: 'http://www.nanzheng.gov.cn/' },
  { city: '汉中市', name: '城固县', gov: 'http://www.chenggu.gov.cn/' },
  { city: '汉中市', name: '洋县', gov: 'http://www.yangxian.gov.cn/' },
  { city: '汉中市', name: '西乡县', gov: 'http://www.snxx.gov.cn/' },
  { city: '汉中市', name: '勉县', gov: 'http://www.mianxian.gov.cn/' },
  { city: '汉中市', name: '宁强县', gov: 'http://www.nq.gov.cn/' },
  { city: '汉中市', name: '略阳县', gov: 'http://www.lueyang.gov.cn/' },
  { city: '汉中市', name: '镇巴县', gov: 'http://www.zhenba.gov.cn/' },
  { city: '汉中市', name: '留坝县', gov: 'http://www.liuba.gov.cn/' },
  { city: '汉中市', name: '佛坪县', gov: 'http://www.foping.gov.cn/' },
  // 榆林市 (9, excluding 绥德县/佳县/清涧县)
  { city: '榆林市', name: '榆阳区', gov: 'https://yuyang.gov.cn/' },
  { city: '榆林市', name: '横山区', gov: 'https://www.hszf.gov.cn/' },
  { city: '榆林市', name: '府谷县', gov: 'https://www.fugu.gov.cn/' },
  { city: '榆林市', name: '靖边县', gov: 'http://www.jingbian.gov.cn/' },
  { city: '榆林市', name: '定边县', gov: 'https://www.dingbian.gov.cn/' },
  { city: '榆林市', name: '米脂县', gov: 'https://www.mizhi.gov.cn/' },
  { city: '榆林市', name: '吴堡县', gov: 'https://www.wubu.gov.cn/' },
  { city: '榆林市', name: '子洲县', gov: 'https://www.zizhou.gov.cn/' },
  { city: '榆林市', name: '神木市', gov: 'https://www.sxsm.gov.cn/' },
  // 安康市 (10)
  { city: '安康市', name: '汉滨区', gov: 'http://www.hanbin.gov.cn/' },
  { city: '安康市', name: '汉阴县', gov: 'https://www.hanyin.gov.cn/' },
  { city: '安康市', name: '石泉县', gov: 'https://www.shiquan.gov.cn/' },
  { city: '安康市', name: '宁陕县', gov: 'http://www.ningshan.gov.cn/' },
  { city: '安康市', name: '紫阳县', gov: 'https://www.zyx.gov.cn/' },
  { city: '安康市', name: '岚皋县', gov: 'https://www.langao.gov.cn/' },
  { city: '安康市', name: '平利县', gov: 'https://www.pingli.gov.cn/' },
  { city: '安康市', name: '镇坪县', gov: 'https://www.zhp.gov.cn/' },
  { city: '安康市', name: '旬阳市', gov: 'https://www.xyx.gov.cn/' },
  { city: '安康市', name: '白河县', gov: 'http://www.baihe.gov.cn/' },
  // 商洛市 (7)
  { city: '商洛市', name: '商州区', gov: 'https://www.shangzhou.gov.cn/' },
  { city: '商洛市', name: '洛南县', gov: 'https://www.luonan.gov.cn/' },
  { city: '商洛市', name: '丹凤县', gov: 'http://www.danfeng.gov.cn/' },
  { city: '商洛市', name: '商南县', gov: 'https://www.shangnan.gov.cn/' },
  { city: '商洛市', name: '山阳县', gov: 'http://www.shy.gov.cn/' },
  { city: '商洛市', name: '镇安县', gov: 'https://www.zazf.gov.cn/' },
  { city: '商洛市', name: '柞水县', gov: 'http://www.zhashui.gov.cn/' },
];

const FISCAL_KEYWORDS = /预决算|财政预决算|预算公开|决算公开|政府预算|政府决算|部门预算|部门决算|财政资金|财政信息|财政收支/;
const TIMEOUT = 8000;

function fetchUrl(url, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      timeout,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      rejectUnauthorized: false,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow one redirect
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = u.protocol + '//' + u.host + loc;
        }
        res.resume();
        const mod2 = loc.startsWith('https') ? https : http;
        const req2 = mod2.get(loc, {
          timeout,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          rejectUnauthorized: false,
        }, (res2) => {
          if (res2.statusCode >= 300 && res2.statusCode < 400) {
            res2.resume();
            resolve({ status: res2.statusCode, body: '', redirectedUrl: loc });
            return;
          }
          const chunks = [];
          res2.on('data', c => chunks.push(c));
          res2.on('end', () => {
            resolve({ status: res2.statusCode, body: Buffer.concat(chunks).toString('utf-8'), redirectedUrl: loc });
          });
        });
        req2.on('error', e => reject(e));
        req2.on('timeout', () => { req2.destroy(); reject(new Error('timeout')); });
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf-8') });
      });
    });
    req.on('error', e => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function buildPaths(govUrl) {
  const base = govUrl.replace(/\/$/, '');
  return [
    base + '/gk/fdzdgknr/czxx/czyjs/',
    base + '/zwgk/fdzdgknr/czxx/czyjs/',
    base + '/zfxxgk/fdzdgknr/czxx/czyjs/',
    base + '/gk/fdzdgknr/czxx/czyjs/1.html',
    base + '/zwgk/fdzdgknr/czxx/',
    base + '/zfxxgk/fdzdgknr/czxx/',
    base + '/zwgk/czzj/',
    base + '/zwgk/fdzdgknr/czzj/',
    base + '/gk/czzj/',
    base + '/zfxxgk/czzj/',
    base + '/gk/fdzdgknr/czyjs/',
    // extra patterns seen in Shaanxi
    base + '/gk/fdzdgknr/czxx/czyjs/sj/1.html',
    base + '/zwgk/fdzdgknr/czxx/czyjs/sj/1.html',
    base + '/zfxxgk/fdzdgknr/czxx/czyjs/sj/1.html',
    base + '/zwgk/czyjsgk/',
    base + '/zfxxgk/czyjsgk/',
  ];
}

async function probeCounty(county) {
  const paths = buildPaths(county.gov);
  for (const url of paths) {
    try {
      const res = await fetchUrl(url);
      if (!res.body || res.status >= 400) continue;
      const title = getTitle(res.body);
      // Skip if it's just the homepage title
      if (/^[\s]*$/.test(title)) continue;
      // Check title
      if (FISCAL_KEYWORDS.test(title)) {
        // For .html paths, return the directory up to the last / instead
        let confirmedUrl = url;
        if (url.endsWith('/1.html')) {
          confirmedUrl = url.replace(/\/1\.html$/, '/');
        }
        console.log(`CONFIRMED ${county.city} ${county.name} | ${confirmedUrl} | title="${title}"`);
        return { ...county, url: confirmedUrl, title };
      }
      // Check body for keywords + year + budget/决算 anchors
      if (FISCAL_KEYWORDS.test(res.body)) {
        // Make sure it's substantive fiscal content, not just a nav link
        const hasYearBudget = /\d{4}.*(?:预算|决算)|(?:预算|决算).*\d{4}/.test(res.body);
        if (hasYearBudget) {
          let confirmedUrl = url;
          if (url.endsWith('/1.html')) {
            confirmedUrl = url.replace(/\/1\.html$/, '/');
          }
          console.log(`CONFIRMED ${county.city} ${county.name} | ${confirmedUrl} | title="${title}" (body-match)`);
          return { ...county, url: confirmedUrl, title };
        }
      }
    } catch (e) {
      // timeout or connection error, continue
    }
  }
  console.log(`NOTFOUND ${county.city} ${county.name}`);
  return { ...county, url: '', title: '' };
}

async function main() {
  console.log(`=== Shaanxi fiscal probe: ${counties.length} counties ===\n`);
  const confirmed = [];
  const notFound = [];

  for (let i = 0; i < counties.length; i++) {
    const c = counties[i];
    process.stdout.write(`[${i + 1}/${counties.length}] ${c.city} ${c.name} ... `);
    const result = await probeCounty(c);
    if (result.url) {
      confirmed.push(result);
    } else {
      notFound.push(result);
    }
    // Brief delay to be polite
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n=== RESULTS ===`);
  console.log(`Confirmed: ${confirmed.length} / ${counties.length}`);
  console.log(`Not found: ${notFound.length} / ${counties.length}`);

  if (confirmed.length > 0) {
    console.log(`\n--- CONFIRMED URLs ---`);
    for (const c of confirmed) {
      console.log(`${c.city} ${c.name} | ${c.url}`);
    }
  }

  if (notFound.length > 0) {
    console.log(`\n--- NOT FOUND ---`);
    for (const c of notFound) {
      console.log(`${c.city} ${c.name}`);
    }
  }
}

main().catch(console.error);
