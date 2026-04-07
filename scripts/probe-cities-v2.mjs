#!/usr/bin/env node
// Enhanced city fiscal URL probe with many more path patterns
import https from 'https';
import http from 'http';
import fs from 'fs';

const TIMEOUT = 8000;
const fiscalKeywords = ['预算', '决算', '财政', '三公'];

// Common patterns from confirmed working URLs across provinces
const COMMON_PATTERNS = [
  // 法定主动公开 - 贵州/云南常见
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/czzj/',
  // 重点领域 常见
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlygk/czyjs/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zdlyxxgk/czyjsgk/',
  // 东北/吉林特色
  '/zwgk/zdlygk/czysjs/zfczyjs/',
  '/zwgk/zdlygk/czysjs/',
  '/zwgk/czsj/',
  '/zwgk/ysjs/',
  // 黑龙江
  '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/',
  '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/czys/',
  // 安徽
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  // 山东
  '/art/czyjsgk/',
  '/n/czyjs/',
  // 海南
  '/xxgk/czysjs/',
  '/xxgk/czzj/',
  // 甘肃
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/xxgkml/czyjsgk/',
  '/zwgk/zfxxgkml/czyjsgk/',
  // 宁夏
  '/zwgk/gkml/czyjsjsgjf/',
  '/zwgk/gkml/czzj/',
  // 青海
  '/zwgk/zfxxgkml/ysjs/',
  '/zwgk/zfxxgk/ysjs/',
  // 通用
  '/zwgk/czxx/',
  '/zwgk/czgk/',
  '/zwgk/cwgk/',
  '/zwgk/gwgb/czys/',
];

const cities = [
  // 河北
  { name: '秦皇岛市', prov: '河北省', domains: ['www.qhd.gov.cn'] },
  // 吉林
  { name: '白山市', prov: '吉林省', domains: ['www.cbs.gov.cn', 'www.jlbs.gov.cn'] },
  { name: '白城市', prov: '吉林省', domains: ['www.jlbc.gov.cn'] },
  // 黑龙江
  { name: '鸡西市', prov: '黑龙江省', domains: ['www.jixi.gov.cn'] },
  { name: '鹤岗市', prov: '黑龙江省', domains: ['www.hegang.gov.cn'] },
  { name: '双鸭山市', prov: '黑龙江省', domains: ['www.shuangyashan.gov.cn'] },
  { name: '绥化市', prov: '黑龙江省', domains: ['www.suihua.gov.cn'] },
  // 安徽
  { name: '安庆市', prov: '安徽省', domains: ['www.anqing.gov.cn'] },
  { name: '宿州市', prov: '安徽省', domains: ['www.ahsz.gov.cn'] },
  // 江西
  { name: '九江市', prov: '江西省', domains: ['www.jiujiang.gov.cn'] },
  { name: '宜春市', prov: '江西省', domains: ['www.yichun.gov.cn'] },
  { name: '抚州市', prov: '江西省', domains: ['www.jxfz.gov.cn'] },
  { name: '上饶市', prov: '江西省', domains: ['www.zgsr.gov.cn'] },
  // 山东
  { name: '枣庄市', prov: '山东省', domains: ['www.zaozhuang.gov.cn'] },
  { name: '东营市', prov: '山东省', domains: ['www.dongying.gov.cn'] },
  { name: '菏泽市', prov: '山东省', domains: ['www.heze.gov.cn'] },
  // 海南
  { name: '海口市', prov: '海南省', domains: ['www.haikou.gov.cn'] },
  { name: '三亚市', prov: '海南省', domains: ['www.sanya.gov.cn'] },
  // 贵州
  { name: '毕节市', prov: '贵州省', domains: ['www.bijie.gov.cn'] },
  { name: '黔南布依族苗族自治州', prov: '贵州省', domains: ['www.qiannan.gov.cn'] },
  // 云南
  { name: '丽江市', prov: '云南省', domains: ['www.lijiang.gov.cn'] },
  { name: '普洱市', prov: '云南省', domains: ['www.puershi.gov.cn'] },
  { name: '红河哈尼族彝族自治州', prov: '云南省', domains: ['www.hh.gov.cn'] },
  { name: '西双版纳傣族自治州', prov: '云南省', domains: ['www.xsbn.gov.cn'] },
  { name: '大理白族自治州', prov: '云南省', domains: ['www.dali.gov.cn'] },
  // 甘肃
  { name: '金昌市', prov: '甘肃省', domains: ['www.jinchang.gov.cn'] },
  { name: '武威市', prov: '甘肃省', domains: ['www.wuwei.gov.cn'] },
  { name: '陇南市', prov: '甘肃省', domains: ['www.longnan.gov.cn'] },
  { name: '临夏回族自治州', prov: '甘肃省', domains: ['www.linxia.gov.cn'] },
  { name: '甘南藏族自治州', prov: '甘肃省', domains: ['www.gnzrmzf.gov.cn', 'www.gannan.gov.cn'] },
  // 青海
  { name: '海北藏族自治州', prov: '青海省', domains: ['www.haibei.gov.cn'] },
  { name: '黄南藏族自治州', prov: '青海省', domains: ['www.huangnan.gov.cn'] },
  { name: '海南藏族自治州', prov: '青海省', domains: ['www.hainanzhou.gov.cn'] },
  { name: '果洛藏族自治州', prov: '青海省', domains: ['www.guoluo.gov.cn', 'www.golog.gov.cn'] },
  // 宁夏
  { name: '石嘴山市', prov: '宁夏回族自治区', domains: ['www.shizuishan.gov.cn', 'www.nxszs.gov.cn'] },
  { name: '吴忠市', prov: '宁夏回族自治区', domains: ['www.wuzhong.gov.cn'] },
  { name: '固原市', prov: '宁夏回族自治区', domains: ['www.guyuan.gov.cn', 'www.nxgy.gov.cn'] },
  { name: '中卫市', prov: '宁夏回族自治区', domains: ['www.nxzw.gov.cn', 'www.zhongwei.gov.cn'] },
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => { resolve({ status: 0 }); }, TIMEOUT);
    try {
      const req = mod.get(url, {
        timeout: TIMEOUT,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          clearTimeout(timer);
          resolve({ status: res.statusCode, redirect: res.headers.location });
          res.resume();
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', d => { if (body.length < 80000) body += d; });
        res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, body }); });
        res.on('error', () => { clearTimeout(timer); resolve({ status: res.statusCode, body }); });
      });
      req.on('error', () => { clearTimeout(timer); resolve({ status: 0 }); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ status: 0 }); });
    } catch (e) { clearTimeout(timer); resolve({ status: 0 }); }
  });
}

