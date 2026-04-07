#!/usr/bin/env node
// Batch probe missing city fiscal URLs using HTTP checks + keyword verification
import https from 'https';
import http from 'http';
import fs from 'fs';

const TIMEOUT = 8000;

const cities = [
  // 河北
  { name: '秦皇岛市', prov: '河北省', domains: ['www.qhd.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/col/col42490/index.html', '/col/col42488/index.html',
  ]},
  // 吉林
  { name: '白山市', prov: '吉林省', domains: ['www.cbs.gov.cn', 'www.jlbs.gov.cn'], paths: [
    '/zwgk/zdlygk/czysjs/zfczyjs/', '/zwgk/zdlygk/czysjs/',
    '/zwgk/czyjsgk/', '/zwgk/czsj/',
  ]},
  { name: '白城市', prov: '吉林省', domains: ['www.jlbc.gov.cn'], paths: [
    '/zwgk/zdlygk/czysjs/zfczyjs/', '/zwgk/zdlygk/czysjs/',
    '/zwgk/czyjsgk/', '/xxgk_3148/zdlygk/czysjs/',
  ]},
  // 黑龙江
  { name: '鸡西市', prov: '黑龙江省', domains: ['www.jixi.gov.cn'], paths: [
    '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/czys/', '/zwgk/zdlygk/czzj/',
    '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '鹤岗市', prov: '黑龙江省', domains: ['www.hegang.gov.cn'], paths: [
    '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/', '/zwgk/zdlygk/czzj/',
    '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '双鸭山市', prov: '黑龙江省', domains: ['www.shuangyashan.gov.cn'], paths: [
    '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/', '/zwgk/zdlygk/czzj/',
    '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '绥化市', prov: '黑龙江省', domains: ['www.suihua.gov.cn'], paths: [
    '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/', '/zwgk/zdlygk/czzj/',
    '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/czyjsgk/',
  ]},
  // 安徽
  { name: '安庆市', prov: '安徽省', domains: ['www.anqing.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/public/6068576/8350516.html', '/zwgk/czyjsgk/',
  ]},
  { name: '宿州市', prov: '安徽省', domains: ['www.ahsz.gov.cn', 'www.suzhou.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/openness/public/6595155/19825993.html', '/zwgk/czyjsgk/',
  ]},
  // 江西
  { name: '九江市', prov: '江西省', domains: ['www.jiujiang.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/art/2021/art_26764/index.html', '/zwgk/czyjsgk/',
  ]},
  { name: '宜春市', prov: '江西省', domains: ['www.yichun.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  { name: '抚州市', prov: '江西省', domains: ['www.jxfz.gov.cn', 'www.fuzhou.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  { name: '上饶市', prov: '江西省', domains: ['www.zgsr.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  // 山东
  { name: '枣庄市', prov: '山东省', domains: ['www.zaozhuang.gov.cn', 'www.zzgov.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/art/czyjsgk/', '/zwgk/czyjsgk/', '/n/czyjs/',
  ]},
  { name: '东营市', prov: '山东省', domains: ['www.dongying.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/art/czyjsgk/',
  ]},
  { name: '菏泽市', prov: '山东省', domains: ['www.heze.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/art/czyjsgk/',
  ]},
  // 海南
  { name: '海口市', prov: '海南省', domains: ['www.haikou.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/xxgk/czysjs/',
  ]},
  { name: '三亚市', prov: '海南省', domains: ['www.sanya.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/xxgk/czysjs/',
  ]},
  // 贵州
  { name: '毕节市', prov: '贵州省', domains: ['www.bijie.gov.cn'], paths: [
    '/zwgk/zdlygk/czyjs/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  { name: '黔南布依族苗族自治州', prov: '贵州省', domains: ['www.qiannan.gov.cn'], paths: [
    '/zwgk/zdlygk/czyjs/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  // 云南
  { name: '丽江市', prov: '云南省', domains: ['www.lijiang.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czysjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '普洱市', prov: '云南省', domains: ['www.puershi.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czysjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '红河哈尼族彝族自治州', prov: '云南省', domains: ['www.hh.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czysjs/', '/zfxxgk/fdzdgknr/ysjs/',
    '/zwgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/',
  ]},
  { name: '西双版纳傣族自治州', prov: '云南省', domains: ['www.xsbn.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czysjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '大理白族自治州', prov: '云南省', domains: ['www.dali.gov.cn'], paths: [
    '/dlzrmzf/xxgkml/c105885/pc/list.html',
    '/dlzrmzf/c101529/pc/list.html',
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/czyjsgk/',
  ]},
  // 甘肃
  { name: '金昌市', prov: '甘肃省', domains: ['www.jinchang.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czxx/czyjs/', '/zwgk/czyjsgk/',
    '/art/czyjsgk/',
  ]},
  { name: '武威市', prov: '甘肃省', domains: ['www.wuwei.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czxx/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '陇南市', prov: '甘肃省', domains: ['www.longnan.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czxx/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '临夏回族自治州', prov: '甘肃省', domains: ['www.linxia.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czxx/czyjs/', '/zwgk/czyjsgk/',
  ]},
  { name: '甘南藏族自治州', prov: '甘肃省', domains: ['www.gnzrmzf.gov.cn', 'www.gannan.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zfxxgk/fdzdgknr/czxx/czyjs/', '/zwgk/czyjsgk/',
  ]},
  // 青海
  { name: '海北藏族自治州', prov: '青海省', domains: ['www.haibei.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/zwgk/zfxxgkml/ysjs/',
  ]},
  { name: '黄南藏族自治州', prov: '青海省', domains: ['www.huangnan.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  { name: '海南藏族自治州', prov: '青海省', domains: ['www.hainanzhou.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  { name: '果洛藏族自治州', prov: '青海省', domains: ['www.guoluo.gov.cn', 'www.golog.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/',
  ]},
  // 宁夏
  { name: '石嘴山市', prov: '宁夏回族自治区', domains: ['www.shizuishan.gov.cn', 'www.nxszs.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/zwgk/gkml/czyjsjsgjf/',
  ]},
  { name: '吴忠市', prov: '宁夏回族自治区', domains: ['www.wuzhong.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/zwgk/gkml/czyjsjsgjf/',
  ]},
  { name: '固原市', prov: '宁夏回族自治区', domains: ['www.guyuan.gov.cn', 'www.nxgy.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/zwgk/gkml/czyjsjsgjf/',
  ]},
  { name: '中卫市', prov: '宁夏回族自治区', domains: ['www.nxzw.gov.cn', 'www.zhongwei.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/czyjsgk/', '/zwgk/gkml/czyjsjsgjf/',
  ]},
];

const fiscalKeywords = ['预算', '决算', '财政', '三公'];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => resolve({ status: 0 }), TIMEOUT);
    const req = mod.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        clearTimeout(timer);
        resolve({ status: res.statusCode, redirect: res.headers.location });
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', d => { if (body.length < 50000) body += d; });
      res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, body }); });
    });
    req.on('error', () => { clearTimeout(timer); resolve({ status: 0 }); });
    req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ status: 0 }); });
  });
}

