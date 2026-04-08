import https from 'https';
import http from 'http';

const paths = [
  '/zwgk/zdlygk/czyjs/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlygk/czzj/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/czzj/',
  '/zwgk/zdlyxxgk/czysj/',
  '/zwgk/zdlyxx/czyjs/',
];

const counties = [
  // 贵阳市
  { name: '南明区', city: '贵阳市', domain: 'www.nanming.gov.cn' },
  { name: '云岩区', city: '贵阳市', domain: 'www.yunyan.gov.cn' },
  { name: '花溪区', city: '贵阳市', domain: 'www.huaxi.gov.cn' },
  { name: '乌当区', city: '贵阳市', domain: 'www.wudang.gov.cn' },
  { name: '白云区', city: '贵阳市', domain: 'www.baiyun.gov.cn' },
  { name: '观山湖区', city: '贵阳市', domain: 'www.gsh.gov.cn' },
  { name: '开阳县', city: '贵阳市', domain: 'www.kaiyang.gov.cn' },
  { name: '息烽县', city: '贵阳市', domain: 'www.xifeng.gov.cn' },
  { name: '修文县', city: '贵阳市', domain: 'www.xiuwen.gov.cn' },
  // 六盘水市
  { name: '钟山区', city: '六盘水市', domain: 'www.gzzs.gov.cn' },
  { name: '六枝特区', city: '六盘水市', domain: 'www.liuzhi.gov.cn' },
  { name: '水城区', city: '六盘水市', domain: 'www.shuicheng.gov.cn' },
  { name: '盘州市', city: '六盘水市', domain: 'www.panzhou.gov.cn' },
  // 遵义市
  { name: '红花岗区', city: '遵义市', domain: 'www.zyhhg.gov.cn' },
  { name: '汇川区', city: '遵义市', domain: 'www.huichuan.gov.cn' },
  { name: '播州区', city: '遵义市', domain: 'www.bozhou.gov.cn' },
  { name: '桐梓县', city: '遵义市', domain: 'www.tongzi.gov.cn' },
  { name: '正安县', city: '遵义市', domain: 'www.gzza.gov.cn' },
  { name: '道真仡佬族苗族自治县', city: '遵义市', domain: 'www.gzdaozhen.gov.cn' },
  { name: '务川仡佬族苗族自治县', city: '遵义市', domain: 'www.gzwuchuan.gov.cn' },
  { name: '凤冈县', city: '遵义市', domain: 'www.gzfenggang.gov.cn' },
  { name: '湄潭县', city: '遵义市', domain: 'www.meitan.gov.cn' },
  { name: '余庆县', city: '遵义市', domain: 'www.yuqing.gov.cn' },
  { name: '习水县', city: '遵义市', domain: 'www.gzxishui.gov.cn' },
  { name: '赤水市', city: '遵义市', domain: 'www.chishui.gov.cn' },
  { name: '仁怀市', city: '遵义市', domain: 'www.renhuai.gov.cn' },
  // 安顺市
  { name: '西秀区', city: '安顺市', domain: 'www.xixiu.gov.cn' },
  { name: '平坝区', city: '安顺市', domain: 'www.pingba.gov.cn' },
  { name: '普定县', city: '安顺市', domain: 'www.aspd.gov.cn' },
  { name: '镇宁布依族苗族自治县', city: '安顺市', domain: 'www.gzzn.gov.cn' },
  { name: '关岭布依族苗族自治县', city: '安顺市', domain: 'www.guanling.gov.cn' },
  { name: '紫云苗族布依族自治县', city: '安顺市', domain: 'www.gzzy.gov.cn' },
  // 毕节市
  { name: '七星关区', city: '毕节市', domain: 'www.bjqixingguan.gov.cn' },
  { name: '黔西市', city: '毕节市', domain: 'www.gzqianxi.gov.cn' },
  { name: '金沙县', city: '毕节市', domain: 'www.gzjinsha.gov.cn' },
  { name: '纳雍县', city: '毕节市', domain: 'www.gznayong.gov.cn' },
  { name: '威宁彝族回族苗族自治县', city: '毕节市', domain: 'www.gzweining.gov.cn' },
  { name: '赫章县', city: '毕节市', domain: 'www.gzhezhang.gov.cn' },
  // 铜仁市
  { name: '碧江区', city: '铜仁市', domain: 'www.bijiang.gov.cn' },
  { name: '万山区', city: '铜仁市', domain: 'www.trws.gov.cn' },
  { name: '江口县', city: '铜仁市', domain: 'www.jiangkou.gov.cn' },
  { name: '玉屏侗族自治县', city: '铜仁市', domain: 'www.yuping.gov.cn' },
  { name: '石阡县', city: '铜仁市', domain: 'www.shiqian.gov.cn' },
  { name: '思南县', city: '铜仁市', domain: 'www.sinan.gov.cn' },
  { name: '印江土家族苗族自治县', city: '铜仁市', domain: 'www.yinjiang.gov.cn' },
  { name: '德江县', city: '铜仁市', domain: 'www.dejiang.gov.cn' },
  { name: '沿河土家族自治县', city: '铜仁市', domain: 'www.yanhe.gov.cn' },
  { name: '松桃苗族自治县', city: '铜仁市', domain: 'www.songtao.gov.cn' },
  // 黔西南州
  { name: '兴义市', city: '黔西南州', domain: 'www.gzxy.gov.cn' },
  { name: '兴仁市', city: '黔西南州', domain: 'gzxr.gov.cn' },
  { name: '普安县', city: '黔西南州', domain: 'puan.gov.cn' },
  { name: '晴隆县', city: '黔西南州', domain: 'ql.qxn.gov.cn' },
  { name: '贞丰县', city: '黔西南州', domain: 'zhenfeng.gov.cn' },
  { name: '望谟县', city: '黔西南州', domain: 'wangmo.gov.cn' },
  { name: '册亨县', city: '黔西南州', domain: 'ceheng.gov.cn' },
  { name: '安龙县', city: '黔西南州', domain: 'anlong.gov.cn' },
  // 黔东南州
  { name: '凯里市', city: '黔东南州', domain: 'www.qdnkaili.gov.cn' },
  { name: '黄平县', city: '黔东南州', domain: 'www.qdnhp.gov.cn' },
  { name: '施秉县', city: '黔东南州', domain: 'www.gzsb.gov.cn' },
  { name: '三穗县', city: '黔东南州', domain: 'www.gzsansui.gov.cn' },
  { name: '镇远县', city: '黔东南州', domain: 'www.qdnzhenyuan.gov.cn' },
  { name: '岑巩县', city: '黔东南州', domain: 'www.qdncengong.gov.cn' },
  { name: '天柱县', city: '黔东南州', domain: 'www.gz-tj.gov.cn' },
  { name: '锦屏县', city: '黔东南州', domain: 'www.qdnjp.gov.cn' },
  { name: '剑河县', city: '黔东南州', domain: 'www.qdnjianhe.gov.cn' },
  { name: '台江县', city: '黔东南州', domain: 'www.gztaijiang.gov.cn' },
  { name: '黎平县', city: '黔东南州', domain: 'www.qdnlp.gov.cn' },
  { name: '榕江县', city: '黔东南州', domain: 'www.rongjiang.gov.cn' },
  { name: '从江县', city: '黔东南州', domain: 'www.qdncongjiang.gov.cn' },
  { name: '雷山县', city: '黔东南州', domain: 'www.gzleishan.gov.cn' },
  { name: '麻江县', city: '黔东南州', domain: 'www.gzmajiang.gov.cn' },
  { name: '丹寨县', city: '黔东南州', domain: 'www.qdndz.gov.cn' },
  // 黔南州
  { name: '都匀市', city: '黔南州', domain: 'www.douyun.gov.cn' },
  { name: '福泉市', city: '黔南州', domain: 'www.fuquan.gov.cn' },
  { name: '荔波县', city: '黔南州', domain: 'www.libo.gov.cn' },
  { name: '贵定县', city: '黔南州', domain: 'www.guiding.gov.cn' },
  { name: '瓮安县', city: '黔南州', domain: 'www.wengan.gov.cn' },
  { name: '独山县', city: '黔南州', domain: 'www.dushan.gov.cn' },
  { name: '平塘县', city: '黔南州', domain: 'www.pingtang.gov.cn' },
  { name: '罗甸县', city: '黔南州', domain: 'www.luodian.gov.cn' },
  { name: '长顺县', city: '黔南州', domain: 'www.changshun.gov.cn' },
  { name: '龙里县', city: '黔南州', domain: 'www.longli.gov.cn' },
  { name: '惠水县', city: '黔南州', domain: 'www.huishui.gov.cn' },
  { name: '三都水族自治县', city: '黔南州', domain: 'www.sdshui.gov.cn' },
];