async function probeCity(city) {
  let bestUrl = null;
  let bestKw = 0;

  for (const domain of city.domains) {
    // Try HTTPS first, fallback to HTTP
    for (const scheme of ['https', 'http']) {
      let domainAlive = false;
      
      for (const path of COMMON_PATTERNS) {
        const url = `${scheme}://${domain}${path}`;
        const res = await fetchUrl(url);
        
        if (res.status === 200 && res.body) {
          domainAlive = true;
          // Check for error pages / 404 pages 
          if (res.body.includes('404') && res.body.includes('找不到') && res.body.length < 5000) continue;
          if (res.body.includes('您访问的页面不存在') || res.body.includes('page not found')) continue;
          
          const kwCount = fiscalKeywords.filter(kw => res.body.includes(kw)).length;
          if (kwCount > bestKw) {
            bestKw = kwCount;
            bestUrl = url;
          }
          if (kwCount >= 3) {
            return { url, kwCount, confirmed: true };
          }
        } else if (res.status === 0) {
          // timeout for this scheme
        } else if (res.status === 200) {
          domainAlive = true;
        }
        
        // Follow redirect
        if (res.redirect) {
          let redir = res.redirect;
          if (redir.startsWith('/')) redir = `${scheme}://${domain}${redir}`;
          const res2 = await fetchUrl(redir);
          if (res2.status === 200 && res2.body) {
            if (res2.body.includes('您访问的页面不存在') || (res2.body.includes('404') && res2.body.length < 5000)) continue;
            const kwCount = fiscalKeywords.filter(kw => res2.body.includes(kw)).length;
            if (kwCount > bestKw) {
              bestKw = kwCount;
              bestUrl = redir;
            }
            if (kwCount >= 3) return { url: redir, kwCount, confirmed: true };
          }
        }
      }
      
      if (domainAlive) break; // Found working scheme, don't try the other
    }
  }

  if (bestUrl && bestKw >= 2) return { url: bestUrl, kwCount: bestKw, confirmed: true };
  if (bestUrl && bestKw >= 1) return { url: bestUrl, kwCount: bestKw, confirmed: false };
  return null;
}

async function main() {
  console.log(`Enhanced probe: ${cities.length} cities × ${COMMON_PATTERNS.length} patterns\n`);
  const found = [], partial = [], notFound = [];

  for (const city of cities) {
    process.stdout.write(`[${city.prov} > ${city.name}] `);
    const result = await probeCity(city);
    if (result?.confirmed) {
      console.log(`✅ ${result.url} (kw=${result.kwCount})`);
      found.push({ name: city.name, prov: city.prov, url: result.url, kwCount: result.kwCount });
    } else if (result) {
      console.log(`⚡ ${result.url} (partial kw=${result.kwCount})`);
      partial.push({ name: city.name, prov: city.prov, url: result.url, kwCount: result.kwCount });
    } else {
      console.log('❌');
      notFound.push({ name: city.name, prov: city.prov, domains: city.domains });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Confirmed (kw≥2): ${found.length}`);
  found.forEach(c => console.log(`  ✅ ${c.prov} > ${c.name}: ${c.url}`));
  console.log(`Partial (kw=1): ${partial.length}`);
  partial.forEach(c => console.log(`  ⚡ ${c.prov} > ${c.name}: ${c.url}`));
  console.log(`Not found: ${notFound.length}`);
  notFound.forEach(c => console.log(`  ❌ ${c.prov} > ${c.name}`));

  fs.writeFileSync('scripts/city-probe-v2-results.json', JSON.stringify({ found, partial, notFound }, null, 2));
  console.log('\nSaved to scripts/city-probe-v2-results.json');
}

main().catch(console.error);
