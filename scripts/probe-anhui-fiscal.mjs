// Probe 安徽省 county fiscal budget URLs
// Strategy: try multiple URL patterns per county, check HTTP status
import https from 'https';
import http from 'http';

const counties = [
  // 合肥市
  { city: "合肥市", name: "庐阳区", gov: "https://www.ahhfly.gov.cn" },
  { city: "合肥市", name: "蜀山区", gov: "https://www.shushan.gov.cn" },
  { city: "合肥市", name: "包河区", gov: "https://www.baoh.gov.cn" },
  { city: "合肥市", name: "长丰县", gov: "https://www.changfeng.gov.cn" },
  { city: "合肥市", name: "肥东县", gov: "https://www.feidong.gov.cn" },
  { city: "合肥市", name: "肥西县", gov: "https://www.feixi.gov.cn" },
  { city: "合肥市", name: "庐江县", gov: "https://www.lujiang.gov.cn" },
  { city: "合肥市", name: "巢湖市", gov: "https://www.chaohu.gov.cn" },
  // 芜湖市
  { city: "芜湖市", name: "镜湖区", gov: "https://www.whjhq.gov.cn" },
  { city: "芜湖市", name: "弋江区", gov: "https://www.yjq.gov.cn" },
  { city: "芜湖市", name: "鸠江区", gov: "https://www.jjq.gov.cn" },
  { city: "芜湖市", name: "湾沚区", gov: "https://www.wanzhi.gov.cn" },
  { city: "芜湖市", name: "繁昌区", gov: "https://www.fanchang.gov.cn" },
  { city: "芜湖市", name: "南陵县", gov: "https://www.nlx.gov.cn" },
  { city: "芜湖市", name: "无为市", gov: "https://www.ww.gov.cn" },
  // 蚌埠市
  { city: "蚌埠市", name: "龙子湖区", gov: "https://www.bblzh.gov.cn" },
  { city: "蚌埠市", name: "蚌山区", gov: "https://www.bengshan.gov.cn" },
  { city: "蚌埠市", name: "禹会区", gov: "https://www.yuhui.gov.cn" },
  { city: "蚌埠市", name: "淮上区", gov: "https://www.huaishang.gov.cn" },
  { city: "蚌埠市", name: "怀远县", gov: "https://www.ahhy.gov.cn" },
  { city: "蚌埠市", name: "五河县", gov: "https://www.wuhe.gov.cn" },
  { city: "蚌埠市", name: "固镇县", gov: "https://www.guzhen.gov.cn" },
  // 淮南市
  { city: "淮南市", name: "大通区", gov: "https://www.hndt.gov.cn" },
  { city: "淮南市", name: "田家庵区", gov: "https://www.tja.gov.cn" },
  { city: "淮南市", name: "谢家集区", gov: "https://www.xiejiaji.gov.cn" },
  { city: "淮南市", name: "八公山区", gov: "https://www.bagongshan.gov.cn" },
  { city: "淮南市", name: "潘集区", gov: "https://www.panji.gov.cn" },
  { city: "淮南市", name: "凤台县", gov: "https://www.ft.gov.cn" },
  { city: "淮南市", name: "寿县", gov: "https://www.shouxian.gov.cn" },
  // 马鞍山市
  { city: "马鞍山市", name: "花山区", gov: "https://www.mashsq.gov.cn" },
  { city: "马鞍山市", name: "雨山区", gov: "http://www.masysq.gov.cn" },
  { city: "马鞍山市", name: "博望区", gov: "http://www.masbwq.gov.cn" },
  { city: "马鞍山市", name: "当涂县", gov: "http://www.dangtu.gov.cn" },
  { city: "马鞍山市", name: "含山县", gov: "http://www.hanshan.gov.cn" },
  { city: "马鞍山市", name: "和县", gov: "http://www.hexian.gov.cn" },
  // 淮北市
  { city: "淮北市", name: "杜集区", gov: "https://www.hbdj.gov.cn" },
  { city: "淮北市", name: "相山区", gov: "https://www.hbxs.gov.cn" },
  { city: "淮北市", name: "烈山区", gov: "https://www.lieshan.gov.cn" },
  { city: "淮北市", name: "濉溪县", gov: "https://www.sxx.gov.cn" },
  // 铜陵市 (铜官区和枞阳县已有，跳过)
  { city: "铜陵市", name: "义安区", gov: "https://www.ahtlyaq.gov.cn" },
  { city: "铜陵市", name: "郊区", gov: "https://www.tljq.gov.cn" },
  // 安庆市
  { city: "安庆市", name: "迎江区", gov: "https://www.ahyingjiang.gov.cn" },
  { city: "安庆市", name: "大观区", gov: "https://www.aqdgq.gov.cn" },
  { city: "安庆市", name: "宜秀区", gov: "https://www.yixiu.gov.cn" },
  { city: "安庆市", name: "怀宁县", gov: "http://www.huaining.gov.cn" },
  { city: "安庆市", name: "太湖县", gov: "http://www.thx.gov.cn" },
  { city: "安庆市", name: "宿松县", gov: "http://www.susong.gov.cn" },
  { city: "安庆市", name: "望江县", gov: "http://www.wangjiang.gov.cn" },
  { city: "安庆市", name: "岳西县", gov: "http://www.yuexi.gov.cn" },
  { city: "安庆市", name: "桐城市", gov: "http://www.tongcheng.gov.cn" },
  { city: "安庆市", name: "潜山市", gov: "https://www.qss.gov.cn" },
  // 黄山市 (黄山区现有链接为市级需修正)
  { city: "黄山市", name: "屯溪区", gov: "https://www.ahtxq.gov.cn" },
  { city: "黄山市", name: "黄山区", gov: "https://www.hsq.gov.cn" },
  { city: "黄山市", name: "徽州区", gov: "https://www.ahhz.gov.cn" },
  { city: "黄山市", name: "歙县", gov: "https://www.ahshx.gov.cn" },
  { city: "黄山市", name: "休宁县", gov: "https://www.xiuning.gov.cn" },
  { city: "黄山市", name: "黟县", gov: "https://www.yixian.gov.cn" },
  { city: "黄山市", name: "祁门县", gov: "https://www.ahqimen.gov.cn" },
  // 滁州市
  { city: "滁州市", name: "琅琊区", gov: "http://www.lyq.gov.cn" },
  { city: "滁州市", name: "南谯区", gov: "https://www.cznq.gov.cn" },
  { city: "滁州市", name: "来安县", gov: "http://www.laian.gov.cn" },
  { city: "滁州市", name: "全椒县", gov: "http://www.quanjiao.gov.cn" },
  { city: "滁州市", name: "定远县", gov: "http://www.dingyuan.gov.cn" },
  { city: "滁州市", name: "凤阳县", gov: "http://www.fengyang.gov.cn" },
  { city: "滁州市", name: "天长市", gov: "http://www.tianchang.gov.cn" },
  { city: "滁州市", name: "明光市", gov: "http://www.mingguang.gov.cn" },
  // 阜阳市
  { city: "阜阳市", name: "颍州区", gov: "https://www.yingzhouqu.gov.cn" },
  { city: "阜阳市", name: "颍东区", gov: "http://www.yingdong.gov.cn" },
  { city: "阜阳市", name: "颍泉区", gov: "https://www.yingquan.gov.cn" },
  { city: "阜阳市", name: "临泉县", gov: "https://www.linquan.gov.cn" },
  { city: "阜阳市", name: "太和县", gov: "https://www.taihe.gov.cn" },
  { city: "阜阳市", name: "阜南县", gov: "https://www.funan.gov.cn" },
  { city: "阜阳市", name: "颍上县", gov: "https://www.yingshang.gov.cn" },
  { city: "阜阳市", name: "界首市", gov: "https://www.ahjs.gov.cn" },
  // 宿州市
  { city: "宿州市", name: "埇桥区", gov: "https://www.szyq.gov.cn" },
  { city: "宿州市", name: "砀山县", gov: "https://www.dangshan.gov.cn" },
  { city: "宿州市", name: "萧县", gov: "https://www.ahxx.gov.cn" },
  { city: "宿州市", name: "灵璧县", gov: "https://www.lingbi.gov.cn" },
  { city: "宿州市", name: "泗县", gov: "https://www.sixian.gov.cn" },
  // 六安市
  { city: "六安市", name: "金安区", gov: "https://www.ja.gov.cn" },
  { city: "六安市", name: "裕安区", gov: "https://www.yuan.gov.cn" },
  { city: "六安市", name: "叶集区", gov: "https://www.ahyeji.gov.cn" },
  { city: "六安市", name: "霍邱县", gov: "https://www.huoqiu.gov.cn" },
  { city: "六安市", name: "舒城县", gov: "https://www.shucheng.gov.cn" },
  { city: "六安市", name: "金寨县", gov: "https://www.ahjinzhai.gov.cn" },
  { city: "六安市", name: "霍山县", gov: "https://www.ahhuoshan.gov.cn" },
  // 亳州市
  { city: "亳州市", name: "谯城区", gov: "https://www.bzqc.gov.cn" },
  { city: "亳州市", name: "涡阳县", gov: "https://www.gy.gov.cn" },
  { city: "亳州市", name: "蒙城县", gov: "https://www.mengcheng.gov.cn" },
  { city: "亳州市", name: "利辛县", gov: "https://www.lixin.gov.cn" },
  // 池州市 (贵池区现有链接为市级; 青阳县现有链接为市级)
  { city: "池州市", name: "贵池区", gov: "http://www.chizhou.gov.cn" },
  { city: "池州市", name: "东至县", gov: "http://www.dongzhi.gov.cn" },
  { city: "池州市", name: "石台县", gov: "http://www.ahshitai.gov.cn" },
  { city: "池州市", name: "青阳县", gov: "https://www.ahqy.gov.cn" },
  // 宣城市
  { city: "宣城市", name: "宣州区", gov: "https://www.xuanzhou.gov.cn" },
  { city: "宣城市", name: "郎溪县", gov: "https://www.ahlx.gov.cn" },
  { city: "宣城市", name: "泾县", gov: "https://www.ahjx.gov.cn" },
  { city: "宣城市", name: "绩溪县", gov: "https://www.cnjx.gov.cn" },
  { city: "宣城市", name: "旌德县", gov: "https://www.ahjd.gov.cn" },
  { city: "宣城市", name: "宁国市", gov: "http://www.ningguo.gov.cn" },
  { city: "宣城市", name: "广德市", gov: "https://www.guangde.gov.cn" },
];