function checkUrl(url) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(-2), 6000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
        res.resume();
        res.on('end', () => { clearTimeout(timer); resolve(res.statusCode); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(-1); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(-2); });
    } catch(e) { clearTimeout(timer); resolve(-3); }
  });
}

async function probeCounty(county) {
  const results = [];
  for (const path of paths) {
    // Try HTTPS first
    let url = `https://${county.domain}${path}`;
    let code = await checkUrl(url);
    if (code === 200) {
      results.push({ path, proto: 'https', code });
      continue;
    }
    // Then HTTP
    url = `http://${county.domain}${path}`;
    code = await checkUrl(url);
    if (code === 200) {
      results.push({ path, proto: 'http', code });
    }
  }
  return { ...county, results };
}

import fs from 'fs';

// Process in batches of 10 to avoid overwhelming connections
async function main() {
  const allResults = [];
  for (let i = 0; i < counties.length; i += 10) {
    const batch = counties.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(c => probeCounty(c)));
    allResults.push(...batchResults);
    process.stderr.write(`Processed ${Math.min(i + 10, counties.length)}/${counties.length}\n`);
  }

  // Output results
  const lines = ['\n=== RESULTS ==='];
  let found = 0, notFound = 0;
  for (const r of allResults) {
    if (r.results.length > 0) {
      const best = r.results[0];
      lines.push(`OK | ${r.city} | ${r.name} | ${best.proto}://${r.domain}${best.path}`);
      found++;
    } else {
      lines.push(`-- | ${r.city} | ${r.name} | NO MATCH (domain: ${r.domain})`);
      notFound++;
    }
  }
  lines.push(`\nFound: ${found}, Not found: ${notFound}`);
  const output = lines.join('\n');
  fs.writeFileSync('scripts/_guizhou_probe_results.txt', output, 'utf-8');
  console.log(output);
}

main().catch(console.error);
