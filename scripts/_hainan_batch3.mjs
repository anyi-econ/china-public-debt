import http from 'http';
import https from 'https';

function probe(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000, rejectUnauthorized: false
    }, (res) => {
      let body = '';
      res.on('data', d => { if (body.length < 150000) body += d.toString(); });
      res.on('end', () => {
        const links = [];
        const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let m;
        while ((m = re.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/预[决]?算|czyjs|czyjsxx|预决算|财政信息|财政预决算/.test(href + text)) {
            links.push({ href, text: text.substring(0, 80) });
          }
        }
        const czLinks = [];
        const re2 = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((m = re2.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/财政|czxx|caizheng|czgk|zwgk.*财/.test(href + text) && text.length < 40 && text.length > 0) {
            czLinks.push({ href, text: text.substring(0, 80) });
          }
        }
        resolve({
          url, status: res.statusCode,
          loc: res.headers.location || '',
          links, czLinks, bodyLen: body.length,
          title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || ''
        });
      });
    });
    req.on('error', e => resolve({ url, status: 'ERR:' + e.code, links: [], czLinks: [], bodyLen: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', links: [], czLinks: [], bodyLen: 0 }); });
  });
}

async function probeFollow(url, depth = 0) {
  const r = await probe(url);
  if (depth < 3 && r.loc && (r.status === 301 || r.status === 302)) {
    const next = r.loc.startsWith('http') ? r.loc : new URL(r.loc, url).href;
    return probeFollow(next, depth + 1);
  }
  return r;
}

// Common fiscal sub-paths to try
const fiscalPaths = [
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/czyjs/',
  '/czgk/',
  '/rdzt/czyjs/',
  '/site/czyjsgk/',
  '/xxgk/czyjsgk/',
  '/xxgk/czxx/czyjs/',
  '/xxgk/szfbjxxgk/cztz/',
  '/zwgk/zdlyxxgk/czyjsgk/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/zwgk/czxx/czyjs/',
  '/zfxxgk/fdzdgknr/czyjsxx/',
];

// Sanya-specific paths
const sanyaPaths = [
  '/htqsite/czxxxx/newxxgklist.shtml',
  '/htqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx',
  '/jyqsite/czxxxx/newxxgklist.shtml',
  '/jyqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx',
  '/tyqsite/czxxxx/newxxgklist.shtml',
  '/tyqsite/czyjsxx/nav_list.shtml',
  '/yzqsite/czxxxx/newxxgklist.shtml',
  '/yzqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx',
];

const targets = [
  // Sanya districts
  { name: '海棠区', base: 'https://ht.sanya.gov.cn', prefix: '/htqsite', paths: ['/htqsite/czxxxx/newxxgklist.shtml', '/htqsite/czyjsxx/nav_list.shtml', '/htqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx'] },
  { name: '吉阳区', base: 'https://jy.sanya.gov.cn', prefix: '/jyqsite', paths: ['/jyqsite/czxxxx/newxxgklist.shtml', '/jyqsite/czyjsxx/nav_list.shtml', '/jyqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx'] },
  { name: '天涯区', base: 'http://ty.sanya.gov.cn', prefix: '/tyqsite', paths: ['/tyqsite/czxxxx/newxxgklist.shtml', '/tyqsite/czyjsxx/nav_list.shtml'] },
  { name: '崖州区', base: 'https://yz.sanya.gov.cn', prefix: '/yzqsite', paths: ['/yzqsite/czxxxx/newxxgklist.shtml', '/yzqsite/czyjsxx/nav_list.shtml', '/yzqsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx'] },
  // Counties
  { name: '五指山市', base: 'https://wzs.hainan.gov.cn', paths: fiscalPaths },
  { name: '文昌市', base: 'https://wenchang.hainan.gov.cn', paths: fiscalPaths },
  { name: '琼海市', base: 'https://qionghai.hainan.gov.cn', paths: fiscalPaths },
  { name: '万宁市', base: 'https://wanning.hainan.gov.cn', paths: fiscalPaths },
  { name: '东方市', base: 'https://dongfang.hainan.gov.cn', paths: fiscalPaths },
  { name: '定安县', base: 'https://dingan.hainan.gov.cn', paths: fiscalPaths },
  { name: '屯昌县', base: 'https://tunchang.hainan.gov.cn', paths: fiscalPaths },
  { name: '澄迈县', base: 'https://chengmai.hainan.gov.cn', paths: fiscalPaths },
  { name: '临高县', base: 'https://lingao.hainan.gov.cn', paths: fiscalPaths },
  { name: '白沙县', base: 'https://baisha.hainan.gov.cn', paths: fiscalPaths },
  { name: '昌江县', base: 'https://changjiang.hainan.gov.cn', paths: fiscalPaths },
  { name: '乐东县', base: 'https://ledong.hainan.gov.cn', paths: fiscalPaths },
  { name: '陵水县', base: 'https://lingshui.hainan.gov.cn', paths: fiscalPaths },
  { name: '保亭县', base: 'https://baoting.hainan.gov.cn', paths: fiscalPaths },
  { name: '琼中县', base: 'https://qiongzhong.hainan.gov.cn', paths: fiscalPaths },
];

