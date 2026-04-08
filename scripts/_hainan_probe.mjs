import http from 'http';
import https from 'https';

function fetchPage(url, timeout = 30000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout, rejectUnauthorized: false,
    }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = u.protocol + '//' + u.host + loc;
        }
        res.resume();
        fetchPage(loc, timeout).then(resolve);
        return;
      }
      let body = '';
      res.on('data', d => { if (body.length < 200000) body += d.toString(); });
      res.on('end', () => resolve({ url, status: res.statusCode, body, len: body.length }));
    });
    req.on('error', e => resolve({ url, status: 'ERR:' + e.code, body: '', len: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', body: '', len: 0 }); });
  });
}

function extractFiscalLinks(body, baseUrl) {
  const links = [];
  // Find all <a> tags
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    // Match fiscal-related keywords
    if (/预[决]?算|财政预决算|czyjs|czyjsgk|预决算公开|财政收支|czxx|财政信息/.test(text + href)) {
      let fullUrl = href;
      if (href.startsWith('/')) {
        const u = new URL(baseUrl);
        fullUrl = u.protocol + '//' + u.host + href;
      } else if (!href.startsWith('http')) {
        fullUrl = baseUrl.replace(/\/$/, '') + '/' + href;
      }
      links.push({ text: text.substring(0, 60), url: fullUrl });
    }
  }
  return links;
}

// All sites to probe
const sites = [
  // Haikou 4 districts - try both http and https, multiple domain patterns
  { name: '秀英区', govUrl: 'http://xiuying.haikou.gov.cn/' },
  { name: '龙华区', govUrl: 'http://longhua.haikou.gov.cn/' },
  { name: '琼山区', govUrl: 'http://qsqzf.haikou.gov.cn/' },
  { name: '美兰区', govUrl: 'http://ml.haikou.gov.cn/' },
  // Sanya 4 districts
  { name: '海棠区', govUrl: 'http://ht.sanya.gov.cn/' },
  { name: '吉阳区', govUrl: 'https://jy.sanya.gov.cn/' },
  { name: '天涯区', govUrl: 'http://ty.sanya.gov.cn/' },
  { name: '崖州区', govUrl: 'https://yz.sanya.gov.cn/' },
  // 15 county-level cities/counties
  { name: '五指山市', govUrl: 'https://www.wzs.gov.cn/' },
  { name: '文昌市', govUrl: 'https://www.wenchang.gov.cn/' },
  { name: '琼海市', govUrl: 'https://qionghai.hainan.gov.cn/' },
  { name: '万宁市', govUrl: 'https://www.wanning.gov.cn/' },
  { name: '东方市', govUrl: 'https://www.dongfang.gov.cn/' },
  { name: '定安县', govUrl: 'https://www.dingan.gov.cn/' },
  { name: '屯昌县', govUrl: 'https://www.tunchang.gov.cn/' },
  { name: '澄迈县', govUrl: 'https://www.chengmai.gov.cn/' },
  { name: '临高县', govUrl: 'https://www.lingao.gov.cn/' },
  { name: '白沙黎族自治县', govUrl: 'https://www.baisha.gov.cn/' },
  { name: '昌江黎族自治县', govUrl: 'https://www.changjiang.gov.cn/' },
  { name: '乐东黎族自治县', govUrl: 'https://www.ledong.gov.cn/' },
  { name: '陵水黎族自治县', govUrl: 'https://www.lingshui.gov.cn/' },
  { name: '保亭黎族苗族自治县', govUrl: 'https://www.baoting.gov.cn/' },
  { name: '琼中黎族苗族自治县', govUrl: 'https://www.qiongzhong.gov.cn/' },
];

// Common fiscal sub-paths to try
const fiscalPaths = [
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/czyjs/',
  '/rdzt/czyjs/',
  '/zwgk/zdlyxxgk/czyjs/',
  '/xxgk/czxx/czyjs/',
  '/zwgk/czxx/czyjs/',
  '/zfxxgk/czyjsgk/',
  '/xxgk/szfbjxxgk/cztz/',
];