// URL patterns to try for each county
function getPatterns(govBase) {
  const base = govBase.replace(/\/$/, '');
  return [
    // Pattern 1: /xjwz/zwgk/zfxxgkzdgz/czzj/ (铜陵 style) 
    `${base}/xjwz/zwgk/zfxxgkzdgz/czzj/`,
    // Pattern 2: /zwgk/czzj/
    `${base}/zwgk/czzj/`,
    // Pattern 3: /zwgk/zfxxgkzdgz/czzj/
    `${base}/zwgk/zfxxgkzdgz/czzj/`,
    // Pattern 4: /zwgk/zdlyxxgk/czzj/
    `${base}/zwgk/zdlyxxgk/czzj/`,
    // Pattern 5: /zwgk/ztzl/czzj/
    `${base}/zwgk/ztzl/czzj/`,
    // Pattern 6: /openness/public/ (some Anhui pattern)
    `${base}/openness/public/`,
    // Pattern 7: /zwzt/czzjzt/ (芜湖 style)
    `${base}/zwzt/czzjzt/`,
    // Pattern 8: /xxgk/zdxxgk/czzj/
    `${base}/xxgk/zdxxgk/czzj/`,
    // Pattern 9: /zwgk/ztzl/bmyjsgkpt/
    `${base}/zwgk/ztzl/bmyjsgkpt/`,
    // Pattern 10: /zwgk/czzj/index.html
    `${base}/zwgk/czzj/index.html`,
    // Pattern 11: /zwgk/site/tpl/ (合肥 merged platform style)
    `${base}/zwgk/site/tpl/1541`,
  ];
}

