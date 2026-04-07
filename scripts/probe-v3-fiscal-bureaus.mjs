#!/usr/bin/env node
// V3: Focus on fiscal bureau domains + CMS-specific patterns for remaining 33 cities
import https from 'https';
import http from 'http';
import fs from 'fs';

const TIMEOUT = 10000;
const CONCURRENCY = 6;
const fiscalKeywords = ['预算', '决算', '财政', '三公'];

// For each city, we try:
// 1. czj.{pinyin}.gov.cn (fiscal bureau domain)
// 2. czt.{pinyin}.gov.cn (alternate fiscal bureau)  
// 3. www.{pinyin}.gov.cn with fiscal paths
// 4. Province-specific CMS patterns
const cities = [
  // 黑龙江 (4) - HLJ CMS uses /sh/, /hegang/ etc prefixes
  { name: '鸡西市', prov: '黑龙江省', pinyin: 'jixi',
    tryDomains: ['czj.jixi.gov.cn', 'www.jixi.gov.cn'],
    tryPaths: [
      '/jixi/c100103/common_zfxxgk.shtml',  // 法定主动公开 main - then JS to 预算
    ],
    extraUrls: [] },
  { name: '鹤岗市', prov: '黑龙江省', pinyin: 'hegang',
    tryDomains: ['czj.hegang.gov.cn', 'www.hegang.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '双鸭山市', prov: '黑龙江省', pinyin: 'shuangyashan',
    tryDomains: ['czj.shuangyashan.gov.cn', 'www.shuangyashan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '绥化市', prov: '黑龙江省', pinyin: 'suihua',
    tryDomains: ['czj.suihua.gov.cn'],
    tryPaths: [],
    extraUrls: ['https://www.suihua.gov.cn/sh/ysjs/zfxxgk.shtml'] },
  // 安徽 (2) - 安徽 uses /zwgk/ patterns
  { name: '安庆市', prov: '安徽省', pinyin: 'anqing',
    tryDomains: ['czj.anqing.gov.cn', 'czt.anqing.gov.cn', 'www.anqing.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '宿州市', prov: '安徽省', pinyin: 'suzhou',
    tryDomains: ['czj.ahsz.gov.cn', 'czj.suzhou.gov.cn', 'czt.suzhou.gov.cn', 'www.ahsz.gov.cn'],
    tryPaths: ['/zwgk/czyjsgk/'],
    extraUrls: [] },
  // 江西 (4)
  { name: '九江市', prov: '江西省', pinyin: 'jiujiang',
    tryDomains: ['czj.jiujiang.gov.cn', 'czt.jiujiang.gov.cn', 'www.jiujiang.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '宜春市', prov: '江西省', pinyin: 'yichun',
    tryDomains: ['czj.yichun.gov.cn', 'czt.yichun.gov.cn', 'www.yichun.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '抚州市', prov: '江西省', pinyin: 'fuzhou',
    tryDomains: ['czj.jxfz.gov.cn', 'czj.fuzhou.gov.cn', 'www.jxfz.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '上饶市', prov: '江西省', pinyin: 'shangrao',
    tryDomains: ['czj.zgsr.gov.cn', 'czj.shangrao.gov.cn', 'www.zgsr.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 山东 (3) - 山东 uses various CMS
  { name: '枣庄市', prov: '山东省', pinyin: 'zaozhuang',
    tryDomains: ['czj.zaozhuang.gov.cn', 'czt.zaozhuang.gov.cn', 'www.zaozhuang.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '东营市', prov: '山东省', pinyin: 'dongying',
    tryDomains: ['czj.dongying.gov.cn', 'czt.dongying.gov.cn', 'www.dongying.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '菏泽市', prov: '山东省', pinyin: 'heze',
    tryDomains: ['czj.heze.gov.cn', 'czt.heze.gov.cn', 'www.heze.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 海南 (2)
  { name: '海口市', prov: '海南省', pinyin: 'haikou',
    tryDomains: ['czj.haikou.gov.cn', 'czt.haikou.gov.cn', 'www.haikou.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '三亚市', prov: '海南省', pinyin: 'sanya',
    tryDomains: ['czj.sanya.gov.cn', 'czt.sanya.gov.cn', 'www.sanya.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 贵州 (1)
  { name: '黔南布依族苗族自治州', prov: '贵州省', pinyin: 'qiannan',
    tryDomains: ['czj.qiannan.gov.cn', 'www.qiannan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 云南 (5)
  { name: '丽江市', prov: '云南省', pinyin: 'lijiang',
    tryDomains: ['czj.lijiang.gov.cn', 'czt.lijiang.gov.cn', 'www.lijiang.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '普洱市', prov: '云南省', pinyin: 'puer',
    tryDomains: ['czj.puershi.gov.cn', 'czj.puer.gov.cn', 'czt.puer.gov.cn', 'www.puershi.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '红河哈尼族彝族自治州', prov: '云南省', pinyin: 'honghe',
    tryDomains: ['czj.hh.gov.cn', 'czj.honghe.gov.cn', 'www.hh.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '西双版纳傣族自治州', prov: '云南省', pinyin: 'xsbn',
    tryDomains: ['czj.xsbn.gov.cn', 'www.xsbn.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '大理白族自治州', prov: '云南省', pinyin: 'dali',
    tryDomains: ['czj.dali.gov.cn', 'czt.dali.gov.cn', 'www.dali.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 甘肃 (5) - 甘肃 uses /zfxxgk/fdzdgknr/czxx/czyjs/
  { name: '金昌市', prov: '甘肃省', pinyin: 'jinchang',
    tryDomains: ['czj.jinchang.gov.cn', 'www.jinchang.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '武威市', prov: '甘肃省', pinyin: 'wuwei',
    tryDomains: ['czj.wuwei.gov.cn', 'www.wuwei.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '陇南市', prov: '甘肃省', pinyin: 'longnan',
    tryDomains: ['czj.longnan.gov.cn', 'www.longnan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '临夏回族自治州', prov: '甘肃省', pinyin: 'linxia',
    tryDomains: ['czj.linxia.gov.cn', 'www.linxia.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '甘南藏族自治州', prov: '甘肃省', pinyin: 'gannan',
    tryDomains: ['czj.gnzrmzf.gov.cn', 'czj.gannan.gov.cn', 'www.gnzrmzf.gov.cn', 'www.gannan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 青海 (4)
  { name: '海北藏族自治州', prov: '青海省', pinyin: 'haibei',
    tryDomains: ['czj.haibei.gov.cn', 'www.haibei.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '黄南藏族自治州', prov: '青海省', pinyin: 'huangnan',
    tryDomains: ['czj.huangnan.gov.cn', 'www.huangnan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '海南藏族自治州', prov: '青海省', pinyin: 'hainanzhou',
    tryDomains: ['czj.hainanzhou.gov.cn', 'czj.hainan.gov.cn', 'www.hainanzhou.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '果洛藏族自治州', prov: '青海省', pinyin: 'guoluo',
    tryDomains: ['czj.guoluo.gov.cn', 'czj.golog.gov.cn', 'www.guoluo.gov.cn', 'www.golog.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  // 宁夏 (3) - 宁夏 uses /zwgk/gkml/czyjsjsgjf/
  { name: '吴忠市', prov: '宁夏回族自治区', pinyin: 'wuzhong',
    tryDomains: ['czj.wuzhong.gov.cn', 'www.wuzhong.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '固原市', prov: '宁夏回族自治区', pinyin: 'guyuan',
    tryDomains: ['czj.guyuan.gov.cn', 'czj.nxgy.gov.cn', 'www.nxgy.gov.cn', 'www.guyuan.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
  { name: '中卫市', prov: '宁夏回族自治区', pinyin: 'zhongwei',
    tryDomains: ['czj.nxzw.gov.cn', 'czj.zhongwei.gov.cn', 'www.nxzw.gov.cn', 'www.zhongwei.gov.cn'],
    tryPaths: [],
    extraUrls: [] },
];

// Province-specific fiscal path patterns
const FISCAL_PATHS = [
  // Universal
  '/',
  '/zwgk/czyjsgk/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/ysjs/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zfxxgk/fdzdgknr/czxx/czyjs/',
  '/zwgk/xxgkml/czyjsgk/',
  '/zwgk/gkml/czyjsjsgjf/',
  '/zwgk/gkml/czzj/',
  '/zwgk/ysjs/',
  '/zwgk/czsj/',
  '/zwgk/czxx/',
  '/xxgk/czysjs/',
  '/xxgk/czzj/',
  '/zwgk/zfxxgkml/czyjsgk/',
  '/zwgk/zfxxgk/ysjs/',
  '/zwgk/zfxxgkzl/zdlyxxgk/czysjs/',
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => { resolve({ status: 0, url }); }, TIMEOUT);
    try {
      const req = mod.get(url, {
        timeout: TIMEOUT,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        rejectUnauthorized: false,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          clearTimeout(timer);
          resolve({ status: res.statusCode, redirect: res.headers.location, url });
          res.resume();
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', d => { if (body.length < 80000) body += d; });
        res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, body, url }); });
        res.on('error', () => { clearTimeout(timer); resolve({ status: res.statusCode, body, url }); });
      });
      req.on('error', () => { clearTimeout(timer); resolve({ status: 0, url }); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ status: 0, url }); });
    } catch (e) { clearTimeout(timer); resolve({ status: 0, url }); }
  });
}

function isErrorPage(body) {
  if (!body || body.length < 200) return true;
  if (body.length < 5000) {
    if (body.includes('404') && (body.includes('找不到') || body.includes('not found'))) return true;
    if (body.includes('您访问的页面不存在')) return true;
  }
  if (body.includes('page not found') && body.length < 3000) return true;
  return false;
}

function scoreUrl(body) {
  if (!body) return 0;
  return fiscalKeywords.filter(kw => body.includes(kw)).length;
}

async function probeDomain(domain) {
  // Step 1: Check if domain is alive with homepage
  const homeRes = await fetchUrl(`https://${domain}/`);
  let scheme = 'https';
  if (homeRes.status === 0) {
    const httpRes = await fetchUrl(`http://${domain}/`);
    if (httpRes.status === 0) return { alive: false, domain };
    scheme = 'http';
  }
  
  // Step 2: For czj/czt domains that are alive, check homepage for fiscal keywords
  if (domain.startsWith('czj.') || domain.startsWith('czt.')) {
    const hp = scheme === 'https' ? homeRes : await fetchUrl(`http://${domain}/`);
    if (hp.status === 200 && hp.body && scoreUrl(hp.body) >= 1) {
      return { alive: true, domain, scheme, fiscalHome: true, homeScore: scoreUrl(hp.body), homeBody: hp.body };
    }
    if (hp.status === 200) {
      return { alive: true, domain, scheme, fiscalHome: false, homeScore: 0, homeBody: hp.body };
    }
  }
  
  return { alive: true, domain, scheme };
}

async function probeCity(city) {
  console.log(`\n--- ${city.name} (${city.prov}) ---`);
  const results = [];
  
  // Step 1: Check extra confirmed URLs first
  for (const url of city.extraUrls || []) {
    const res = await fetchUrl(url);
    if (res.status === 200 && res.body && !isErrorPage(res.body)) {
      const score = scoreUrl(res.body);
      console.log(`  ✓ EXTRA ${url} → kw=${score}`);
      if (score >= 2) return { city: city.name, url, score, source: 'extra' };
      results.push({ url, score, source: 'extra' });
    }
  }
  
  // Step 2: Check if any fiscal bureau domain is alive
  for (const domain of city.tryDomains) {
    const dr = await probeDomain(domain);
    if (!dr.alive) {
      console.log(`  ✗ ${domain} - not reachable`);
      continue;
    }
    console.log(`  ○ ${domain} - alive (${dr.scheme})`);
    
    if (dr.fiscalHome) {
      console.log(`  ✓ ${domain} homepage has fiscal content (kw=${dr.homeScore})`);
      const url = `${dr.scheme}://${domain}/`;
      if (dr.homeScore >= 2) return { city: city.name, url, score: dr.homeScore, source: 'czj-home' };
      results.push({ url, score: dr.homeScore, source: 'czj-home' });
    }
    
    // Step 3: Try fiscal paths on this domain
    const pathsToTry = [...FISCAL_PATHS, ...(city.tryPaths || [])];
    for (const path of pathsToTry) {
      if (path === '/') continue; // already checked homepage
      const url = `${dr.scheme}://${domain}${path}`;
      const res = await fetchUrl(url);
      if (res.status === 200 && res.body && !isErrorPage(res.body)) {
        const score = scoreUrl(res.body);
        if (score >= 1) {
          console.log(`  ✓ ${url} → kw=${score}`);
          if (score >= 3) return { city: city.name, url, score, source: 'path-probe' };
          results.push({ url, score, source: 'path-probe' });
        }
      } else if (res.redirect) {
        // Follow ONE redirect
        let redir = res.redirect;
        if (redir.startsWith('/')) redir = `${dr.scheme}://${domain}${redir}`;
        const res2 = await fetchUrl(redir);
        if (res2.status === 200 && res2.body && !isErrorPage(res2.body)) {
          const score = scoreUrl(res2.body);
          if (score >= 1) {
            console.log(`  ✓ ${redir} (redirected) → kw=${score}`);
            if (score >= 3) return { city: city.name, url: redir, score, source: 'redirect' };
            results.push({ url: redir, score, source: 'redirect' });
          }
        }
      }
    }
  }
  
  // Return best result
  if (results.length > 0) {
    results.sort((a, b) => b.score - a.score);
    return { city: city.name, ...results[0] };
  }
  return { city: city.name, url: null, score: 0, source: 'none' };
}

async function main() {
  console.log(`Probe V3: ${cities.length} cities — fiscal bureau domains + path patterns\n`);
  const confirmed = [];
  const partial = [];
  const notFound = [];
  
  for (const city of cities) {
    const result = await probeCity(city);
    if (result.score >= 2) {
      confirmed.push(result);
    } else if (result.score >= 1) {
      partial.push(result);
    } else {
      notFound.push(result);
    }
  }
  
  console.log('\n\n=== RESULTS ===');
  console.log(`\nCONFIRMED (kw≥2): ${confirmed.length}`);
  confirmed.forEach(r => console.log(`  ${r.city}: ${r.url} (kw=${r.score}, src=${r.source})`));
  
  console.log(`\nPARTIAL (kw=1): ${partial.length}`);
  partial.forEach(r => console.log(`  ${r.city}: ${r.url} (kw=${r.score}, src=${r.source})`));
  
  console.log(`\nNOT FOUND: ${notFound.length}`);
  notFound.forEach(r => console.log(`  ${r.city}`));
  
  fs.writeFileSync('scripts/probe-v3-results.json', JSON.stringify({ confirmed, partial, notFound }, null, 2));
  console.log('\nResults saved to scripts/probe-v3-results.json');
}

main().catch(console.error);
