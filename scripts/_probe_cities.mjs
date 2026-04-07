import http from 'http';
import https from 'https';

function fetchPage(url, timeout = 10000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    try {
      const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve({ url, status: res.statusCode, redirect: res.headers.location, body: '' });
          res.destroy();
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { data += c; if (data.length > 80000) res.destroy(); });
        res.on('end', () => resolve({ url, status: res.statusCode, body: data.slice(0, 80000), redirect: '' }));
        res.on('error', () => resolve({ url, status: res.statusCode, body: data.slice(0, 80000), redirect: '' }));
      });
      req.on('error', () => resolve({ url, status: 0, body: '', redirect: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, body: '', redirect: '' }); });
    } catch (e) { resolve({ url, status: 0, body: '', redirect: '' }); }
  });
}

async function tryPaths(name, paths) {
  console.log(`\n=== ${name} ===`);
  for (const u of paths) {
    const r = await fetchPage(u, 7000);
    if (r.status >= 200 && r.status < 300 && r.body && r.body.includes('预算')) {
      console.log(`FOUND: ${u}`);
      // Extract a few titles
      const titles = [...r.body.matchAll(/<a[^>]*>([^<]*(?:预算|决算)[^<]*)<\/a>/g)];
      titles.slice(0, 3).forEach(t => console.log(`  ${t[1].trim()}`));
      return u;
    } else if (r.redirect) {
      // Check redirect
      if (r.redirect.includes('czyjs') || r.redirect.includes('ysjs')) {
        console.log(`REDIRECT: ${u} -> ${r.redirect}`);
      }
    }
  }
  console.log('Not found');
  return null;
}

