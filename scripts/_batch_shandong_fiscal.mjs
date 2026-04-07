// Batch probe fiscal budget URLs for all empty Shandong counties
// Tries multiple common paths and checks for fiscal-related content

import http from 'http';
import https from 'https';

const counties = [
  // 青岛 (5)
  { city: "青岛市", name: "市北区", gov: "http://www.qingdaoshibei.gov.cn" },
  { city: "青岛市", name: "崂山区", gov: "http://www.qdlaoshan.gov.cn" },
  { city: "青岛市", name: "李沧区", gov: "http://www.qdlc.gov.cn" },
  { city: "青岛市", name: "即墨区", gov: "http://www.jimo.gov.cn" },
  { city: "青岛市", name: "胶州市", gov: "http://www.jiaozhou.gov.cn" },
  // 枣庄 (6) - note: 市中区 URL is actually http://www.zzszq.gov.cn
  { city: "枣庄市", name: "市中区", gov: "http://www.zzszq.gov.cn" },
  { city: "枣庄市", name: "薛城区", gov: "http://www.xuecheng.gov.cn" },
  { city: "枣庄市", name: "峄城区", gov: "http://www.ycq.gov.cn" },
  { city: "枣庄市", name: "台儿庄区", gov: "http://www.tez.gov.cn" },
  { city: "枣庄市", name: "山亭区", gov: "http://www.shanting.gov.cn" },
  { city: "枣庄市", name: "滕州市", gov: "http://www.tengzhou.gov.cn" },
  // 东营 (5)
  { city: "东营市", name: "东营区", gov: "http://www.dyq.gov.cn" },
  { city: "东营市", name: "河口区", gov: "http://www.hekou.gov.cn" },
  { city: "东营市", name: "垦利区", gov: "http://www.kenli.gov.cn" },
  { city: "东营市", name: "利津县", gov: "http://www.lijin.gov.cn" },
  { city: "东营市", name: "广饶县", gov: "http://www.guangrao.gov.cn" },
  // 烟台 (1)
  { city: "烟台市", name: "栖霞市", gov: "https://www.qixia.gov.cn" },
  // 潍坊 (12)
  { city: "潍坊市", name: "潍城区", gov: "http://www.weicheng.gov.cn" },
  { city: "潍坊市", name: "寒亭区", gov: "http://www.hanting.gov.cn" },
  { city: "潍坊市", name: "坊子区", gov: "http://www.fangzi.gov.cn" },
  { city: "潍坊市", name: "奎文区", gov: "http://www.kuiwen.gov.cn" },
  { city: "潍坊市", name: "临朐县", gov: "http://www.linqu.gov.cn" },
  { city: "潍坊市", name: "昌乐县", gov: "http://www.changle.gov.cn" },
  { city: "潍坊市", name: "青州市", gov: "http://www.qingzhou.gov.cn" },
  { city: "潍坊市", name: "诸城市", gov: "http://www.zhucheng.gov.cn" },
  { city: "潍坊市", name: "寿光市", gov: "http://www.shouguang.gov.cn" },
  { city: "潍坊市", name: "安丘市", gov: "http://www.anqiu.gov.cn" },
  { city: "潍坊市", name: "高密市", gov: "http://www.gaomi.gov.cn" },
  { city: "潍坊市", name: "昌邑市", gov: "http://www.changyi.gov.cn" },
  // 济宁 (11)
  { city: "济宁市", name: "任城区", gov: "http://www.rencheng.gov.cn" },
  { city: "济宁市", name: "兖州区", gov: "http://www.yanzhou.gov.cn" },
  { city: "济宁市", name: "微山县", gov: "http://www.weishan.gov.cn" },
  { city: "济宁市", name: "鱼台县", gov: "http://www.yutai.gov.cn" },
  { city: "济宁市", name: "金乡县", gov: "http://www.jinxiang.gov.cn" },
  { city: "济宁市", name: "嘉祥县", gov: "http://www.jiaxiang.gov.cn" },
  { city: "济宁市", name: "汶上县", gov: "http://www.wenshang.gov.cn" },
  { city: "济宁市", name: "泗水县", gov: "http://www.sishui.gov.cn" },
  { city: "济宁市", name: "梁山县", gov: "http://www.liangshan.gov.cn" },
  { city: "济宁市", name: "曲阜市", gov: "http://www.qufu.gov.cn" },
  { city: "济宁市", name: "邹城市", gov: "http://www.zoucheng.gov.cn" },
  // 泰安 (6)
  { city: "泰安市", name: "泰山区", gov: "http://www.sdtaishan.gov.cn" },
  { city: "泰安市", name: "岱岳区", gov: "http://www.daiyue.gov.cn" },
  { city: "泰安市", name: "宁阳县", gov: "http://www.ny.gov.cn" },
  { city: "泰安市", name: "东平县", gov: "http://www.dongping.gov.cn" },
  { city: "泰安市", name: "新泰市", gov: "http://www.xintai.gov.cn" },
  { city: "泰安市", name: "肥城市", gov: "http://www.feicheng.gov.cn" },
  // 威海 (3)
  { city: "威海市", name: "环翠区", gov: "http://www.huancui.gov.cn" },
  { city: "威海市", name: "荣成市", gov: "http://www.rongcheng.gov.cn" },
  { city: "威海市", name: "乳山市", gov: "http://www.rushan.gov.cn" },
  // 日照 (4)
  { city: "日照市", name: "东港区", gov: "http://www.rzdg.gov.cn" },
  { city: "日照市", name: "岚山区", gov: "http://www.rzlanshan.gov.cn" },
  { city: "日照市", name: "五莲县", gov: "http://www.wulian.gov.cn" },
  { city: "日照市", name: "莒县", gov: "http://www.juxian.gov.cn" },
  // 临沂 (6)
  { city: "临沂市", name: "河东区", gov: "http://www.hedong.gov.cn" },
  { city: "临沂市", name: "沂南县", gov: "http://www.yinan.gov.cn" },
  { city: "临沂市", name: "郯城县", gov: "http://www.tancheng.gov.cn" },
  { city: "临沂市", name: "兰陵县", gov: "http://www.lanling.gov.cn" },
  { city: "临沂市", name: "费县", gov: "http://www.feixian.gov.cn" },
  { city: "临沂市", name: "临沭县", gov: "http://www.linshu.gov.cn" },
  // 德州 (11)
  { city: "德州市", name: "德城区", gov: "http://www.decheng.gov.cn" },
  { city: "德州市", name: "陵城区", gov: "http://www.dzlc.gov.cn" },
  { city: "德州市", name: "宁津县", gov: "http://sdningjin.gov.cn" },
  { city: "德州市", name: "庆云县", gov: "http://www.qingyun.gov.cn" },
  { city: "德州市", name: "临邑县", gov: "http://www.linyixian.gov.cn" },
  { city: "德州市", name: "齐河县", gov: "http://www.qihe.gov.cn" },
  { city: "德州市", name: "平原县", gov: "http://www.zgpingyuan.gov.cn" },
  { city: "德州市", name: "夏津县", gov: "http://www.xiajin.gov.cn" },
  { city: "德州市", name: "武城县", gov: "http://www.wucheng.gov.cn" },
  { city: "德州市", name: "禹城市", gov: "http://www.yucheng.gov.cn" },
  { city: "德州市", name: "乐陵市", gov: "http://www.laoling.gov.cn" },
  // 聊城 (7)
  { city: "聊城市", name: "东昌府区", gov: "http://www.dongchangfu.gov.cn" },
  { city: "聊城市", name: "茌平区", gov: "http://www.chiping.gov.cn" },
  { city: "聊城市", name: "阳谷县", gov: "http://www.yanggu.gov.cn" },
  { city: "聊城市", name: "莘县", gov: "http://www.shenxian.gov.cn" },
  { city: "聊城市", name: "东阿县", gov: "http://www.donge.gov.cn" },
  { city: "聊城市", name: "冠县", gov: "http://www.guanxian.gov.cn" },
  { city: "聊城市", name: "高唐县", gov: "http://www.gaotang.gov.cn" },
  // 滨州 (7)
  { city: "滨州市", name: "滨城区", gov: "http://www.bincheng.gov.cn" },
  { city: "滨州市", name: "沾化区", gov: "http://www.zhanhua.gov.cn" },
  { city: "滨州市", name: "惠民县", gov: "http://www.huimin.gov.cn" },
  { city: "滨州市", name: "阳信县", gov: "http://www.yangxin.gov.cn" },
  { city: "滨州市", name: "无棣县", gov: "http://www.wudi.gov.cn" },
  { city: "滨州市", name: "博兴县", gov: "http://www.boxing.gov.cn" },
  { city: "滨州市", name: "邹平市", gov: "http://www.zouping.gov.cn" },
  // 菏泽 (9)
  { city: "菏泽市", name: "牡丹区", gov: "http://www.mudan.gov.cn" },
  { city: "菏泽市", name: "定陶区", gov: "http://www.dingtao.gov.cn" },
  { city: "菏泽市", name: "曹县", gov: "http://www.caoxian.gov.cn" },
  { city: "菏泽市", name: "单县", gov: "http://www.shanxian.gov.cn" },
  { city: "菏泽市", name: "成武县", gov: "http://www.chengwu.gov.cn" },
  { city: "菏泽市", name: "巨野县", gov: "http://www.juye.gov.cn" },
  { city: "菏泽市", name: "郓城县", gov: "http://www.yuncheng.gov.cn" },
  { city: "菏泽市", name: "鄄城县", gov: "http://www.juancheng.gov.cn" },
  { city: "菏泽市", name: "东明县", gov: "http://www.dongming.gov.cn" },
];

