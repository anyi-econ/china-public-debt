import http from 'http';
import https from 'https';

function fetchFollow(url, depth = 0) {
  if (depth > 3) return Promise.resolve({ url, status: 0, body: '' });
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    try {
      const req = mod.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith('/')) {
            const u = new URL(url);
            loc = u.protocol + '//' + u.host + loc;
          }
          res.destroy();
          resolve(fetchFollow(loc, depth + 1));
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { data += c; if (data.length > 100000) res.destroy(); });
        res.on('end', () => resolve({ url: (depth > 0 ? url : url), status: res.statusCode, body: data.slice(0, 100000) }));
        res.on('error', () => resolve({ url, status: res.statusCode, body: data.slice(0, 100000) }));
      });
      req.on('error', () => resolve({ url, status: 0, body: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, body: '' }); });
    } catch(e) { resolve({ url, status: 0, body: '' }); }
  });
}

function findFiscalLinks(html) {
  const matches = [];
  // Look for links with 预算/决算 text
  const linkRe = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*(?:预算|决算|预决算|财政收支)[^<]*)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    matches.push({ url: m[1], text: m[2].trim() });
  }
  // Look for navigation items
  const navRe = /href=["']([^"']*(?:yjsgk|czyjs|czyjsgk|ysjs|ysjsgk|szfyjs|bmyjs)[^"']*)["']/gi;
  while ((m = navRe.exec(html)) !== null) {
    matches.push({ url: m[1], text: '(path match)' });
  }
  return matches;
}

async function checkCity(name, urls) {
  console.log(`\n=== ${name} ===`);
  for (const url of urls) {
    const r = await fetchFollow(url);
    if (r.status >= 200 && r.status < 400 && r.body.length > 500) {
      const links = findFiscalLinks(r.body);
      if (links.length > 0) {
        console.log(`Page ${url} (status ${r.status}, ${r.body.length} bytes)`);
        links.forEach(l => console.log(`  [${l.text}] -> ${l.url}`));
        return;
      }
      // Check if the page itself has 预算 content
      if (r.body.includes('预算') || r.body.includes('决算')) {
        console.log(`Page ${url} has fiscal keywords (status ${r.status}, ${r.body.length} bytes)`);
        // Check title
        const titleM = r.body.match(/<title>([^<]*)<\/title>/i);
        if (titleM) console.log(`  Title: ${titleM[1]}`);
      }
    }
  }
  console.log(`Not found`);
}

async function main() {
  // 鸡西 - try government portal 法定主动公开 and czj sub-sections
  await checkCity('鸡西市', [
    'http://www.jixi.gov.cn/jixi/c100103/common_zfxxgk.shtml',
    'http://czj.jixi.gov.cn/',
    'http://www.jixi.gov.cn/jixi/c100025/', // financial data section
    'http://www.jixi.gov.cn/jixi/c100025/zfxxgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/c100105/zfxxgk_list.shtml', // try various c1xxxxx sections
    'http://www.jixi.gov.cn/jixi/c100106/zfxxgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/c100109/zfxxgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/c100110/zfxxgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/c100111/zfxxgk_list.shtml',
    'http://www.jixi.gov.cn/jixi/c100112/zfxxgk_list.shtml',
  ]);

  // 牡丹江 - try portal 法定主动公开 sub-sections 
  await checkCity('牡丹江市', [
    'http://www.mdj.gov.cn/mdjsrmzf/gknr/redirect.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100025/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100024/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100026/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100030/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100031/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100032/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100033/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100034/zfxxgk_list.shtml',
    'http://www.mdj.gov.cn/mdjsrmzf/c100035/zfxxgk_list.shtml',
  ]);

  // 双鸭山 - site seems down, try variants
  await checkCity('双鸭山市', [
    'http://www.shuangyashan.gov.cn/',
    'https://www.shuangyashan.gov.cn/',
    'http://www.sys.gov.cn/',
    'http://czj.shuangyashan.gov.cn/',
  ]);

  // 枣庄 - IIS page, try https and different domain
  await checkCity('枣庄市', [
    'https://www.zaozhuang.gov.cn/',
    'http://czj.zaozhuang.gov.cn/',
    'http://www.zaozhuang.gov.cn:8080/',
    'http://www.zaozhuang.gov.cn/zfxxgk/fdzdgknr/',
  ]);

  // 甘肃 cities
  await checkCity('金昌市', [
    'https://www.jinchang.gov.cn/',
    'http://czj.jinchang.gov.cn/',
    'http://www.jinchang.gov.cn/',
  ]);

  await checkCity('武威市', [
    'https://www.wuwei.gov.cn/',
    'http://www.wuwei.gov.cn/',
    'http://czj.wuwei.gov.cn/',
  ]);

  await checkCity('陇南市', [
    'https://www.longnan.gov.cn/',
    'http://www.longnan.gov.cn/',
    'http://czj.longnan.gov.cn/',
  ]);

  // 海南 cities 
  const hainanCities = [
    { name: '五指山市', domain: 'www.wzs.gov.cn' },
    { name: '文昌市', domain: 'www.wenchang.gov.cn' },
    { name: '琼海市', domain: 'www.qionghai.gov.cn' },
    { name: '万宁市', domain: 'www.wanning.gov.cn' },
    { name: '东方市', domain: 'www.dongfang.gov.cn' },
  ];
  for (const c of hainanCities) {
    await checkCity(c.name, [
      `http://${c.domain}/`,
      `https://${c.domain}/`,
    ]);
  }

  // 青海 prefectures
  await checkCity('海北藏族自治州', [
    'https://www.haibei.gov.cn/',
    'http://www.haibei.gov.cn/',
  ]);
  
  await checkCity('黄南藏族自治州', [
    'https://www.huangnan.gov.cn/',
    'http://www.huangnan.gov.cn/',
  ]);

  await checkCity('果洛藏族自治州', [
    'https://www.guoluo.gov.cn/',
    'http://www.guoluo.gov.cn/',
  ]);
}

main().catch(console.error);
