// Probe missing fiscal budget links for Henan counties
import https from 'https';
import http from 'http';

const missing = [
  // 安阳
  { city: '安阳市', name: '北关区', gov: 'https://www.beiguan.gov.cn/' },
  { city: '安阳市', name: '滑县', gov: 'https://www.huaxian.gov.cn/' },
  { city: '安阳市', name: '内黄县', gov: 'https://www.neihuang.gov.cn/' },
  // 鹤壁
  { city: '鹤壁市', name: '浚县', gov: 'https://www.xunxian.gov.cn/' },
  { city: '鹤壁市', name: '淇县', gov: 'http://www.qxzf.gov.cn/' },
  // 新乡
  { city: '新乡市', name: '卫滨区', gov: 'http://www.wbq.gov.cn/' },
  { city: '新乡市', name: '凤泉区', gov: 'https://www.fengquan.gov.cn/' },
  { city: '新乡市', name: '牧野区', gov: 'http://xxmyq.gov.cn/' },
  { city: '新乡市', name: '新乡县', gov: 'http://www.xinxiang.gov.cn/' },
  { city: '新乡市', name: '延津县', gov: 'http://yanjin.gov.cn/' },
  { city: '新乡市', name: '辉县市', gov: 'https://www.huixianshi.gov.cn/' },
  { city: '新乡市', name: '卫辉市', gov: 'http://www.weihui.gov.cn/' },
  { city: '新乡市', name: '长垣市', gov: 'http://www.changyuan.gov.cn/' },
  // 焦作
  { city: '焦作市', name: '解放区', gov: 'https://www.jfq.gov.cn/' },
  { city: '焦作市', name: '山阳区', gov: 'http://www.syq.gov.cn/' },
  { city: '焦作市', name: '沁阳市', gov: 'https://www.qinyang.gov.cn/' },
  // 濮阳
  { city: '濮阳市', name: '清丰县', gov: 'http://www.qingfeng.gov.cn/' },
  { city: '濮阳市', name: '范县', gov: 'https://www.puyang.gov.cn/' },
  // 许昌
  { city: '许昌市', name: '禹州市', gov: 'http://www.yuzhou.gov.cn/' },
  // 三门峡
  { city: '三门峡市', name: '灵宝市', gov: 'http://www.lingbao.gov.cn/' },
  // 商丘
  { city: '商丘市', name: '睢阳区', gov: 'https://www.suiyangqu.gov.cn/' },
  // 信阳
  { city: '信阳市', name: '浉河区', gov: 'http://www.shihe.gov.cn/' },
  { city: '信阳市', name: '平桥区', gov: 'http://www.xypingqiao.gov.cn/' },
  { city: '信阳市', name: '商城县', gov: 'http://www.hnsc.gov.cn/' },
  { city: '信阳市', name: '潢川县', gov: 'http://www.huangchuan.gov.cn/' },
  // 周口
  { city: '周口市', name: '西华县', gov: 'http://www.xihua.gov.cn/' },
  { city: '周口市', name: '沈丘县', gov: 'https://www.shenqiu.gov.cn/' },
  { city: '周口市', name: '郸城县', gov: 'http://www.dancheng.gov.cn/' },
  { city: '周口市', name: '鹿邑县', gov: 'http://www.zhoukou.gov.cn/' },
  // 驻马店 - 全部10个
  { city: '驻马店市', name: '驿城区', gov: 'http://www.zmdycq.gov.cn/' },
  { city: '驻马店市', name: '西平县', gov: 'http://www.xiping.gov.cn/' },
  { city: '驻马店市', name: '上蔡县', gov: 'http://www.shangcai.gov.cn/' },
  { city: '驻马店市', name: '平舆县', gov: 'http://www.pingyu.gov.cn/' },
  { city: '驻马店市', name: '正阳县', gov: 'http://www.zhengyang.gov.cn/' },
  { city: '驻马店市', name: '确山县', gov: 'http://www.queshan.gov.cn/' },
  { city: '驻马店市', name: '泌阳县', gov: 'http://www.biyang.gov.cn/' },
  { city: '驻马店市', name: '汝南县', gov: 'http://www.runan.gov.cn/' },
  { city: '驻马店市', name: '遂平县', gov: 'http://www.suiping.gov.cn/' },
  { city: '驻马店市', name: '新蔡县', gov: 'https://www.xincai.gov.cn/' },
];

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      timeout,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      rejectUnauthorized: false 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ redirect: res.headers.location, status: res.statusCode });
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve({ body, status: res.statusCode });
      });
    });
    req.on('error', e => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractLinks(html, baseUrl) {
  const linkRegex = /<a[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    if (/预算|决算|财政预决算|财政资金|财政信息/.test(text)) {
      let href = m[1];
      if (href.startsWith('/')) {
        const u = new URL(baseUrl);
        href = u.protocol + '//' + u.host + href;
      } else if (!href.startsWith('http')) {
        href = baseUrl.replace(/\/$/, '') + '/' + href;
      }
      results.push({ href, text });
    }
  }
  return results;
}

function extractInfoLinks(html, baseUrl) {
  const linkRegex = /<a[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    if (/政务公开|信息公开|政府信息公开/.test(text) && text.length < 20) {
      let href = m[1];
      if (href.startsWith('/')) {
        const u = new URL(baseUrl);
        href = u.protocol + '//' + u.host + href;
      } else if (!href.startsWith('http')) {
        href = baseUrl.replace(/\/$/, '') + '/' + href;
      }
      results.push({ href, text });
    }
  }
  return results;
}

async function probeCounty(county) {
  const result = { ...county, govStatus: 'ok', fiscalUrl: '', fiscalStatus: 'not-found', notes: '' };
  
  try {
    // Step 1: Check gov portal
    let data = await fetchUrl(county.gov);
    
    // Handle redirect
    if (data.redirect) {
      result.notes += `Redirect to ${data.redirect}. `;
      try {
        data = await fetchUrl(data.redirect);
      } catch(e) {
        result.govStatus = 'suspicious';
        result.notes += `Redirect failed: ${e.message}. `;
        return result;
      }
    }
    
    if (!data.body) {
      result.govStatus = 'suspicious';
      result.notes += 'Empty response. ';
      return result;
    }
    
    const titleMatch = data.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    result.notes += `Title: "${title}". `;
    
    // Check if name matches
    const shortName = county.name.replace(/[市县区]$/, '');
    if (!data.body.includes(shortName) && !title.includes(shortName)) {
      result.govStatus = 'suspicious';
      result.notes += `Name "${shortName}" not found in page. `;
    }
    
    // Step 2: Search for fiscal links on homepage
    const fiscalLinks = extractLinks(data.body, county.gov);
    if (fiscalLinks.length > 0) {
      result.notes += `Found fiscal links: ${JSON.stringify(fiscalLinks.slice(0, 5))}. `;
      // Verify first candidate
      for (const link of fiscalLinks.slice(0, 3)) {
        try {
          const pageData = await fetchUrl(link.href);
          if (pageData.redirect) {
            result.notes += `${link.href} redirects to ${pageData.redirect}. `;
            continue;
          }
          if (pageData.body) {
            const pageTitle = pageData.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const pt = pageTitle ? pageTitle[1].trim() : '';
            if (/预算|决算|预决算|财政/.test(pt) && !/首页|门户|人民政府$/.test(pt)) {
              result.fiscalUrl = link.href;
              result.fiscalStatus = 'confirmed';
              result.notes += `Confirmed: ${link.href} (title: "${pt}"). `;
              return result;
            }
            // Check body content
            if (/预算|决算/.test(pageData.body) && /\d{4}/.test(pageData.body)) {
              // Has year + budget content, likely valid
              const hasFileList = /<a[^>]*>[^<]*\d{4}[^<]*(?:预算|决算)[^<]*<\/a>/i.test(pageData.body);
              if (hasFileList || /预决算公开|财政预决算|预算公开|决算公开/.test(pageData.body)) {
                result.fiscalUrl = link.href;
                result.fiscalStatus = 'confirmed';
                result.notes += `Confirmed via content: ${link.href}. `;
                return result;
              }
            }
          }
        } catch(e) {
          result.notes += `${link.href} error: ${e.message}. `;
        }
      }
    }
    
    // Step 3: Try info disclosure pages
    const infoLinks = extractInfoLinks(data.body, county.gov);
    for (const il of infoLinks.slice(0, 2)) {
      try {
        const pageData = await fetchUrl(il.href);
        if (pageData.redirect) {
          try {
            const rd = await fetchUrl(pageData.redirect);
            if (rd.body) {
              const fl = extractLinks(rd.body, pageData.redirect);
              if (fl.length > 0) {
                result.notes += `Found fiscal links in ${il.text}: ${JSON.stringify(fl.slice(0, 3))}. `;
                // Try first link
                for (const link of fl.slice(0, 2)) {
                  try {
                    const pd = await fetchUrl(link.href);
                    if (pd.body && /预算|决算/.test(pd.body) && !/首页|门户/.test(pd.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')) {
                      result.fiscalUrl = link.href;
                      result.fiscalStatus = 'confirmed';
                      result.notes += `Confirmed via info page: ${link.href}. `;
                      return result;
                    }
                  } catch(e) {}
                }
              }
            }
          } catch(e) {}
          continue;
        }
        if (pageData.body) {
          const fl = extractLinks(pageData.body, il.href);
          if (fl.length > 0) {
            result.notes += `Found fiscal links in ${il.text}: ${JSON.stringify(fl.slice(0, 3))}. `;
            for (const link of fl.slice(0, 2)) {
              try {
                const pd = await fetchUrl(link.href);
                if (pd.body && /预算|决算/.test(pd.body) && !/首页|门户/.test(pd.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')) {
                  result.fiscalUrl = link.href;
                  result.fiscalStatus = 'confirmed';
                  result.notes += `Confirmed via info page: ${link.href}. `;
                  return result;
                }
              } catch(e) {}
            }
          }
        }
      } catch(e) {
        result.notes += `Info page ${il.href} error: ${e.message}. `;
      }
    }
    
    // Step 4: Try common paths
    const base = county.gov.replace(/\/$/, '');
    const commonPaths = [
      '/zwgk/fdzdgknr/czyjs/',
      '/zwgk/zdlyxxgk/czzj/',
      '/zfxxgk/fdzdgknr/czyjs/',
      '/zfxxgk/zdlyxxgk/czzj/',
      '/zdlyxxgk/czzj/',
      '/xxgk/zdlyxxgk/czzj/',
      '/zwgk/fdzdgknr/czxx/',
      '/jczwgk/czyjs/',
      '/jczwgkzl/sdly/czyjsly/',
      '/sdly/czyjsly/',
      '/zfxxgk/fdzdgknr/czxx/',
    ];
    
    for (const path of commonPaths) {
      try {
        const testUrl = base + path;
        const pd = await fetchUrl(testUrl, 10000);
        if (pd.redirect) continue;
        if (pd.body && pd.status === 200) {
          const pt = pd.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
          // Check it's not just the homepage
          if (pt === title || /首页|门户|人民政府$/.test(pt)) continue;
          if (/预算|决算|财政/.test(pd.body) && /\d{4}/.test(pd.body)) {
            const hasContent = /<a[^>]*>[^<]*(?:预算|决算)[^<]*<\/a>/i.test(pd.body);
            if (hasContent || /预决算公开|财政预决算|预决算信息/.test(pd.body)) {
              result.fiscalUrl = testUrl;
              result.fiscalStatus = 'confirmed';
              result.notes += `Confirmed via common path: ${testUrl} (title: "${pt}"). `;
              return result;
            }
          }
        }
      } catch(e) {}
    }
    
    result.notes += 'No fiscal link found after all attempts. ';
    
  } catch(e) {
    result.govStatus = 'error';
    result.notes += `Gov portal error: ${e.message}. `;
  }
  
  return result;
}

// Process sequentially with 1s delay
async function main() {
  const results = [];
  for (let i = 0; i < missing.length; i++) {
    const county = missing[i];
    console.log(`[${i+1}/${missing.length}] Processing ${county.city} ${county.name}...`);
    const result = await probeCounty(county);
    results.push(result);
    console.log(`  Status: gov=${result.govStatus}, fiscal=${result.fiscalStatus}`);
    if (result.fiscalUrl) console.log(`  URL: ${result.fiscalUrl}`);
    console.log(`  Notes: ${result.notes.substring(0, 200)}`);
    // Small delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