// Common fiscal page paths to try
const paths = [
  '/zwgk/czzj/',           // 财政资金
  '/zwgk/zdlyxxgk/czxx/',  // 重点领域-财政信息
  '/zwgk/gknr/czzj/',      // 公开内容-财政资金
  '/zwgk/xxgkml/czxx/',    // 信息公开目录-财政信息
  '/gongkai/',              // Generic public disclosure
  '/zwgk/zdlyxxgk/',       // 重点领域信息公开
  '/zwgk/xxgkml/',         // 信息公开目录
  '/zwgk/',                // 政务公开
];

const fiscalRegex = /财政[信预]|预[决算]|czxx|czzj|czyjs|czjsxx|czjgsz|财政局/i;
const urlRegex = /href=["']([^"']*(?:cz|czxx|czzj|czyjs|财政)[^"']*?)["']/gi;

function fetch_(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => resolve({ ok: false, status: 0, body: '' }), timeout);
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timer);
        const loc = res.headers.location;
        const fullLoc = loc.startsWith('http') ? loc : new URL(loc, url).href;
        resolve({ ok: false, status: res.statusCode, redirect: fullLoc, body: '' });
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', c => { if (body.length < 200000) body += c; });
      res.on('end', () => { clearTimeout(timer); resolve({ ok: res.statusCode === 200, status: res.statusCode, body }); });
    });
    req.on('error', () => { clearTimeout(timer); resolve({ ok: false, status: 0, body: '' }); });
  });
}

