/**
 * Targeted gap-fill pass 2: Try specific patterns for each remaining missing city.
 * Focus on city government portals with fiscal sections.
 */
import http from 'http';
import https from 'https';

const targetCities = [
  // 山西 (4)
  { name: '大同市', urls: [
    'https://www.dt.gov.cn/zwgk/zdly/czzj/',
    'http://www.datong.gov.cn/zwgk/zdly/czzj/',
    'http://czj.dt.gov.cn/',
    'https://czj.datong.gov.cn/',
    'http://www.datong.gov.cn/zwgk/czzj/',
  ]},
  { name: '晋中市', urls: [
    'https://www.jinzhong.gov.cn/zwgk/czzj/',
    'http://czj.jinzhong.gov.cn/',
    'https://www.jinzhong.gov.cn/zwgk/zdly/czzj/',
    'http://www.jinzhong.gov.cn/zwgk/czzj/',
  ]},
  { name: '运城市', urls: [
    'https://www.yuncheng.gov.cn/zwgk/czzj/',
    'http://czj.yuncheng.gov.cn/',
    'https://www.yuncheng.gov.cn/zwgk/zdly/czzj/',
  ]},
  { name: '忻州市', urls: [
    'https://www.xinzhou.gov.cn/zwgk/czzj/',
    'http://czj.xinzhou.gov.cn/',
    'https://www.xinzhou.gov.cn/zwgk/zdly/czzj/',
  ]},
  // 辽宁 (1)
  { name: '铁岭市', urls: [
    'http://czj.tieling.gov.cn/',
    'https://czj.tieling.gov.cn/',
    'https://www.tieling.gov.cn/zwgk/czzj/',
    'http://www.tieling.gov.cn/zwgk/czzj/',
  ]},
  // 吉林 (6)
  { name: '吉林市', urls: [
    'http://czj.jlcity.gov.cn/',
    'https://czj.jlcity.gov.cn/',
    'http://czj.jilin.gov.cn/',
    'http://www.jlcity.gov.cn/zwgk/czzj/',
  ]},
  { name: '四平市', urls: [
    'https://czj.siping.gov.cn/',
    'http://czj.siping.gov.cn/',
    'https://www.siping.gov.cn/zwgk/czzj/',
    'http://czt.siping.gov.cn/',
  ]},
  { name: '通化市', urls: [
    'http://czj.tonghua.gov.cn/',
    'https://www.tonghua.gov.cn/zwgk/czzj/',
    'http://czt.tonghua.gov.cn/',
  ]},
  { name: '白山市', urls: [
    'http://czj.baishan.gov.cn/',
    'https://www.baishan.gov.cn/zwgk/czzj/',
    'http://czt.baishan.gov.cn/',
    'http://czj.cbs.gov.cn/',
  ]},
  { name: '松原市', urls: [
    'http://czj.songyuan.gov.cn/',
    'https://www.songyuan.gov.cn/zwgk/czzj/',
    'http://czt.songyuan.gov.cn/',
  ]},
  { name: '白城市', urls: [
    'http://czj.baicheng.gov.cn/',
    'https://www.baicheng.gov.cn/zwgk/czzj/',
    'http://czt.baicheng.gov.cn/',
  ]},
  // 黑龙江 (4)
  { name: '鸡西市', urls: [
    'http://czj.jixi.gov.cn/',
    'https://czj.jixi.gov.cn/',
    'https://www.jixi.gov.cn/zwgk/czzj/',
    'http://www.jixi.gov.cn/zwgk/czzj/',
  ]},
  { name: '双鸭山市', urls: [
    'http://czj.shuangyashan.gov.cn/',
    'https://www.shuangyashan.gov.cn/zwgk/czzj/',
    'http://czj.sys.gov.cn/',
  ]},
  { name: '绥化市', urls: [
    'http://czj.suihua.gov.cn/',
    'https://www.suihua.gov.cn/zwgk/czzj/',
    'http://czt.suihua.gov.cn/',
  ]},
  { name: '鹤岗市', urls: [
    'http://czj.hegang.gov.cn/',
    'https://www.hegang.gov.cn/zwgk/czzj/',
  ]},
  // 浙江 (2)
  { name: '绍兴市', urls: [
    'http://czj.sx.gov.cn/',
    'https://czj.sx.gov.cn/',
    'http://czj.shaoxing.gov.cn/',
    'https://czj.shaoxing.gov.cn/',
    'https://www.shaoxing.gov.cn/zwgk/czzj/',
  ]},
  { name: '丽水市', urls: [
    'http://czj.lishui.gov.cn/',
    'https://czj.lishui.gov.cn/',
    'https://www.lishui.gov.cn/zwgk/czzj/',
    'http://czj.ls.gov.cn/',
  ]},
  // 安徽 (2)
  { name: '安庆市', urls: [
    'http://czj.anqing.gov.cn/',
    'https://czj.anqing.gov.cn/',
    'http://cz.anqing.gov.cn/',
    'https://www.anqing.gov.cn/zwgk/czzj/',
  ]},
  { name: '宿州市', urls: [
    'http://czj.suzhou.ah.gov.cn/',  
    'http://czj.sz.gov.cn/',
    'https://www.ahsz.gov.cn/zwgk/czzj/',
    'http://cz.ahsz.gov.cn/',
    'https://www.suzhou.ah.gov.cn/zwgk/czzj/',
  ]},
  // 江西 (4)
  { name: '九江市', urls: [
    'http://czj.jiujiang.gov.cn/',
    'https://czj.jiujiang.gov.cn/',
    'https://www.jiujiang.gov.cn/zwgk/czzj/',
    'http://czj.jj.gov.cn/',
  ]},
  { name: '宜春市', urls: [
    'http://czj.yichun.gov.cn/',
    'https://czj.yichun.gov.cn/',
    'https://www.yichun.gov.cn/zwgk/czzj/',
  ]},
  { name: '抚州市', urls: [
    'http://czj.fuzhou.gov.cn/',
    'http://czj.jxfz.gov.cn/',
    'https://www.jxfz.gov.cn/zwgk/czzj/',
    'http://czj.fz.gov.cn/',
  ]},
  { name: '上饶市', urls: [
    'http://czj.shangrao.gov.cn/',
    'https://czj.shangrao.gov.cn/',
    'https://www.shangrao.gov.cn/zwgk/czzj/',
    'http://czj.sr.gov.cn/',
  ]},
  // 山东 (3)
  { name: '枣庄市', urls: [
    'http://czj.zaozhuang.gov.cn/',
    'https://czj.zaozhuang.gov.cn/',
    'https://www.zaozhuang.gov.cn/zwgk/czzj/',
    'http://czj.zz.gov.cn/',
  ]},
  { name: '东营市', urls: [
    'http://czj.dongying.gov.cn/',
    'https://czj.dongying.gov.cn/',
    'https://www.dongying.gov.cn/zwgk/czzj/',
    'http://czj.dy.gov.cn/',
  ]},
  { name: '菏泽市', urls: [
    'http://czj.heze.gov.cn/',
    'https://czj.heze.gov.cn/',
    'https://www.heze.gov.cn/zwgk/czzj/',
    'http://czj.hz.gov.cn/',
  ]},
];

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    try {
      const req = lib.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; if (body.length > 10000) req.destroy(); });
        res.on('end', () => {
          const status = res.statusCode;
          const len = body.length;
          if ([301, 302, 303, 307].includes(status) && res.headers.location) {
            resolve({ url, status, redirect: res.headers.location, ok: false, len });
          } else if (status >= 200 && status < 400 && len > 500) {
            resolve({ url, status, len, ok: true, body: body.substring(0, 2000) });
          } else {
            resolve({ url, status, len, ok: false });
          }
        });
      });
      req.on('error', () => resolve({ url, ok: false, error: true }));
      req.on('timeout', () => { req.destroy(); resolve({ url, ok: false, timeout: true }); });
    } catch {
      resolve({ url, ok: false, error: true });
    }
  });
}

async function main() {
  let found = 0;
  const results = [];

  for (const city of targetCities) {
    let foundUrl = null;
    // Check all URLs for this city
    const checks = await Promise.all(city.urls.map(u => checkUrl(u)));
    for (const r of checks) {
      if (r.ok) {
        foundUrl = r.url;
        break;
      }
      if (r.redirect && r.redirect.includes('gov.cn')) {
        foundUrl = r.redirect;
        break;
      }
    }
    if (foundUrl) {
      found++;
      console.log(`  ✓ ${city.name}: ${foundUrl}`);
      results.push({ name: city.name, url: foundUrl });
    } else {
      // Show what happened
      const details = checks.map(r => {
        if (r.error) return `ERR`;
        if (r.timeout) return `TIMEOUT`;
        return `${r.status}(${r.len})`;
      }).join(', ');
      console.log(`  ✗ ${city.name}: NOT FOUND [${details}]`);
    }
  }

  console.log(`\n=== Found: ${found}/${targetCities.length} ===`);
  if (results.length > 0) {
    console.log('\nApplicable URLs:');
    for (const r of results) {
      console.log(`  ${r.name} → ${r.url}`);
    }
  }
}

main().catch(console.error);
