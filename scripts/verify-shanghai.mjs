// Verify all newly-added Shanghai district URLs
const checks = [
  { name: "黄浦区", url: "https://www.shhuangpu.gov.cn/" },
  { name: "长宁区", url: "https://www.shcn.gov.cn/" },
  { name: "静安区", url: "https://www.jingan.gov.cn/" },
  { name: "虹口区", url: "https://www.shhk.gov.cn/" },
  { name: "杨浦区", url: "https://www.shyp.gov.cn/" },
  { name: "闵行区", url: "https://www.shmh.gov.cn/" },
  { name: "宝山区", url: "https://www.shbsq.gov.cn/" },
  { name: "金山区", url: "https://www.jinshan.gov.cn/" },
  { name: "青浦区", url: "https://www.shqp.gov.cn/" },
  { name: "奉贤区", url: "https://www.fengxian.gov.cn/" },
];

async function tryUrl(name, url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 10000);
  try {
    const r = await fetch(url, { method: 'GET', signal: c.signal, redirect: 'follow' });
    clearTimeout(t);
    const text = await r.text();
    const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim().substring(0, 60) || '(no title)';
    console.log(`  ${r.status < 400 ? '✓' : '✗'} ${name}: ${url} → ${r.status} | ${title}`);
    return r.status < 400;
  } catch (e) {
    clearTimeout(t);
    // Try http
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), 10000);
    const httpUrl = url.replace('https:', 'http:');
    try {
      const r2 = await fetch(httpUrl, { method: 'GET', signal: c2.signal, redirect: 'follow' });
      clearTimeout(t2);
      const text = await r2.text();
      const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim().substring(0, 60) || '(no title)';
      console.log(`  ⚠ ${name}: HTTPS failed, HTTP works: ${httpUrl} → ${r2.status} | ${title}`);
      return 'http';
    } catch (e2) {
      clearTimeout(t2);
      console.log(`  ✗ ${name}: ${url} → ERR ${e.cause?.code || e.message?.substring(0, 40)}`);
      return false;
    }
  }
}

for (const { name, url } of checks) {
  await tryUrl(name, url);
}