function probe(url, timeout = 8000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ url, status: 'timeout' }), timeout);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      rejectUnauthorized: false,
      timeout: timeout
    }, (res) => {
      let body = '';
      res.on('data', d => { body += d; if (body.length > 20000) res.destroy(); });
      res.on('end', () => {
        clearTimeout(timer);
        // Check if redirected to homepage
        const finalUrl = res.headers.location || url;
        const isRedirect = res.statusCode >= 300 && res.statusCode < 400;
        resolve({ url, status: res.statusCode, redirect: isRedirect ? finalUrl : null, bodyLen: body.length, 
          hasFiscal: /预[决算]|决算|财政资金|预算公开|czzj/.test(body),
          title: (body.match(/<title[^>]*>(.*?)<\/title>/i) || [])[1]?.trim().slice(0, 80) || ''
        });
      });
      res.on('error', () => { clearTimeout(timer); resolve({ url, status: 'error' }); });
    });
    req.on('error', () => { clearTimeout(timer); resolve({ url, status: 'error' }); });
    req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve({ url, status: 'timeout' }); });
  });
}

async function probeCounty(county) {
  const patterns = getPatterns(county.gov);
  const results = [];
  // Probe 4 at a time
  for (let i = 0; i < patterns.length; i += 4) {
    const batch = patterns.slice(i, i + 4);
    const batchResults = await Promise.all(batch.map(u => probe(u)));
    results.push(...batchResults);
  }
  
  const hits = results.filter(r => r.status === 200 && r.bodyLen > 500 && !r.redirect);
  const fiscalHits = hits.filter(r => r.hasFiscal);
  
  return {
    city: county.city,
    name: county.name,
    gov: county.gov,
    hits: hits.map(h => ({ url: h.url, title: h.title, hasFiscal: h.hasFiscal, bodyLen: h.bodyLen })),
    fiscalHits: fiscalHits.map(h => ({ url: h.url, title: h.title, bodyLen: h.bodyLen })),
    allResults: results.map(r => `${r.status}:${r.url.split(county.gov.replace(/https?:\/\/[^/]+/, ''))[1] || r.url}`),
  };
}

