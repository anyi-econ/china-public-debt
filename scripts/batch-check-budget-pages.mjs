// Quick batch test: try known budget path patterns on confirmed district domains
import https from 'https';
import http from 'http';

function checkUrl(url, timeout = 6000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    try {
      const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        resolve({ url, status: res.statusCode, location: res.headers.location });
        res.destroy();
      });
      req.on('error', () => resolve({ url, status: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 0 }); });
    } catch { resolve({ url, status: 0 }); }
  });
}

// Tianjin districts with budget path candidates
const tianjinTests = [
  // 和平区 pattern: /zw/zfxxgk/fdzdgknr/ (has czyjs subcategory)
  { name: "和平区", urls: ["https://www.tjhp.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "河东区", urls: ["https://www.tjhd.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjhd.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "河西区", urls: ["https://www.tjhx.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjhx.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  // 南开区 already confirmed
  { name: "东丽区", urls: ["https://www.tjdl.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjdl.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "津南区", urls: ["https://www.tjjn.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjjn.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "北辰区", urls: ["https://www.tjbc.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjbc.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "武清区", urls: ["https://www.tjwq.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjwq.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "宝坻区", urls: ["https://www.tjbd.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjbd.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "滨海新区", urls: ["https://www.tjbh.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjbh.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "宁河区", urls: ["https://www.tjnh.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "https://www.tjnh.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
  { name: "静海区", urls: ["http://www.tjjh.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/", "http://www.tjjh.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/"] },
];

// Shanghai districts budget path candidates
const shanghaiTests = [
  { name: "徐汇区", urls: ["https://www.xuhui.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.xuhui.gov.cn/xxgk/portal/article/list?menuType=wgk&code=jcgk_czyjsgk"] },
  { name: "静安区", urls: ["https://www.jingan.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.jingan.gov.cn/zwgk/czxx/"] },
  { name: "虹口区", urls: ["https://www.shhk.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.shhk.gov.cn/zwgk/czxx/"] },
  { name: "杨浦区", urls: ["https://www.shyp.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.shyp.gov.cn/zwgk/czxx/"] },
  { name: "宝山区", urls: ["https://www.shbsq.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.shbsq.gov.cn/zwgk/czxx/"] },
  { name: "嘉定区", urls: ["https://www.jiading.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.jiading.gov.cn/zwgk/czxx/"] },
  { name: "浦东新区", urls: ["http://www.pudong.gov.cn/zwgk/zfxxgk/fd/czyjs/", "http://www.pudong.gov.cn/zwgk/czxx/"] },
  { name: "金山区", urls: ["https://www.jinshan.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.jinshan.gov.cn/zwgk/czxx/"] },
  { name: "松江区", urls: ["https://www.songjiang.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.songjiang.gov.cn/zwgk/czxx/"] },
  { name: "青浦区", urls: ["https://www.shqp.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.shqp.gov.cn/zwgk/czxx/"] },
  { name: "奉贤区", urls: ["https://www.fengxian.gov.cn/zwgk/zfxxgk/fd/czyjs/", "https://www.fengxian.gov.cn/zwgk/czxx/"] },
];

async function testGroup(groupName, tests) {
  console.log(`\n${groupName}`);
  console.log('='.repeat(50));
  const results = [];
  
  for (const { name, urls } of tests) {
    let found = null;
    for (const url of urls) {
      const r = await checkUrl(url);
      if (r.status === 200) {
        found = url;
        break;
      }
      // Follow one redirect
      if ([301, 302].includes(r.status) && r.location) {
        found = r.location.startsWith('http') ? r.location : new URL(r.location, url).href;
        break;
      }
    }
    if (found) {
      console.log(`✅ ${name}: ${found}`);
      results.push({ name, url: found });
    } else {
      console.log(`❌ ${name}: no budget page found`);
    }
  }
  return results;
}

async function main() {
  const tj = await testGroup("天津市", tianjinTests);
  const sh = await testGroup("上海市", shanghaiTests);
  
  console.log(`\nSUMMARY: TJ ${tj.length}/${tianjinTests.length}, SH ${sh.length}/${shanghaiTests.length}`);
}

main().catch(console.error);
