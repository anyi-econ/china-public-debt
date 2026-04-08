import http from 'http';
import https from 'https';

function probe(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 12000, rejectUnauthorized: false
    }, (res) => {
      let body = '';
      res.on('data', d => { if (body.length < 120000) body += d.toString(); });
      res.on('end', () => {
        const links = [];
        const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let m;
        while ((m = re.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/预[决]?算|czyjs|czyjsxx|预决算|财政信息/.test(href + text)) {
            links.push({ href, text: text.substring(0, 80) });
          }
        }
        const czLinks = [];
        const re2 = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((m = re2.exec(body)) !== null) {
          const href = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          if (/财政|czxx|caizheng|zwgk|政务公开/.test(href + text) && text.length < 40) {
            czLinks.push({ href, text: text.substring(0, 80) });
          }
        }
        resolve({
          url, status: res.statusCode,
          loc: res.headers.location || '',
          links, czLinks,
          title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || ''
        });
      });
    });
    req.on('error', e => resolve({ url, status: 'ERR:' + e.code, links: [], czLinks: [] }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', links: [], czLinks: [] }); });
  });
}

async function probeFollow(url, depth = 0) {
  const r = await probe(url);
  if (depth < 3 && r.loc && (r.status === 301 || r.status === 302)) {
    const next = r.loc.startsWith('http') ? r.loc : new URL(r.loc, url).href;
    console.log(`  Redirect: ${url} -> ${next}`);
    return probeFollow(next, depth + 1);
  }
  return r;
}

const targets = [
  // Haikou districts - try hainan.gov.cn subdomains  
  { name: '秀英区', urls: ['http://xiuying.haikou.gov.cn/', 'https://xiuying.hainan.gov.cn/', 'http://xiuying.hainan.gov.cn/'] },
  { name: '龙华区', urls: ['http://longhua.haikou.gov.cn/', 'https://longhua.hainan.gov.cn/', 'http://longhua.hainan.gov.cn/'] },
  { name: '美兰区', urls: ['http://ml.haikou.gov.cn/', 'https://meilan.hainan.gov.cn/', 'http://meilan.hainan.gov.cn/'] },
  
  // Sanya districts - retry
  { name: '海棠区', urls: ['https://ht.sanya.gov.cn/', 'http://ht.sanya.gov.cn/', 'https://haitang.sanya.gov.cn/'] },
  { name: '吉阳区', urls: ['https://jy.sanya.gov.cn/', 'http://jy.sanya.gov.cn/'] },
  
  // County-level: try {pinyin}.hainan.gov.cn pattern
  { name: '五指山市', urls: ['https://wzs.hainan.gov.cn/', 'http://wzs.hainan.gov.cn/', 'https://wuzhishan.hainan.gov.cn/'] },
  { name: '文昌市', urls: ['https://wenchang.hainan.gov.cn/', 'http://wenchang.hainan.gov.cn/'] },
  { name: '琼海市', urls: ['https://qionghai.hainan.gov.cn/', 'http://qionghai.hainan.gov.cn/'] },
  { name: '万宁市', urls: ['https://wanning.hainan.gov.cn/', 'http://wanning.hainan.gov.cn/'] },
  { name: '东方市', urls: ['https://dongfang.hainan.gov.cn/', 'http://dongfang.hainan.gov.cn/'] },
  { name: '定安县', urls: ['https://dingan.hainan.gov.cn/', 'http://dingan.hainan.gov.cn/'] },
  { name: '屯昌县', urls: ['https://tunchang.hainan.gov.cn/', 'http://tunchang.hainan.gov.cn/'] },
  { name: '澄迈县', urls: ['https://chengmai.hainan.gov.cn/', 'http://chengmai.hainan.gov.cn/'] },
  { name: '临高县', urls: ['https://lingao.hainan.gov.cn/', 'http://lingao.hainan.gov.cn/'] },
  { name: '白沙县', urls: ['https://baisha.hainan.gov.cn/', 'http://baisha.hainan.gov.cn/'] },
  { name: '昌江县', urls: ['https://changjiang.hainan.gov.cn/', 'http://changjiang.hainan.gov.cn/'] },
  { name: '乐东县', urls: ['https://ledong.hainan.gov.cn/', 'http://ledong.hainan.gov.cn/'] },
  { name: '陵水县', urls: ['https://lingshui.hainan.gov.cn/', 'http://lingshui.hainan.gov.cn/'] },
  { name: '保亭县', urls: ['https://baoting.hainan.gov.cn/', 'http://baoting.hainan.gov.cn/'] },
  { name: '琼中县', urls: ['https://qiongzhong.hainan.gov.cn/', 'http://qiongzhong.hainan.gov.cn/'] },
];

async function main() {
  for (const t of targets) {
    console.log(`\n=== ${t.name} ===`);
    for (const url of t.urls) {
      const r = await probeFollow(url);
      const s = String(r.status);
      if (s.startsWith('ERR') || s === 'TIMEOUT') {
        console.log(`  ${s} ${url}`);
        continue;
      }
      console.log(`  OK ${r.status} ${url} [${r.title}]`);
      if (r.links.length) r.links.slice(0, 3).forEach(l => console.log(`    YJS: ${l.text} => ${l.href}`));
      if (r.czLinks.length) r.czLinks.slice(0, 5).forEach(l => console.log(`    CZ: ${l.text} => ${l.href}`));
      if (!r.links.length && !r.czLinks.length) console.log('    (no fiscal links)');
      break; // found working domain
    }
  }
}

main().catch(console.error);