async function probeCounty(county) {
  const base = county.gov.replace(/\/$/, '');
  const results = [];
  
  // Try HTTPS version first if HTTP
  const bases = [base];
  if (base.startsWith('http://')) {
    bases.push(base.replace('http://', 'https://'));
  }
  
  for (const b of bases) {
    for (const path of paths) {
      const url = b + path;
      const res = await fetch_(url);
      
      if (res.redirect) {
        // Try following one redirect
        const res2 = await fetch_(res.redirect);
        if (res2.ok && fiscalRegex.test(res2.body)) {
          // Extract fiscal-related URLs
          const matches = [];
          let m;
          const re = /href=["']([^"']*?)["'][^>]*>[^<]*(?:财政[信预]|预[决算]|财政资金|财政公开)[^<]*/gi;
          while ((m = re.exec(res2.body)) !== null) {
            matches.push(m[1]);
          }
          results.push({ url: res.redirect, type: 'redirect', matches, hasContent: true });
        }
        continue;
      }
      
      if (!res.ok) continue;
      
      if (path === '/gongkai/') {
        // For /gongkai/, need to search for fiscal links
        const re = /href=["']([^"']*?)["'][^>]*>[^<]*(?:财政[信预]|预[决算]|财政资金|财政公开)[^<]*/gi;
        const matches = [];
        let m;
        while ((m = re.exec(res.body)) !== null) {
          matches.push(m[1]);
        }
        if (matches.length > 0) {
          results.push({ url, type: 'gongkai', matches, hasContent: true });
        }
      } else if (fiscalRegex.test(res.body)) {
        // Extract fiscal-related URLs
        const re = /href=["']([^"']*?)["'][^>]*>[^<]*(?:财政[信预]|预[决算]|财政资金|财政公开)[^<]*/gi;
        const matches = [];
        let m;
        while ((m = re.exec(res.body)) !== null) {
          matches.push(m[1]);
        }
        results.push({ url, type: 'direct', matches, hasContent: true });
      }
    }
    if (results.length > 0) break; // Found something with this base
  }
  
  return results;
}

async function main() {
  console.log(`Probing ${counties.length} counties...`);
  const allResults = {};
  let found = 0;
  
  // Process in batches of 5 for speed
  for (let i = 0; i < counties.length; i += 5) {
    const batch = counties.slice(i, i + 5);
    const promises = batch.map(async (county) => {
      const results = await probeCounty(county);
      const key = `${county.city}|${county.name}`;
      if (results.length > 0) {
        found++;
        allResults[key] = results;
        console.log(`✓ ${key}: ${results[0].url} (${results[0].matches.length} fiscal links)`);
      } else {
        console.log(`✗ ${key}: no fiscal page found`);
      }
    });
    await Promise.all(promises);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Found: ${found}/${counties.length}`);
  console.log(`\n=== FOUND URLS ===`);
  for (const [key, results] of Object.entries(allResults)) {
    const [city, name] = key.split('|');
    const r = results[0];
    console.log(`${city} > ${name}:`);
    console.log(`  Page: ${r.url}`);
    if (r.matches.length > 0) {
      console.log(`  Fiscal links: ${r.matches.slice(0, 3).join(', ')}`);
    }
  }
  
  // Save JSON
  const fs = await import('fs');
  fs.writeFileSync('scripts/_shandong_batch_results.json', JSON.stringify(allResults, null, 2));
  console.log('\nResults saved to scripts/_shandong_batch_results.json');
}

main().catch(console.error);