async function main() {
  // 南昌 - czj.nc.gov.cn already responds (status 200)
  const found = {};

  // Check czj.nc.gov.cn for fiscal links
  let r = await fetchPage('http://czj.nc.gov.cn/', 8000);
  console.log('=== 南昌市 ===');
  if (r.body) {
    const links = [...r.body.matchAll(/href=["']([^"']*(?:yjsgk|czyjs|ysjs|yjs)[^"']*)["']/g)];
    const links2 = [...r.body.matchAll(/href=["']([^"']*)["'][^>]*>[^<]*(?:预[决]?算|决算|预决算)/g)];
    const all = [...links, ...links2].map(l => l[1]);
    if (all.length > 0) {
      console.log('南昌 czj links:');
      [...new Set(all)].slice(0, 10).forEach(l => console.log(`  ${l}`));
    }
    // Also check if has fiscal budget
    if (r.body.includes('预算') || r.body.includes('决算')) {
      console.log('czj.nc has fiscal keywords');
    }
  } else {
    console.log('czj.nc: status', r.status, r.redirect || '');
  }

  // South-East approach: try czj.nc.gov.cn sub-pages
  const ncPaths = [
    'http://czj.nc.gov.cn/ncczj/yjsgk/',
    'http://czj.nc.gov.cn/ncczj/ysjs/',
    'http://czj.nc.gov.cn/ncczj/czyjs/',
    'http://czj.nc.gov.cn/yjsgk/',
    'http://czj.nc.gov.cn/czyjs/',
    'http://czj.nc.gov.cn/ncczj/czxx/',
    'http://czj.nc.gov.cn/ncczj/zwgk/',
    'http://www.nc.gov.cn/ncszf/zfxxgk/fdzdgknr/czyjs/',
    'http://www.nc.gov.cn/ncszf/zwgk/czyjs/',
  ];
  found['南昌市'] = await tryPaths('南昌市 specific', ncPaths);

  // 枣庄
  found['枣庄市'] = await tryPaths('枣庄市', [
    'http://www.zaozhuang.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.zaozhuang.gov.cn/zfxxgk/fdzdgknr/ysjs/',
    'http://www.zaozhuang.gov.cn/zwgk/czyjs/',
    'http://www.zaozhuang.gov.cn/zwgk/czxx/',
    'http://czj.zaozhuang.gov.cn/',
    'http://caizheng.zaozhuang.gov.cn/',
    'http://www.zaozhuang.gov.cn/art/2024/3/8/art_28_1.html',
    'https://www.zaozhuang.gov.cn/zfxxgk/fdzdgknr/czyjs/',
  ]);

  // 双鸭山
  found['双鸭山市'] = await tryPaths('双鸭山市', [
    'http://www.shuangyashan.gov.cn/sys/ysjs/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/szfyjs/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/czyjs/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/czxx/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/bmys/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/ysjsgk/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/bmyjs/xxgk_list.shtml',
    'http://www.shuangyashan.gov.cn/sys/ysjs/newslist_one.shtml',
    'http://www.shuangyashan.gov.cn/sys/szfyjs/newslist_one.shtml',
    'http://www.shuangyashan.gov.cn/sys/czyjs/newslist_one.shtml',
  ]);

  // 牡丹江
  found['牡丹江市'] = await tryPaths('牡丹江市', [
    'http://www.mdj.gov.cn/mdj/szfyjs/zwgk_list.shtml',
    'http://www.mdj.gov.cn/mdj/ysjs/zwgk_list.shtml',
    'http://www.mdj.gov.cn/mdj/czyjs/zwgk_list.shtml',
    'http://www.mdj.gov.cn/mdj/bmyjs/zwgk_list.shtml',
    'http://www.mdj.gov.cn/mdj/czxx/zwgk_list.shtml',
    'https://www.mdj.gov.cn/mdj/szfyjs/zwgk_list.shtml',
    'https://www.mdj.gov.cn/mdj/ysjs/zwgk_list.shtml',
    'https://www.mdj.gov.cn/mdj/czyjs/zwgk_list.shtml',
  ]);

  // 鸡西
  found['鸡西市'] = await tryPaths('鸡西市', [
    'http://www.jixi.gov.cn/jixi/szfyjs/zwgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/ysjs/zwgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/czyjs/zwgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/bmyjs/zwgk_list.shtml',
    'https://www.jixi.gov.cn/jixi/szfyjs/zwgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/czxx/zwgk_list.shtml',
    'http://czj.jixi.gov.cn/',
    'http://www.jixi.gov.cn/jixi/zdgknr/index_xxnr.shtml',
  ]);

  // 金昌
  found['金昌市'] = await tryPaths('金昌市', [
    'http://www.jinchang.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.jinchang.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.jinchang.gov.cn/zwgk/czyjs/',
    'http://czj.jinchang.gov.cn/',
    'http://www.jinchang.gov.cn/col/col33/',
    'http://www.jinchang.gov.cn/art/czxx.html',
  ]);

  // 武威
  found['武威市'] = await tryPaths('武威市', [
    'https://www.wuwei.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.wuwei.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.wuwei.gov.cn/zwgk/czyjs/',
    'http://czj.wuwei.gov.cn/',
    'https://www.wuwei.gov.cn/col/col1/',
    'http://www.wuwei.gov.cn/art/czxx.html',
  ]);

  // 陇南
  found['陇南市'] = await tryPaths('陇南市', [
    'https://www.longnan.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.longnan.gov.cn/zwgk/czyjs/',
    'https://www.longnan.gov.cn/col/col4459/',
    'https://www.longnan.gov.cn/col/col4460/',
    'http://czj.longnan.gov.cn/',
    'https://www.longnan.gov.cn/art/czgl.html',
  ]);

  // 海南 cities
  const hainanCities = [
    { name: '五指山市', domains: ['www.wzs.gov.cn'] },
    { name: '文昌市', domains: ['www.wenchang.gov.cn'] },
    { name: '琼海市', domains: ['www.qionghai.gov.cn'] },
    { name: '万宁市', domains: ['www.wanning.gov.cn'] },
    { name: '东方市', domains: ['www.dongfang.gov.cn'] },
  ];
  for (const city of hainanCities) {
    const paths = city.domains.flatMap(d => [
      `http://${d}/zfxxgk/fdzdgknr/czyjs/`,
      `http://${d}/zwgk/czyjs/`,
      `http://${d}/zwgk/czxx/`,
      `http://${d}/`,
    ]);
    found[city.name] = await tryPaths(city.name, paths);
  }

  // 青海 - 海北, 黄南, 果洛
  found['海北'] = await tryPaths('海北藏族自治州', [
    'http://www.haibei.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.haibei.gov.cn/zwgk/czyjs/',
    'https://www.haibei.gov.cn/zfxxgk/fdzdgknr/czyjs/',
  ]);
  found['黄南'] = await tryPaths('黄南藏族自治州', [
    'http://www.huangnan.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.huangnan.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.huangnan.gov.cn/zwgk/czyjs/',
  ]);
  found['果洛'] = await tryPaths('果洛藏族自治州', [
    'http://www.guoluo.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.guoluo.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.guoluo.gov.cn/zwgk/czyjs/',
  ]);

  // 云南 西双版纳
  found['西双版纳'] = await tryPaths('西双版纳傣族自治州', [
    'http://www.xsbn.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'https://www.xsbn.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.xsbn.gov.cn/zwgk/czyjs/',
    'http://czj.xsbn.gov.cn/',
  ]);

  console.log('\n=== SUMMARY ===');
  for (const [name, url] of Object.entries(found)) {
    console.log(`${name}: ${url || 'NOT FOUND'}`);
  }
}

main().catch(console.error);