async function main() {
  // First check Haikou main page for district links
  console.log('=== Checking Haikou main page for district links ===');
  const hk = await probeFollow('http://www.haikou.gov.cn/');
  console.log(`Haikou: ${hk.status} [${hk.title}] len=${hk.bodyLen}`);
  
  // Now try Haikou sub-pages for district fiscal info
  const hkDistrictPaths = [
    'http://www.haikou.gov.cn/xxgk/qzfbjxxgk/xyqzf/',
    'http://www.haikou.gov.cn/xxgk/qzfbjxxgk/lhqzf/',
    'http://www.haikou.gov.cn/xxgk/qzfbjxxgk/qsqzf/',
    'http://www.haikou.gov.cn/xxgk/qzfbjxxgk/mlqzf/',
    // Also try fiscal specific
    'http://www.haikou.gov.cn/xxgk/szfbjxxgk/cztz/',
  ];
  
  for (const url of hkDistrictPaths) {
    const r = await probeFollow(url);
    console.log(`  ${r.status} ${url} [${r.title}]`);
    if (r.links.length) r.links.slice(0, 2).forEach(l => console.log(`    YJS: ${l.text} => ${l.href}`));
    if (r.czLinks.length) r.czLinks.slice(0, 3).forEach(l => console.log(`    CZ: ${l.text} => ${l.href}`));
  }

  // Now probe all targets
  for (const t of targets) {
    console.log(`\n=== ${t.name} (${t.base}) ===`);
    
    // First try homepage
    const hp = await probeFollow(t.base + '/');
    console.log(`  Homepage: ${hp.status} [${hp.title}]`);
    if (hp.links.length) {
      hp.links.slice(0, 3).forEach(l => console.log(`    YJS: ${l.text} => ${l.href}`));
    }
    
    // Try fiscal sub-paths
    let found = false;
    for (const path of t.paths) {
      const url = t.base + path;
      const r = await probeFollow(url);
      if (r.status === 200 && r.bodyLen > 500) {
        const hasYJS = /预[决]?算|czyjs|czyjsxx|预决算/.test(r.title || '');
        const hasCZ = /财政|预算/.test(r.title || '');
        console.log(`  ✓ ${r.status} ${path} [${r.title}] len=${r.bodyLen} yjs=${hasYJS} cz=${hasCZ}`);
        if (r.links.length) r.links.slice(0, 2).forEach(l => console.log(`    YJS: ${l.text} => ${l.href}`));
        found = true;
      }
    }
    if (!found) {
      console.log('  (no fiscal sub-path worked)');
    }
  }
}

main().catch(console.error);
