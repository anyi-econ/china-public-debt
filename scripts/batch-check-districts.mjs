// Batch check candidate fiscal budget URLs for Tianjin, Shanghai, Chongqing districts
// Uses HEAD/GET requests to find working budget disclosure pages
import https from 'https';
import http from 'http';

// Tianjin districts with candidate gov domains
const tianjinDistricts = [
  { name: "和平区", domains: ["www.tjhp.gov.cn", "hp.tj.gov.cn"] },
  { name: "河东区", domains: ["www.tjhd.gov.cn", "hd.tj.gov.cn"] },
  { name: "河西区", domains: ["www.tjhx.gov.cn", "hx.tj.gov.cn"] },
  { name: "南开区", domains: ["www.tjnk.gov.cn", "nk.tj.gov.cn"] },
  { name: "河北区", domains: ["www.tjhb.gov.cn", "hb.tj.gov.cn"] },
  { name: "红桥区", domains: ["www.tjhq.gov.cn", "hq.tj.gov.cn"] },
  { name: "东丽区", domains: ["www.tjdl.gov.cn", "dl.tj.gov.cn"] },
  { name: "西青区", domains: ["www.xiqing.gov.cn", "xq.tj.gov.cn"] },
  { name: "津南区", domains: ["www.tjjn.gov.cn", "jn.tj.gov.cn"] },
  { name: "北辰区", domains: ["www.tjbc.gov.cn", "bc.tj.gov.cn"] },
  { name: "武清区", domains: ["www.tjwq.gov.cn", "wq.tj.gov.cn"] },
  { name: "宝坻区", domains: ["www.tjbd.gov.cn", "bd.tj.gov.cn"] },
  { name: "滨海新区", domains: ["www.tjbh.gov.cn", "bhxq.tj.gov.cn", "www.bh.gov.cn"] },
  { name: "宁河区", domains: ["www.tjnh.gov.cn", "nh.tj.gov.cn"] },
  { name: "静海区", domains: ["www.tjjh.gov.cn", "jh.tj.gov.cn"] },
  { name: "蓟州区", domains: ["www.tjjz.gov.cn", "jz.tj.gov.cn", "www.ji.tj.gov.cn"] },
];

// Shanghai districts with candidate gov domains
const shanghaiDistricts = [
  { name: "黄浦区", domains: ["www.huangpuqu.sh.gov.cn", "hpq.sh.gov.cn"] },
  { name: "徐汇区", domains: ["www.xuhui.gov.cn", "xh.sh.gov.cn"] },
  { name: "长宁区", domains: ["www.changning.sh.gov.cn", "cn.sh.gov.cn"] },
  { name: "静安区", domains: ["www.jingan.gov.cn", "ja.sh.gov.cn"] },
  { name: "普陀区", domains: ["www.putuo.sh.gov.cn", "pt.sh.gov.cn"] },
  { name: "虹口区", domains: ["www.hongkou.gov.cn", "hk.sh.gov.cn"] },
  { name: "杨浦区", domains: ["www.shyp.gov.cn", "yp.sh.gov.cn"] },
  { name: "闵行区", domains: ["www.shmh.gov.cn", "mhq.sh.gov.cn"] },
  { name: "宝山区", domains: ["www.shbsq.gov.cn", "bsq.sh.gov.cn"] },
  { name: "嘉定区", domains: ["www.jiading.gov.cn", "jdq.sh.gov.cn"] },
  { name: "浦东新区", domains: ["www.pudong.gov.cn", "pudong.sh.gov.cn"] },
  { name: "金山区", domains: ["www.jinshan.gov.cn", "jsq.sh.gov.cn"] },
  { name: "松江区", domains: ["www.songjiang.gov.cn", "songjiang.sh.gov.cn"] },
  { name: "青浦区", domains: ["www.shqp.gov.cn", "qp.sh.gov.cn"] },
  { name: "奉贤区", domains: ["www.fengxian.gov.cn", "fengxian.sh.gov.cn"] },
  { name: "崇明区", domains: ["www.cmx.gov.cn", "cm.sh.gov.cn"] },
];