async function findCity(city) {
  for (const domain of city.domains) {
    for (const path of city.paths) {
      for (const scheme of ['https', 'http']) {
        const url = `${scheme}://${domain}${path}`;
        const res = await fetchUrl(url);
        if (res.status === 200 && res.body) {
          const kwCount = fiscalKeywords.filter(kw => res.body.includes(kw)).length;
          if (kwCount >= 2) {
            return { url, kwCount, confirmed: true };
          }
          if (kwCount === 1) {
            // Keep looking but remember this partial hit
            return { url, kwCount, confirmed: false };
          }
        }
        // Follow one redirect
        if (res.redirect) {
          let redir = res.redirect;
          if (redir.startsWith('/')) redir = `${scheme}://${domain}${redir}`;
          const res2 = await fetchUrl(redir);
          if (res2.status === 200 && res2.body) {
            const kwCount = fiscalKeywords.filter(kw => res2.body.includes(kw)).length;
            if (kwCount >= 2) return { url: redir, kwCount, confirmed: true };
            if (kwCount === 1) return { url: redir, kwCount, confirmed: false };
          }
        }
        if (res.status === 200 || res.status === 404 || res.status === 403) break;
      }
    }
  }
  return null;
}

async function main() {
  console.log(`Probing ${cities.length} missing cities...\n`);
  const found = [];
  const partial = [];
  const notFound = [];

  for (const city of cities) {
    process.stdout.write(`[${city.prov} > ${city.name}] `);
    const result = await findCity(city);
    if (result && result.confirmed) {
      console.log(`✅ ${result.url} (kw=${result.kwCount})`);
      found.push({ ...city, url: result.url, kwCount: result.kwCount });
    } else if (result) {
      console.log(`⚡ ${result.url} (partial, kw=${result.kwCount})`);
      partial.push({ ...city, url: result.url, kwCount: result.kwCount });
    } else {
      console.log('❌ not found');
      notFound.push(city);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Confirmed: ${found.length}`);
  found.forEach(c => console.log(`  ✅ ${c.prov} > ${c.name}: ${c.url}`));
  console.log(`Partial: ${partial.length}`);
  partial.forEach(c => console.log(`  ⚡ ${c.prov} > ${c.name}: ${c.url}`));
  console.log(`Not found: ${notFound.length}`);
  notFound.forEach(c => console.log(`  ❌ ${c.prov} > ${c.name}`));

  // Save results
  fs.writeFileSync('scripts/city-probe-results.json', JSON.stringify({ found, partial, notFound }, null, 2));
  console.log('\nResults saved to scripts/city-probe-results.json');

  // Apply confirmed results to data file
  if (found.length > 0) {
    let data = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
    let applied = 0;
    for (const c of found) {
      const pattern = `name: "${c.name}",\n        url: ""`;
      if (data.includes(pattern)) {
        data = data.replace(pattern, `name: "${c.name}",\n        url: "${c.url}"`);
        applied++;
      }
    }
    // Also apply partials
    for (const c of partial) {
      const pattern = `name: "${c.name}",\n        url: ""`;
      if (data.includes(pattern)) {
        data = data.replace(pattern, `name: "${c.name}",\n        url: "${c.url}"`);
        applied++;
      }
    }
    fs.writeFileSync('data/fiscal-budget-links.ts', data);
    console.log(`Applied ${applied} city URLs to data file`);
  }
}

main().catch(console.error);