async function main() {
  console.log(`Probing ${counties.length} counties...`);
  const allResults = [];
  
  // Process 8 counties at a time
  for (let i = 0; i < counties.length; i += 8) {
    const batch = counties.slice(i, i + 8);
    console.log(`Batch ${Math.floor(i/8)+1}: ${batch.map(c => c.name).join(', ')}`);
    const results = await Promise.all(batch.map(c => probeCounty(c)));
    allResults.push(...results);
  }
  
  // Summary
  const confirmed = allResults.filter(r => r.fiscalHits.length > 0);
  const hitsOnly = allResults.filter(r => r.hits.length > 0 && r.fiscalHits.length === 0);
  const noHits = allResults.filter(r => r.hits.length === 0);
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Total: ${allResults.length}, Fiscal confirmed: ${confirmed.length}, Hits (no fiscal keyword): ${hitsOnly.length}, No hits: ${noHits.length}\n`);
  
  if (confirmed.length > 0) {
    console.log(`\n--- FISCAL CONFIRMED (${confirmed.length}) ---`);
    for (const r of confirmed) {
      console.log(`${r.city} ${r.name}:`);
      for (const h of r.fiscalHits) {
        console.log(`  ★ ${h.url}`);
        console.log(`    title: ${h.title}, bodyLen: ${h.bodyLen}`);
      }
    }
  }
  
  if (hitsOnly.length > 0) {
    console.log(`\n--- HITS BUT NO FISCAL KEYWORD (${hitsOnly.length}) ---`);
    for (const r of hitsOnly) {
      console.log(`${r.city} ${r.name}:`);
      for (const h of r.hits) {
        console.log(`  ? ${h.url} (title: ${h.title}, fiscal: ${h.hasFiscal})`);
      }
    }
  }
  
  if (noHits.length > 0) {
    console.log(`\n--- NO HITS (${noHits.length}) ---`);
    for (const r of noHits) {
      const statuses = r.allResults.join(' | ');
      console.log(`${r.city} ${r.name}: ${statuses}`);
    }
  }
}

main();