// Chongqing districts (use {pinyin}.cq.gov.cn pattern)
const chongqingDistricts = [
  { name: "万州区", domains: ["www.wz.gov.cn", "wz.cq.gov.cn"] },
  { name: "涪陵区", domains: ["www.fl.gov.cn", "fl.cq.gov.cn"] },
  { name: "渝中区", domains: ["www.yuzhong.gov.cn", "yz.cq.gov.cn"] },
  { name: "大渡口区", domains: ["www.ddk.gov.cn", "ddk.cq.gov.cn"] },
  { name: "江北区", domains: ["www.jiangbei.gov.cn", "jb.cq.gov.cn"] },
  { name: "沙坪坝区", domains: ["www.shapingba.gov.cn", "spb.cq.gov.cn"] },
  { name: "九龙坡区", domains: ["www.jiulongpo.gov.cn", "jlp.cq.gov.cn"] },
  { name: "南岸区", domains: ["www.cqna.gov.cn", "na.cq.gov.cn"] },
  { name: "北碚区", domains: ["www.beibei.gov.cn", "bb.cq.gov.cn"] },
  { name: "綦江区", domains: ["www.qj.gov.cn", "qj.cq.gov.cn"] },
  { name: "大足区", domains: ["www.dazu.gov.cn", "dz.cq.gov.cn"] },
  { name: "渝北区", domains: ["www.ybq.gov.cn", "yb.cq.gov.cn"] },
  { name: "巴南区", domains: ["www.banan.gov.cn", "bn.cq.gov.cn"] },
  { name: "黔江区", domains: ["www.qianjiang.gov.cn", "qianjiang.cq.gov.cn"] },
  { name: "长寿区", domains: ["www.cqcs.gov.cn", "cs.cq.gov.cn"] },
  { name: "江津区", domains: ["www.jiangjin.gov.cn", "jj.cq.gov.cn"] },
  { name: "合川区", domains: ["www.hc.gov.cn", "hc.cq.gov.cn"] },
  { name: "永川区", domains: ["www.yongchuan.gov.cn", "yc.cq.gov.cn"] },
  { name: "南川区", domains: ["www.cqnc.gov.cn", "nc.cq.gov.cn"] },
  { name: "璧山区", domains: ["www.bishan.gov.cn", "bs.cq.gov.cn"] },
  { name: "铜梁区", domains: ["www.tongliang.gov.cn", "tl.cq.gov.cn"] },
  { name: "潼南区", domains: ["www.tongnan.gov.cn", "tn.cq.gov.cn"] },
  { name: "荣昌区", domains: ["www.rongchang.gov.cn", "rc.cq.gov.cn"] },
  { name: "开州区", domains: ["www.kz.gov.cn", "kz.cq.gov.cn"] },
  { name: "梁平区", domains: ["www.cqlp.gov.cn", "lp.cq.gov.cn"] },
  { name: "武隆区", domains: ["www.wulong.gov.cn", "wl.cq.gov.cn"] },
  { name: "城口县", domains: ["www.cqck.gov.cn", "ck.cq.gov.cn"] },
  { name: "丰都县", domains: ["www.fd.gov.cn", "fd.cq.gov.cn"] },
  { name: "垫江县", domains: ["www.dj.gov.cn", "dj.cq.gov.cn"] },
  { name: "忠县", domains: ["www.zx.gov.cn", "zx.cq.gov.cn"] },
  { name: "云阳县", domains: ["www.yunyang.gov.cn", "yy.cq.gov.cn"] },
  { name: "奉节县", domains: ["www.fj.gov.cn", "fj.cq.gov.cn"] },
  { name: "巫山县", domains: ["www.cqwushan.gov.cn", "ws.cq.gov.cn"] },
  { name: "巫溪县", domains: ["www.wuxi.gov.cn", "wx.cq.gov.cn"] },
  { name: "石柱土家族自治县", domains: ["www.shizhu.gov.cn", "sz.cq.gov.cn"] },
  { name: "秀山土家族苗族自治县", domains: ["www.xiushan.gov.cn", "xs.cq.gov.cn"] },
  { name: "酉阳土家族苗族自治县", domains: ["www.youyang.gov.cn", "yy2.cq.gov.cn"] },
  { name: "彭水苗族土家族自治县", domains: ["www.pengshui.gov.cn", "ps.cq.gov.cn"] },
];

// Budget page path suffixes to try
const budgetPaths = [
  "/zwgk/czyjs/",
  "/zwgk/czxx/",
  "/zwgk/czxx/czyjs/",
  "/zfxxgk/fdzdgknr/czyjs/",
  "/zfxxgk/czys/",
  "/zwgk/czsj/",
];

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        resolve({ url, status: res.statusCode, redirect: res.headers.location });
      } else {
        resolve({ url, status: res.statusCode });
      }
      res.destroy();
    });
    req.on('error', () => resolve({ url, status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0 }); });
  });
}

async function findBudgetUrl(name, domains) {
  const candidates = [];
  for (const domain of domains) {
    // Try homepage first (to discover the correct domain)
    candidates.push(`https://${domain}/`);
    candidates.push(`http://${domain}/`);
    // Try budget paths
    for (const path of budgetPaths) {
      candidates.push(`https://${domain}${path}`);
      candidates.push(`http://${domain}${path}`);
    }
  }
  
  const results = [];
  // Check in batches of 4
  for (let i = 0; i < candidates.length; i += 4) {
    const batch = candidates.slice(i, i + 4);
    const batchResults = await Promise.all(batch.map(checkUrl));
    for (const r of batchResults) {
      if (r.status === 200) {
        results.push(r);
      } else if (r.redirect) {
        results.push(r);
      }
    }
  }
  return results;
}

async function main() {
  const allGroups = [
    { city: "天津市", districts: tianjinDistricts },
    { city: "上海市", districts: shanghaiDistricts },
    { city: "重庆市", districts: chongqingDistricts },
  ];

  for (const { city, districts } of allGroups) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${city} (${districts.length} districts)`);
    console.log('='.repeat(60));
    
    for (const { name, domains } of districts) {
      const results = await findBudgetUrl(name, domains);
      if (results.length > 0) {
        const ok200 = results.filter(r => r.status === 200);
        const budgetHits = ok200.filter(r => !r.url.endsWith('/'));
        if (budgetHits.length > 0) {
          console.log(`✅ ${name}: ${budgetHits[0].url}`);
        } else if (ok200.length > 0) {
          // Only homepage worked - report domain for manual check
          const homepageUrl = ok200.find(r => r.url.endsWith('/'));
          console.log(`🏠 ${name}: homepage OK → ${homepageUrl?.url || ok200[0].url}`);
        } else {
          // Only redirects
          console.log(`↪️  ${name}: redirect → ${results[0].redirect || results[0].url}`);
        }
      } else {
        console.log(`❌ ${name}: no reachable URL`);
      }
    }
  }
}

main().catch(console.error);