async function probeSite(site) {
  console.log(`\n=== ${site.name} (${site.govUrl}) ===`);
  
  // Step 1: Fetch homepage
  const home = await fetchPage(site.govUrl);
  console.log(`  Homepage: status=${home.status} len=${home.len}`);
  
  if (home.len === 0) {
    // Try http/https alternate
    const alt = site.govUrl.startsWith('https') 
      ? site.govUrl.replace('https://', 'http://') 
      : site.govUrl.replace('http://', 'https://');
    const altHome = await fetchPage(alt);
    console.log(`  Alt (${alt}): status=${altHome.status} len=${altHome.len}`);
    if (altHome.len > 0) {
      home.body = altHome.body;
      home.len = altHome.len;
      home.status = altHome.status;
      home.url = alt;
    }
  }

  if (home.len > 0) {
    // Extract fiscal links from homepage
    const links = extractFiscalLinks(home.body, site.govUrl);
    if (links.length > 0) {
      console.log(`  Found ${links.length} fiscal links on homepage:`);
      links.forEach(l => console.log(`    [${l.text}] -> ${l.url}`));
    }
  }
  
  // Step 2: Try common fiscal sub-paths
  const base = site.govUrl.replace(/\/$/, '');
  const pathResults = await Promise.all(
    fiscalPaths.map(p => fetchPage(base + p, 15000))
  );
  
  for (const r of pathResults) {
    if (r.status === 200 && r.len > 1000) {
      const hasContent = /预[决]?算|财政/.test(r.body);
      if (hasContent) {
        const title = (r.body.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
        console.log(`  ✓ FOUND: ${r.url} (len=${r.len}, title=${title.substring(0,60)})`);
      }
    }
  }

  // Step 3: For Sanya districts, try their specific CMS pattern
  if (site.govUrl.includes('sanya.gov.cn')) {
    const prefix = site.govUrl.match(/\/\/(\w+)\.sanya/)?.[1];
    if (prefix) {
      const cmsPaths = [
        `http://${prefix}.sanya.gov.cn/${prefix}qsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czyjsxx`,
        `http://${prefix}.sanya.gov.cn/${prefix}qsite/zfxxgk/newxxgk.shtml?gklb=zdgknr&xxgk=czxxxx`,
        `http://${prefix}.sanya.gov.cn/${prefix}qsite/czxxxx/list.shtml`,
        `http://${prefix}.sanya.gov.cn/${prefix}qczjsite/zfxxgk/newxxgk.shtml`,
        `http://${prefix}.sanya.gov.cn/${prefix}qczjsite/`,
      ];
      for (const u of cmsPaths) {
        const r = await fetchPage(u, 15000);
        if (r.status === 200 && r.len > 500) {
          const hasYjs = /预[决]?算/.test(r.body);
          if (hasYjs || r.len > 2000) {
            console.log(`  ✓ Sanya CMS: ${u} (len=${r.len}, yjs=${hasYjs})`);
          }
        }
      }
    }
  }

  // Step 4: For Haikou districts, try different domain patterns
  if (site.govUrl.includes('haikou.gov.cn')) {
    const prefix = site.govUrl.match(/\/\/(\w+)\.haikou/)?.[1];
    if (prefix) {
      const hkPaths = [
        `http://${prefix}.haikou.gov.cn/xxgk/${prefix}qzfxxgk/cztz/`,
        `http://${prefix}.haikou.gov.cn/xxgk/cztz/`,
        `https://${prefix}.haikou.gov.cn/`,
      ];
      for (const u of hkPaths) {
        const r = await fetchPage(u, 15000);
        if (r.status === 200 && r.len > 500) {
          console.log(`  ✓ Haikou CMS: ${u} (len=${r.len})`);
        }
      }
    }
  }
}

// Run with concurrency limit
async function main() {
  // Process 4 at a time
  for (let i = 0; i < sites.length; i += 4) {
    const batch = sites.slice(i, i + 4);
    await Promise.all(batch.map(s => probeSite(s)));
  }
}

main().catch(console.error);
