// Fast batch check: fetch each confirmed district homepage and look for budget links
// Uses fetch_webpage approach - just resolve the gov website domains for each district
import https from 'https';
import http from 'http';

// Districts with confirmed homepage domains (from previous check)
// For each, try to find the budget page by testing common patterns
const districts = {
  "天津市": [
    { name: "和平区", homepage: "https://www.tjhp.gov.cn" },
    { name: "河东区", homepage: "https://www.tjhd.gov.cn" },  
    { name: "河西区", homepage: "https://www.tjhx.gov.cn" },
    { name: "南开区", homepage: "https://www.tjnk.gov.cn", confirmed: "https://www.tjnk.gov.cn/NKQZF/ZWGK5712/zfxxgkqzf/hz1/fdzdgknr1/czyjs1/" },
    { name: "河北区", homepage: "https://www.tjhbq.gov.cn" },
    { name: "红桥区", homepage: "https://www.tjhqq.gov.cn" },
    { name: "东丽区", homepage: "https://www.tjdl.gov.cn" },
    { name: "西青区", homepage: "https://www.xiqing.gov.cn" },
    { name: "津南区", homepage: "https://www.tjjn.gov.cn" },
    { name: "北辰区", homepage: "https://www.tjbc.gov.cn" },
    { name: "武清区", homepage: "https://www.tjwq.gov.cn" },
    { name: "宝坻区", homepage: "https://www.tjbd.gov.cn" },
    { name: "滨海新区", homepage: "https://www.tjbh.gov.cn" },
    { name: "宁河区", homepage: "https://www.tjnh.gov.cn" },
    { name: "静海区", homepage: "https://www.tjjh.gov.cn" },
    { name: "蓟州区", homepage: "https://www.ji.tj.gov.cn" },
  ],
  "上海市": [
    { name: "黄浦区", homepage: "https://www.shhuangpu.gov.cn" },
    { name: "徐汇区", homepage: "https://www.xuhui.gov.cn" },
    { name: "长宁区", homepage: "https://www.changning.sh.gov.cn" },
    { name: "静安区", homepage: "https://www.jingan.gov.cn" },
    { name: "普陀区", homepage: "https://www.putuo.sh.gov.cn" },
    { name: "虹口区", homepage: "https://www.shhk.gov.cn" },
    { name: "杨浦区", homepage: "https://www.shyp.gov.cn" },
    { name: "闵行区", homepage: "https://www.shmh.gov.cn" },
    { name: "宝山区", homepage: "https://www.shbsq.gov.cn" },
    { name: "嘉定区", homepage: "https://www.jiading.gov.cn" },
    { name: "浦东新区", homepage: "https://www.pudong.gov.cn" },
    { name: "金山区", homepage: "https://www.jinshan.gov.cn" },
    { name: "松江区", homepage: "https://www.songjiang.gov.cn" },
    { name: "青浦区", homepage: "https://www.shqp.gov.cn" },
    { name: "奉贤区", homepage: "https://www.fengxian.gov.cn" },
    { name: "崇明区", homepage: "https://www.cmx.gov.cn" },
  ],
  "重庆市": [
    { name: "万州区", homepage: "https://www.wz.cq.gov.cn" },
    { name: "涪陵区", homepage: "https://www.fl.cq.gov.cn" },
    { name: "渝中区", homepage: "https://www.yuzhong.gov.cn" },
    { name: "大渡口区", homepage: "https://www.ddk.cq.gov.cn" },
    { name: "江北区", homepage: "https://www.jiangbei.gov.cn" },
    { name: "沙坪坝区", homepage: "https://www.shapingba.gov.cn" },
    { name: "九龙坡区", homepage: "https://www.jiulongpo.gov.cn" },
    { name: "南岸区", homepage: "https://www.cqna.gov.cn" },
    { name: "北碚区", homepage: "https://www.beibei.gov.cn" },
    { name: "綦江区", homepage: "https://www.cqqj.gov.cn" },
    { name: "大足区", homepage: "https://www.dazu.gov.cn" },
    { name: "渝北区", homepage: "https://www.ybq.gov.cn" },
    { name: "巴南区", homepage: "https://www.banan.gov.cn" },
    { name: "黔江区", homepage: "https://www.qianjiang.gov.cn" },
    { name: "长寿区", homepage: "https://www.cqcs.gov.cn" },
    { name: "江津区", homepage: "https://www.jiangjin.gov.cn" },
    { name: "合川区", homepage: "https://www.hc.gov.cn" },
    { name: "永川区", homepage: "https://www.yongchuan.gov.cn" },
    { name: "南川区", homepage: "https://www.cqnc.gov.cn" },
    { name: "璧山区", homepage: "https://www.bishan.gov.cn" },
    { name: "铜梁区", homepage: "https://www.tongliangqu.gov.cn" },
    { name: "潼南区", homepage: "https://www.tn.cq.gov.cn" },
    { name: "荣昌区", homepage: "https://www.rongchang.gov.cn" },
    { name: "开州区", homepage: "https://www.kz.cq.gov.cn" },
    { name: "梁平区", homepage: "https://www.cqlp.gov.cn" },
    { name: "武隆区", homepage: "https://www.cqwl.gov.cn" },
    { name: "城口县", homepage: "https://www.ck.cq.gov.cn" },
    { name: "丰都县", homepage: "https://www.fd.cq.gov.cn" },
    { name: "垫江县", homepage: "https://www.dj.cq.gov.cn" },
    { name: "忠县", homepage: "https://www.zx.cq.gov.cn" },
    { name: "云阳县", homepage: "https://www.yunyang.gov.cn" },
    { name: "奉节县", homepage: "https://www.fj.cq.gov.cn" },
    { name: "巫山县", homepage: "https://www.cqwushan.gov.cn" },
    { name: "巫溪县", homepage: "https://www.cqwuxi.gov.cn" },
    { name: "石柱土家族自治县", homepage: "https://www.sp.cq.gov.cn" },
    { name: "秀山土家族苗族自治县", homepage: "https://www.cqxs.gov.cn" },
    { name: "酉阳土家族苗族自治县", homepage: "https://www.youyang.gov.cn" },
    { name: "彭水苗族土家族自治县", homepage: "https://www.cqps.gov.cn" },
  ]
};

function checkUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    try {
      const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          resolve({ url, status: res.statusCode, redirect: res.headers.location });
        } else {
          resolve({ url, status: res.statusCode });
        }
        res.destroy();
      });
      req.on('error', () => resolve({ url, status: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0 }); });
    } catch { resolve({ url, status: 0 }); }
  });
}

async function main() {
  const results = {};
  
  for (const [city, districtList] of Object.entries(districts)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`${city}`);
    console.log('='.repeat(50));
    results[city] = [];
    
    // Process 4 at a time
    for (let i = 0; i < districtList.length; i += 4) {
      const batch = districtList.slice(i, i + 4);
      const batchResults = await Promise.all(batch.map(async (d) => {
        if (d.confirmed) {
          return { ...d, bestUrl: d.confirmed, method: "confirmed" };
        }
        
        // Test homepage first
        const hp = d.homepage;
        const hpResult = await checkUrl(hp + "/", 5000);
        
        if (hpResult.status === 200 || (hpResult.status >= 300 && hpResult.status < 400)) {
          // Homepage works, record it
          return { ...d, bestUrl: hp + "/", method: "homepage", status: hpResult.status };
        }
        
        // Try http if https failed
        const httpHp = hp.replace('https://', 'http://');
        const httpResult = await checkUrl(httpHp + "/", 5000);
        if (httpResult.status === 200 || (httpResult.status >= 300 && httpResult.status < 400)) {
          return { ...d, bestUrl: httpHp + "/", method: "homepage-http", status: httpResult.status };
        }
        
        return { ...d, bestUrl: null, method: "failed" };
      }));
      
      for (const r of batchResults) {
        if (r.bestUrl) {
          console.log(`✅ ${r.name}: ${r.bestUrl} (${r.method})`);
          results[city].push({ name: r.name, url: r.bestUrl });
        } else {
          console.log(`❌ ${r.name}: no reachable URL`);
          results[city].push({ name: r.name, url: null });
        }
      }
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log("SUMMARY");
  console.log('='.repeat(50));
  for (const [city, list] of Object.entries(results)) {
    const found = list.filter(r => r.url).length;
    console.log(`${city}: ${found}/${list.length} domains found`);
  }
}

main().catch(console.error);
