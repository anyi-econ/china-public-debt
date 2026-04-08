import https from 'https';
import http from 'http';
import fs from 'fs';

const paths = [
  '/zwgk/zdlygk/czyjs/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlygk/czzj/czyjs/',
  '/zwgk/czzj/',
];

const counties = [
  { n:'南明区', c:'贵阳', d:'www.nanming.gov.cn' },
  { n:'云岩区', c:'贵阳', d:'www.yunyan.gov.cn' },
  { n:'花溪区', c:'贵阳', d:'www.huaxi.gov.cn' },
  { n:'乌当区', c:'贵阳', d:'www.wudang.gov.cn' },
  { n:'白云区', c:'贵阳', d:'www.baiyun.gov.cn' },
  { n:'观山湖区', c:'贵阳', d:'www.gsh.gov.cn' },
  { n:'开阳县', c:'贵阳', d:'www.kaiyang.gov.cn' },
  { n:'息烽县', c:'贵阳', d:'www.xifeng.gov.cn' },
  { n:'修文县', c:'贵阳', d:'www.xiuwen.gov.cn' },
  { n:'钟山区', c:'六盘水', d:'www.gzzs.gov.cn' },
  { n:'六枝特区', c:'六盘水', d:'www.liuzhi.gov.cn' },
  { n:'水城区', c:'六盘水', d:'www.shuicheng.gov.cn' },
  { n:'盘州市', c:'六盘水', d:'www.panzhou.gov.cn' },
  { n:'红花岗区', c:'遵义', d:'www.zyhhg.gov.cn' },
  { n:'汇川区', c:'遵义', d:'www.huichuan.gov.cn' },
  { n:'播州区', c:'遵义', d:'www.bozhou.gov.cn' },
  { n:'桐梓县', c:'遵义', d:'www.tongzi.gov.cn' },
  { n:'正安县', c:'遵义', d:'www.gzza.gov.cn' },
  { n:'道真县', c:'遵义', d:'www.gzdaozhen.gov.cn' },
  { n:'务川县', c:'遵义', d:'www.gzwuchuan.gov.cn' },
  { n:'凤冈县', c:'遵义', d:'www.gzfenggang.gov.cn' },
  { n:'湄潭县', c:'遵义', d:'www.meitan.gov.cn' },
  { n:'余庆县', c:'遵义', d:'www.yuqing.gov.cn' },
  { n:'习水县', c:'遵义', d:'www.gzxishui.gov.cn' },
  { n:'赤水市', c:'遵义', d:'www.chishui.gov.cn' },
  { n:'仁怀市', c:'遵义', d:'www.renhuai.gov.cn' },
  { n:'西秀区', c:'安顺', d:'www.xixiu.gov.cn' },
  { n:'平坝区', c:'安顺', d:'www.pingba.gov.cn' },
  { n:'普定县', c:'安顺', d:'www.aspd.gov.cn' },
  { n:'镇宁县', c:'安顺', d:'www.gzzn.gov.cn' },
  { n:'关岭县', c:'安顺', d:'www.guanling.gov.cn' },
  { n:'紫云县', c:'安顺', d:'www.gzzy.gov.cn' },
  { n:'七星关区', c:'毕节', d:'www.bjqixingguan.gov.cn' },
  { n:'黔西市', c:'毕节', d:'www.gzqianxi.gov.cn' },
  { n:'金沙县', c:'毕节', d:'www.gzjinsha.gov.cn' },
  { n:'纳雍县', c:'毕节', d:'www.gznayong.gov.cn' },
  { n:'威宁县', c:'毕节', d:'www.gzweining.gov.cn' },
  { n:'赫章县', c:'毕节', d:'www.gzhezhang.gov.cn' },
  { n:'碧江区', c:'铜仁', d:'www.bijiang.gov.cn' },
  { n:'万山区', c:'铜仁', d:'www.trws.gov.cn' },
  { n:'江口县', c:'铜仁', d:'www.jiangkou.gov.cn' },
  { n:'玉屏县', c:'铜仁', d:'www.yuping.gov.cn' },
  { n:'石阡县', c:'铜仁', d:'www.shiqian.gov.cn' },
  { n:'思南县', c:'铜仁', d:'www.sinan.gov.cn' },
  { n:'印江县', c:'铜仁', d:'www.yinjiang.gov.cn' },
  { n:'德江县', c:'铜仁', d:'www.dejiang.gov.cn' },
  { n:'沿河县', c:'铜仁', d:'www.yanhe.gov.cn' },
  { n:'松桃县', c:'铜仁', d:'www.songtao.gov.cn' },
  { n:'兴义市', c:'黔西南', d:'www.gzxy.gov.cn' },
  { n:'兴仁市', c:'黔西南', d:'gzxr.gov.cn' },
  { n:'普安县', c:'黔西南', d:'puan.gov.cn' },
  { n:'晴隆县', c:'黔西南', d:'ql.qxn.gov.cn' },
  { n:'贞丰县', c:'黔西南', d:'zhenfeng.gov.cn' },
  { n:'望谟县', c:'黔西南', d:'wangmo.gov.cn' },
  { n:'册亨县', c:'黔西南', d:'ceheng.gov.cn' },
  { n:'安龙县', c:'黔西南', d:'anlong.gov.cn' },
  { n:'凯里市', c:'黔东南', d:'www.qdnkaili.gov.cn' },
  { n:'黄平县', c:'黔东南', d:'www.qdnhp.gov.cn' },
  { n:'施秉县', c:'黔东南', d:'www.gzsb.gov.cn' },
  { n:'三穗县', c:'黔东南', d:'www.gzsansui.gov.cn' },
  { n:'镇远县', c:'黔东南', d:'www.qdnzhenyuan.gov.cn' },
  { n:'岑巩县', c:'黔东南', d:'www.qdncengong.gov.cn' },
  { n:'天柱县', c:'黔东南', d:'www.gz-tj.gov.cn' },
  { n:'锦屏县', c:'黔东南', d:'www.qdnjp.gov.cn' },
  { n:'剑河县', c:'黔东南', d:'www.qdnjianhe.gov.cn' },
  { n:'台江县', c:'黔东南', d:'www.gztaijiang.gov.cn' },
  { n:'黎平县', c:'黔东南', d:'www.qdnlp.gov.cn' },
  { n:'榕江县', c:'黔东南', d:'www.rongjiang.gov.cn' },
  { n:'从江县', c:'黔东南', d:'www.qdncongjiang.gov.cn' },
  { n:'雷山县', c:'黔东南', d:'www.gzleishan.gov.cn' },
  { n:'麻江县', c:'黔东南', d:'www.gzmajiang.gov.cn' },
  { n:'丹寨县', c:'黔东南', d:'www.qdndz.gov.cn' },
  { n:'都匀市', c:'黔南', d:'www.douyun.gov.cn' },
  { n:'福泉市', c:'黔南', d:'www.fuquan.gov.cn' },
  { n:'荔波县', c:'黔南', d:'www.libo.gov.cn' },
  { n:'贵定县', c:'黔南', d:'www.guiding.gov.cn' },
  { n:'瓮安县', c:'黔南', d:'www.wengan.gov.cn' },
  { n:'独山县', c:'黔南', d:'www.dushan.gov.cn' },
  { n:'平塘县', c:'黔南', d:'www.pingtang.gov.cn' },
  { n:'罗甸县', c:'黔南', d:'www.luodian.gov.cn' },
  { n:'长顺县', c:'黔南', d:'www.changshun.gov.cn' },
  { n:'龙里县', c:'黔南', d:'www.longli.gov.cn' },
  { n:'惠水县', c:'黔南', d:'www.huishui.gov.cn' },
  { n:'三都县', c:'黔南', d:'www.sdshui.gov.cn' },
];

