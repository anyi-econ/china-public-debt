const url = process.argv[2];
const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
let html = await r.text();
// Try to detect encoding
const enc = (html.match(/charset=["']?([\w-]+)/i) || [])[1];
if (enc && /gb/i.test(enc)) {
  const buf = await (await fetch(url, { signal: AbortSignal.timeout(12000) })).arrayBuffer();
  html = new TextDecoder('gbk').decode(new Uint8Array(buf));
}
console.log('html length:', html.length);
const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{1,60})<\/a>/g;
let m;
const seen = new Set();
const hits = [];
while ((m = re.exec(html))) {
  const text = m[2].replace(/\s+/g, '').trim();
  if (text.length < 2 || text.length > 30) continue;
  if (!/要闻|新闻|动态|资讯|公告|通知|时政|头条/.test(text)) continue;
  const key = text + '|' + m[1];
  if (seen.has(key)) continue;
  seen.add(key);
  hits.push({ text, href: m[1] });
}
for (const h of hits.slice(0, 60)) console.log(h.text, '->', h.href.slice(0, 100));
