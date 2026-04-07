/**
 * Gap-filling script: Tries multiple URL patterns for cities that are still missing URLs.
 * Uses Tier 2 + Tier 3 methods from the fiscal-site-finder skill.
 */
import http from 'http';
import https from 'https';

const missingCities = {
  '河北省': [
    { name: '秦皇岛市', py: ['qhd', 'qinhuangdao'] },
    { name: '邯郸市', py: ['hd', 'handan'] },
    { name: '邢台市', py: ['xt', 'xingtai'] },
    { name: '保定市', py: ['bd', 'baoding'] },
    { name: '承德市', py: ['cd', 'chengde'] },
    { name: '沧州市', py: ['cz', 'cangzhou'] },
  ],
  '山西省': [
    { name: '太原市', py: ['ty', 'taiyuan'] },
    { name: '大同市', py: ['dt', 'datong'] },
    { name: '晋中市', py: ['jz', 'jinzhong'] },
    { name: '运城市', py: ['yc', 'yuncheng'] },
    { name: '忻州市', py: ['xz', 'xinzhou'] },
    { name: '吕梁市', py: ['ll', 'lvliang', 'luliang'] },
  ],
  '辽宁省': [
    { name: '抚顺市', py: ['fs', 'fushun'] },
    { name: '丹东市', py: ['dd', 'dandong'] },
    { name: '铁岭市', py: ['tl', 'tieling'] },
  ],
  '吉林省': [
    { name: '吉林市', py: ['jl', 'jilin'] },
    { name: '四平市', py: ['sp', 'siping'] },
    { name: '通化市', py: ['th', 'tonghua'] },
    { name: '白山市', py: ['bs', 'baishan'] },
    { name: '松原市', py: ['sy', 'songyuan'] },
    { name: '白城市', py: ['bc', 'baicheng'] },
  ],
  '黑龙江省': [
    { name: '哈尔滨市', py: ['hrb', 'haerbin', 'harbin'] },
    { name: '齐齐哈尔市', py: ['qqhr', 'qqhe'] },
    { name: '鸡西市', py: ['jx', 'jixi'] },
    { name: '鹤岗市', py: ['hg', 'hegang'] },
    { name: '双鸭山市', py: ['sys', 'shuangyashan'] },
    { name: '大庆市', py: ['dq', 'daqing'] },
    { name: '佳木斯市', py: ['jms', 'jiamusi'] },
    { name: '七台河市', py: ['qth', 'qitaihe'] },
    { name: '黑河市', py: ['hh', 'heihe'] },
    { name: '绥化市', py: ['sh', 'suihua'] },
    { name: '大兴安岭地区', py: ['dxal', 'daxinganling'] },
  ],
  '浙江省': [
    { name: '绍兴市', py: ['sx', 'shaoxing'] },
    { name: '丽水市', py: ['ls', 'lishui'] },
  ],
  '安徽省': [
    { name: '芜湖市', py: ['wh', 'wuhu'] },
    { name: '淮南市', py: ['hn', 'huainan'] },
    { name: '马鞍山市', py: ['mas', 'maanshan'] },
    { name: '安庆市', py: ['aq', 'anqing'] },
    { name: '宿州市', py: ['sz', 'suzhou'] },
  ],
  '江西省': [
    { name: '九江市', py: ['jj', 'jiujiang'] },
    { name: '宜春市', py: ['yc', 'yichun'] },
    { name: '抚州市', py: ['fz', 'fuzhou'] },
    { name: '上饶市', py: ['sr', 'shangrao'] },
  ],
  '山东省': [
    { name: '青岛市', py: ['qd', 'qingdao'] },
    { name: '淄博市', py: ['zb', 'zibo'] },
    { name: '枣庄市', py: ['zz', 'zaozhuang'] },
    { name: '东营市', py: ['dy', 'dongying'] },
    { name: '济宁市', py: ['jn', 'jining'] },
    { name: '菏泽市', py: ['hz', 'heze'] },
  ],
};

// URL pattern templates to try
function getCandidateUrls(pinyinList) {
  const urls = [];
  for (const py of pinyinList) {
    urls.push(
      `http://czj.${py}.gov.cn/`,
      `https://czj.${py}.gov.cn/`,
      `http://czt.${py}.gov.cn/`,
      `https://czt.${py}.gov.cn/`,
      `http://cz.${py}.gov.cn/`,
      `https://cz.${py}.gov.cn/`,
      // Tier 3: city portal fiscal section
      `http://www.${py}.gov.cn/zwgk/czzj/`,
      `https://www.${py}.gov.cn/zwgk/czzj/`,
      `http://www.${py}.gov.cn/zwgk/czxx/`,
      `https://www.${py}.gov.cn/zwgk/zdly/czzj/`,
      // Additional patterns
      `http://czj.${py}.gov.cn/zwgk/yjsgk/`,
      `https://czj.${py}.gov.cn/zwgk/yjsgk/`,
    );
  }
  return urls;
}

function checkUrl(url, timeout = 7000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    try {
      const req = lib.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const status = res.statusCode;
          const len = body.length;
          // Follow redirects
          if ([301, 302, 303, 307].includes(status) && res.headers.location) {
            resolve({ url, status, redirect: res.headers.location, ok: false });
          } else if (status >= 200 && status < 400 && len > 500) {
            resolve({ url, status, len, ok: true });
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

async function findCityUrl(city) {
  const candidates = getCandidateUrls(city.py);
  // Check in batches of 6
  for (let i = 0; i < candidates.length; i += 6) {
    const batch = candidates.slice(i, i + 6);
    const results = await Promise.all(batch.map(u => checkUrl(u)));
    for (const r of results) {
      if (r.ok) {
        return r.url;
      }
      // If redirect to a valid-looking gov.cn URL, accept it
      if (r.redirect && r.redirect.includes('gov.cn')) {
        return r.redirect;
      }
    }
  }
  return null;
}

async function main() {
  const results = {};
  let found = 0;
  let total = 0;

  for (const [province, cities] of Object.entries(missingCities)) {
    console.log(`\n=== ${province} ===`);
    results[province] = [];
    
    // Process cities in parallel within each province (max 3 at a time)
    for (let i = 0; i < cities.length; i += 3) {
      const batch = cities.slice(i, i + 3);
      const batchResults = await Promise.all(batch.map(async (city) => {
        total++;
        const url = await findCityUrl(city);
        if (url) {
          found++;
          console.log(`  ✓ ${city.name}: ${url}`);
          return { name: city.name, url };
        } else {
          console.log(`  ✗ ${city.name}: NOT FOUND`);
          return { name: city.name, url: null };
        }
      }));
      results[province].push(...batchResults);
    }
  }

  console.log(`\n=== SUMMARY: ${found}/${total} found ===\n`);
  
  // Output results in a format easy to process
  for (const [province, cities] of Object.entries(results)) {
    const foundCities = cities.filter(c => c.url);
    if (foundCities.length > 0) {
      console.log(`${province}:`);
      for (const c of foundCities) {
        console.log(`  ${c.name} → ${c.url}`);
      }
    }
  }
}

main().catch(console.error);