function check(url) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(-2), 5000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const opts = { 
        timeout: 4500, 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, 
        rejectUnauthorized: false 
      };
      const req = mod.get(url, opts, res => {
        let data = '';
        res.on('data', chunk => { data += chunk.toString().substring(0, 300); });
        res.on('end', () => { clearTimeout(timer); resolve({ code: res.statusCode, len: data.length }); });
        res.on('error', () => { clearTimeout(timer); resolve({ code: -1, len: 0 }); });
      });
      req.on('error', () => { clearTimeout(timer); resolve({ code: -1, len: 0 }); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ code: -2, len: 0 }); });
    } catch(e) { clearTimeout(timer); resolve({ code: -3, len: 0 }); }
  });
}

async function main() {
  const results = {};
  
  // Process each county sequentially, but paths in parallel
  for (let ci = 0; ci < counties.length; ci++) {
    const county = counties[ci];
    results[county.n] = { county, urls: [] };
    
    // Try HTTPS paths in parallel
    const httpsResults = await Promise.all(
      paths.map(p => check(`https://${county.d}${p}`))
    );
    
    for (let pi = 0; pi < paths.length; pi++) {
      if (httpsResults[pi].code === 200) {
        results[county.n].urls.push(`https://${county.d}${paths[pi]}`);
      }
    }
    
    // If no HTTPS results, try HTTP
    if (results[county.n].urls.length === 0) {
      const httpResults = await Promise.all(
        paths.map(p => check(`http://${county.d}${p}`))
      );
      for (let pi = 0; pi < paths.length; pi++) {
        if (httpResults[pi].code === 200) {
          results[county.n].urls.push(`http://${county.d}${paths[pi]}`);
        }
      }
    }
    
    const status = results[county.n].urls.length > 0 ? 'OK' : '--';
    process.stderr.write(`[${ci+1}/${counties.length}] ${status} ${county.n}\n`);
  }
  
  // Output
  const lines = [];
  let found = 0;
  for (const county of counties) {
    const r = results[county.n];
    if (r.urls.length > 0) {
      lines.push(`OK | ${county.c} | ${county.n} | ${r.urls.join(' ; ')}`);
      found++;
    } else {
      lines.push(`-- | ${county.c} | ${county.n} | NO MATCH`);
    }
  }
  lines.push(`\nFound: ${found} / ${counties.length}`);
  
  const output = lines.join('\n');
  fs.writeFileSync('scripts/_guizhou_probe_results.txt', output, 'utf-8');
  console.log(output);
}

main().catch(e => { console.error(e); process.exit(1); });
