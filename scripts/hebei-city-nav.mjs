// Extract county government domains from Hebei prefecture-level city portals
// The county navigation links are in the footer of city homepages

import https from 'https';
import http from 'http';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// City portals with their missing counties
const cities = [
  { name: '石家庄市', url: 'http://www.sjz.gov.cn/', missing: ['长安区','新华区','井陉矿区','裕华区','藁城区','鹿泉区','井陉县','正定县','高邑县','深泽县','赞皇县','平山县'] },
  { name: '张家口市', url: 'https://www.zjk.gov.cn/index.html', missing: ['桥西区','宣化区','下花园区','万全区','崇礼区','张北县','康保县','沽源县','尚义县','蔚县','阳原县','怀安县','涿鹿县','赤城县'] },
  { name: '唐山市', url: 'http://www.tangshan.gov.cn/', missing: ['路南区','开平区','丰南区'] },
  { name: '秦皇岛市', url: 'http://www.qhd.gov.cn/', missing: ['海港区','抚宁区','青龙满族自治县','昌黎县'] },
  { name: '邯郸市', url: 'https://www.hd.gov.cn/', missing: ['丛台区','峰峰矿区','肥乡区','永年区','广平县','魏县','曲周县'] },
  { name: '邢台市', url: 'http://www.xingtai.gov.cn/', missing: ['信都区','内丘县','柏乡县','广宗县','平乡县','清河县'] },
  { name: '保定市', url: 'https://www.baoding.gov.cn/', missing: ['清苑区','阜平县','易县','顺平县'] },
  { name: '廊坊市', url: 'http://www.lf.gov.cn/', missing: ['固安县','大厂回族自治县'] },
  { name: '承德市', url: 'http://www.chengde.gov.cn/', missing: ['隆化县'] },
  { name: '沧州市', url: 'http://www.cangzhou.gov.cn/', missing: ['盐山县'] },
  { name: '衡水市', url: 'http://www.hengshui.gov.cn/', missing: ['阜城县'] },
];

async function extractCountyLinks(cityName, html, missingCounties) {
  const results = [];
  // Match all links in HTML: <a href="URL">TEXT</a> or <a ... href="URL" ... title="TEXT">
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<|<a[^>]*href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/gi;
  let match;
  const allLinks = [];
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1] || match[3];
    const text = (match[2] || match[4] || '').trim();
    if (url && url.includes('.gov.cn')) {
      allLinks.push({ url, text });
    }
  }
  
  for (const county of missingCounties) {
    // Find links where the text or URL might match this county
    const shortName = county.replace(/[市区县]|满族自治县|回族自治县/g, '');
    const found = allLinks.filter(l => {
      return l.text.includes(shortName) || l.url.includes(shortName);
    });
    if (found.length > 0) {
      // Pick the best match - prefer direct county government links
      const best = found.find(f => f.url.match(/^https?:\/\/[^/]+\.gov\.cn\/?$/)) || found[0];
      results.push({ county, url: best.url, text: best.text, allMatches: found.length });
    }
  }
  return results;
}

async function main() {
  for (const city of cities) {
    console.log(`\n=== ${city.name} (${city.url}) ===`);
    try {
      const html = await fetch(city.url);
      console.log(`  HTML length: ${html.length}`);
      const results = await extractCountyLinks(city.name, html, city.missing);
      if (results.length > 0) {
        for (const r of results) {
          console.log(`  ✓ ${r.county}: ${r.url} [${r.text}] (${r.allMatches} matches)`);
        }
      }
      const notFound = city.missing.filter(m => !results.find(r => r.county === m));
      if (notFound.length > 0) {
        console.log(`  ✗ Not found: ${notFound.join(', ')}`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      // Try https if http failed
      if (city.url.startsWith('http://')) {
        try {
          const altUrl = city.url.replace('http://', 'https://');
          console.log(`  Retrying with ${altUrl}...`);
          const html = await fetch(altUrl);
          console.log(`  HTML length: ${html.length}`);
          const results = await extractCountyLinks(city.name, html, city.missing);
          if (results.length > 0) {
            for (const r of results) {
              console.log(`  ✓ ${r.county}: ${r.url} [${r.text}] (${r.allMatches} matches)`);
            }
          }
        } catch (e2) {
          console.log(`  ALSO FAILED: ${e2.message}`);
        }
      }
    }
  }
}

main();
