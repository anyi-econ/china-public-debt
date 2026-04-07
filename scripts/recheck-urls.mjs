// Re-check failed URLs with http:// and alternative domains
const checks = [
  { name: "天津-静海区", urls: ["http://www.tjjh.gov.cn/", "https://www.tjjh.gov.cn/"] },
  { name: "上海-嘉定区", urls: ["http://www.jiading.gov.cn/", "https://www.shjd.gov.cn/", "http://www.shjd.gov.cn/"] },
  { name: "上海-崇明区", urls: ["http://www.cmx.gov.cn/", "https://www.shcm.gov.cn/", "http://www.shcm.gov.cn/"] },
  { name: "呼和浩特市", urls: ["http://www.huhhot.gov.cn/", "https://www.huhhot.gov.cn/"] },
  { name: "琼海市", urls: ["http://www.qionghai.gov.cn/", "https://qionghai.hainan.gov.cn/"] },
];

async function tryUrl(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 10000);
  try {
    const r = await fetch(url, { method: 'GET', signal: c.signal, redirect: 'follow' });
    clearTimeout(t);
    const text = await r.text();
    const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '(no title)';
    return { url, status: r.status, title: title.trim().substring(0, 60), ok: r.status < 400 };
  } catch (e) {
    clearTimeout(t);
    return { url, status: 'ERR', ok: false, error: e.cause?.code || e.message?.substring(0, 40) };
  }
}

for (const { name, urls } of checks) {
  console.log(`\n${name}:`);
  for (const url of urls) {
    const r = await tryUrl(url);
    const mark = r.ok ? '✓' : '✗';
    console.log(`  ${mark} ${url} → ${r.status} ${r.title || r.error || ''}`);
  }
}
