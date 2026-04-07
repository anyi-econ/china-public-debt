/**
 * Batch verify a sample of newly-added gov website URLs
 * Uses HTTP HEAD requests to check if URLs are reachable
 */

const urls = [
  // Tianjin districts
  { name: "天津-东丽区", url: "https://www.tjdl.gov.cn/" },
  { name: "天津-武清区", url: "https://www.tjwq.gov.cn/" },
  { name: "天津-静海区", url: "https://www.tjjh.gov.cn/" },
  { name: "天津-蓟州区", url: "https://www.tjjz.gov.cn/" },
  // Shanghai districts
  { name: "上海-嘉定区", url: "https://www.jiading.gov.cn/" },
  { name: "上海-松江区", url: "https://www.songjiang.gov.cn/" },
  { name: "上海-崇明区", url: "https://www.cmx.gov.cn/" },
  // Chongqing
  { name: "重庆-渝中区", url: "https://www.cqyz.gov.cn/" },
  { name: "重庆-北碚区", url: "https://www.beibei.gov.cn/" },
  { name: "重庆-璧山区", url: "https://www.bishan.gov.cn/" },
  // Provincial capitals
  { name: "南京市", url: "https://www.nanjing.gov.cn/" },
  { name: "杭州市", url: "https://www.hangzhou.gov.cn/" },
  { name: "武汉市", url: "https://www.wuhan.gov.cn/" },
  { name: "长沙-株洲市", url: "https://www.zhuzhou.gov.cn/" },
  { name: "兰州市", url: "https://www.lanzhou.gov.cn/" },
  { name: "西宁市", url: "https://www.xining.gov.cn/" },
  // Inner Mongolia
  { name: "呼和浩特市", url: "https://www.huhhot.gov.cn/" },
  { name: "鄂尔多斯市", url: "https://www.ordos.gov.cn/" },
  // Western
  { name: "拉萨市", url: "https://www.lasa.gov.cn/" },
  { name: "昆明市", url: "https://www.km.gov.cn/" },
  // Hainan
  { name: "儋州市", url: "https://www.danzhou.gov.cn/" },
  { name: "琼海市", url: "https://www.qionghai.gov.cn/" },
  // Others
  { name: "大连市", url: "https://www.dl.gov.cn/" },
  { name: "苏州市", url: "https://www.suzhou.gov.cn/" },
  { name: "厦门市", url: "https://www.xm.gov.cn/" },
  // Bingtuan
  { name: "新疆生产建设兵团", url: "http://www.xjbt.gov.cn/" },
];

async function checkUrl(name, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return { name, url, status: res.status, ok: res.status < 400 };
  } catch (e) {
    clearTimeout(timeout);
    // Try GET if HEAD fails
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: controller2.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout2);
      return { name, url, status: res.status, ok: res.status < 400 };
    } catch (e2) {
      clearTimeout(timeout2);
      return { name, url, status: 'ERR', ok: false, error: e2.message?.substring(0, 60) };
    }
  }
}

async function main() {
  console.log(`Checking ${urls.length} URLs...\n`);
  
  // Check in batches of 5
  const results = [];
  for (let i = 0; i < urls.length; i += 5) {
    const batch = urls.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(u => checkUrl(u.name, u.url))
    );
    results.push(...batchResults);
  }
  
  const ok = results.filter(r => r.ok);
  const fail = results.filter(r => !r.ok);
  
  console.log(`\n=== Results: ${ok.length}/${results.length} OK ===\n`);
  
  for (const r of ok) {
    console.log(`  ✓ ${r.name} (${r.status})`);
  }
  
  if (fail.length) {
    console.log(`\n=== Failed: ${fail.length} ===\n`);
    for (const r of fail) {
      console.log(`  ✗ ${r.name}: ${r.url} → ${r.status} ${r.error || ''}`);
    }
  }
}

main();
