import http from 'http';
import https from 'https';

function fetchPage(url, timeout=10000) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => resolve({url, code:0, body:''}), timeout);
    try {
      const req = mod.get(url, {timeout, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}}, res => {
        clearTimeout(timer);
        if (res.statusCode===301||res.statusCode===302) {
          resolve({url, code:res.statusCode, redir:res.headers.location||'', body:''});
          res.resume(); return;
        }
        let body=''; res.setEncoding('utf8');
        res.on('data',d=>body+=d);
        res.on('end',()=>resolve({url, code:res.statusCode, body}));
      });
      req.on('error', e => { clearTimeout(timer); resolve({url, code:-1, body:e.message}); });
    } catch(e) { clearTimeout(timer); resolve({url, code:-2, body:''}); }
  });
}

function followRedirects(url, maxHops=3) {
  return new Promise(async resolve => {
    let cur = url;
    for (let i=0; i<maxHops; i++) {
      const r = await fetchPage(cur);
      if ((r.code===301||r.code===302) && r.redir) {
        cur = r.redir.startsWith('http') ? r.redir : new URL(r.redir, cur).href;
      } else {
        resolve(r);
        return;
      }
    }
    resolve(await fetchPage(cur));
  });
}

function extractLinks(name, r) {
  if (r.code!==200) { console.log(name+' ERR:'+r.code+' ('+r.url+')'); return null; }
  const links = [];
  const re1 = /href=["']([^"']+)["'][^>]*>[^<]*(?:预算|决算|财政资金|czysj|czyjs)[^<]*/gi;
  let m;
  while ((m=re1.exec(r.body))!==null) links.push(m[0].replace(/<[^>]+>/g,'').slice(0,200));
  const re2 = /href=["']([^"']*(?:ysjs|czysj|czyjs|czzj\/)[^"']*)["']/gi;
  while ((m=re2.exec(r.body))!==null) links.push(m[1]);
  if (links.length) {
    console.log(name+':');
    [...new Set(links)].forEach(l=>console.log('  '+l));
    return links;
  } else {
    console.log(name+': NO_FISCAL_LINKS (body='+r.body.length+')');
    return null;
  }
}

// For sites that failed at /zwgk/ - try multiple base pages
const remaining = [
  // 贵阳: sites with connection errors or 404 at /zwgk/
  ['花溪区','www.huaxi.gov.cn', ['/zwgkgb/','/zwgk/','/xxgk/','/']],
  ['乌当区','www.wudang.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['白云区','www.baiyun.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['观山湖区','www.gsh.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['息烽县','www.xifeng.gov.cn', ['/zwgk/zdlygk/','/zwgk/zfxxgk/','/zwgk/zfxxgk/fdzdgknr/','/']],
  ['修文县','www.xiuwen.gov.cn', ['/zwgkgb/','/xxgk/','/']],
  // 六盘水: all 404 at /zwgk/
  ['钟山区','www.gzzs.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/zwgk/zfxxgk/','/']],
  ['六枝特区','www.liuzhi.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/zwgk/zfxxgk/','/']],
  ['水城区','www.shuicheng.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/zwgk/zfxxgk/','/']],
  // 遵义: connection failures and 404s
  ['汇川区','www.huichuan.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['桐梓县','www.tongzi.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['正安县','www.gzza.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  ['道真县','www.gzdaozhen.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  ['湄潭县','www.meitan.gov.cn', ['/zwgk/zdlygk/','/zwgk/zfxxgk/','/zwgk/zfxxgk/fdzdgknr/','/']],
  ['余庆县','www.yuqing.gov.cn', ['/zwgk/','/']],
  ['习水县','www.gzxishui.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['赤水市','www.chishui.gov.cn', ['/zwgk/','/xxgk/','/']],
  ['仁怀市','www.renhuai.gov.cn', ['/zwgk/','/xxgk/','/']],
  // 安顺: redirects to https, then 404
  ['西秀区','www.xixiu.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/zwgk/zfxxgk/','/']],
  ['镇宁县','www.gzzn.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  ['关岭县','www.guanling.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  // 毕节: redirects to https, then 404/403
  ['七星关区','www.bjqixingguan.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  ['黔西市','www.gzqianxi.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
  ['金沙县','www.gzjinsha.gov.cn', ['/xxgk/','/zwgk/xxgkml/','/']],
];

async function run() {
  for (const [name,host,pages] of remaining) {
    let found = false;
    for (const scheme of ['https://','http://']) {
      for (const pg of pages) {
        const url = scheme+host+pg;
        const r = await followRedirects(url);
        const links = extractLinks(name+'['+pg+']', r);
        if (links) { found = true; break; }
      }
      if (found) break;
    }
    if (!found) console.log('>>> '+name+' FAILED ALL PATHS');
    console.log('---');
  }
}
run();
