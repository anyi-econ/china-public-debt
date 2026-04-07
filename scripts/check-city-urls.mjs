#!/usr/bin/env node
// Quick batch check for missing city fiscal budget URLs
import https from 'https';
import http from 'http';

const cities = [
  // 云南
  { name: '普洱市', domains: ['www.puershi.gov.cn', 'www.puer.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/info/egovinfo/1001/cat_gk/yjsgk.htm',
    '/info/egovinfo/1001/zfxxgk/cat_gk/yjsgk.htm', '/zfxxgk/fdzdgknr/czysjs/',
    '/zfxxgk/fdzdgknr/czyjs/', '/zwgk/zfxxgkml/czyjsgk/',
  ]},
  { name: '红河哈尼族彝族自治州', domains: ['www.hh.gov.cn', 'www.honghe.gov.cn', 'www.hh.yn.gov.cn'], paths: [
    '/zwgk/zdlygk/czzj/', '/zwgk/zfxxgk/fdzdgknr/czyjs/', '/zfxxgk/fdzdgknr/czysjs/',
    '/zfxxgk/fdzdgknr/ysjs/', '/zwgk/zfxxgkml/czyjsgk/',
  ]},
  { name: '大理白族自治州', domains: ['www.dali.gov.cn'], paths: [
    '/dlzrmzf/xxgkml/c105885/pc/list.html', '/dlzrmzf/c101529/pc/list.html',
  ]},
  // 甘肃
  { name: '金昌市', domains: ['www.jinchang.gov.cn', 'www.jc.gansu.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czysjs/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/art/czyjsgk/', '/zwgk/czyjsgk/',
  ]},
  { name: '武威市', domains: ['www.wuwei.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  { name: '陇南市', domains: ['www.longnan.gov.cn', 'www.ln.gansu.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  { name: '临夏回族自治州', domains: ['www.linxia.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  { name: '甘南藏族自治州', domains: ['www.gannan.gov.cn', 'www.gnzrmzf.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  // 青海
  { name: '海北藏族自治州', domains: ['www.haibei.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/zfxxgkml/ysjs/',
  ]},
  { name: '黄南藏族自治州', domains: ['www.huangnan.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/zfxxgkml/ysjs/',
  ]},
  { name: '海南藏族自治州', domains: ['www.hainan.gov.cn'], paths: [
    // NOTE: hainan.gov.cn is Hainan province! Need actual domain
  ]},
  { name: '果洛藏族自治州', domains: ['www.guoluo.gov.cn', 'www.golog.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  // 宁夏
  { name: '吴忠市', domains: ['www.wuzhong.gov.cn', 'www.nxwz.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
    '/zwgk/zfxxgkml/czyjsgk/',
  ]},
  { name: '固原市', domains: ['www.guyuan.gov.cn', 'www.nxgy.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
  { name: '中卫市', domains: ['www.zhongwei.gov.cn', 'www.nxzw.gov.cn'], paths: [
    '/zwgk/zdlyxxgk/czyjsgk/', '/zwgk/zfxxgkml/czyjsgk/', '/zwgk/zdlygk/czzj/',
    '/zwgk/zfxxgk/fdzdgknr/czysjs/', '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  ]},
];

function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ status: 0, error: 'timeout' }), timeout);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: timeout,
      rejectUnauthorized: false,
    }, (res) => {
      // Follow one redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timer);
        resolve({ status: res.statusCode, redirect: res.headers.location });
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { 
        body += chunk;
        if (body.length > 50000) res.destroy();
      });
      res.on('end', () => {
        clearTimeout(timer);
        resolve({ status: res.statusCode, body, length: body.length });
      });
      res.on('error', () => {
        clearTimeout(timer);
        resolve({ status: res.statusCode, body, length: body.length });
      });
    });
    req.on('error', (e) => {
      clearTimeout(timer);
      resolve({ status: 0, error: e.message });
    });
    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timer);
      resolve({ status: 0, error: 'socket timeout' });
    });
  });
}

const fiscalKeywords = ['预算', '决算', '财政', '三公'];

async function checkCity(city) {
  const results = [];
  for (const domain of city.domains) {
    for (const path of city.paths) {
      for (const scheme of ['https', 'http']) {
        const url = `${scheme}://${domain}${path}`;
        const res = await fetchUrl(url);
        if (res.status === 200 && res.body) {
          const kwCount = fiscalKeywords.filter(kw => res.body.includes(kw)).length;
          if (kwCount >= 2) {
            results.push({ url, status: 200, kwCount, length: res.length });
            console.log(`  ✅ FOUND: ${url} (keywords: ${kwCount}, len: ${res.length})`);
            return results; // Found it, stop
          } else if (kwCount >= 1) {
            results.push({ url, status: 200, kwCount, length: res.length, partial: true });
            console.log(`  ⚡ Partial: ${url} (keywords: ${kwCount}, len: ${res.length})`);
          }
        } else if (res.status >= 300 && res.status < 400) {
          console.log(`  ↪ Redirect ${res.status}: ${url} → ${res.redirect}`);
          results.push({ url, status: res.status, redirect: res.redirect });
        }
        // Skip to next domain if we got a non-redirect response (save time)
        if (res.status === 200 || res.status === 404 || res.status === 403) break;
      }
    }
  }
  return results;
}

async function main() {
  console.log(`Checking ${cities.length} cities...\n`);
  const allResults = {};
  
  for (const city of cities) {
    console.log(`[${city.name}]`);
    if (city.paths.length === 0) {
      console.log('  ⏭ Skipped (no paths to check)');
      allResults[city.name] = [];
      continue;
    }
    const results = await checkCity(city);
    allResults[city.name] = results;
    if (results.length === 0) {
      console.log('  ❌ No matches found');
    }
    console.log('');
  }
  
  console.log('\n=== SUMMARY ===');
  for (const [name, results] of Object.entries(allResults)) {
    const confirmed = results.find(r => r.kwCount >= 2);
    const partial = results.find(r => r.partial);
    if (confirmed) {
      console.log(`✅ ${name}: ${confirmed.url}`);
    } else if (partial) {
      console.log(`⚡ ${name}: ${partial.url} (partial match)`);
    } else if (results.some(r => r.redirect)) {
      const redir = results.find(r => r.redirect);
      console.log(`↪ ${name}: redirect → ${redir.redirect}`);
    } else {
      console.log(`❌ ${name}: not found`);
    }
  }
}

main().catch(console.error);
