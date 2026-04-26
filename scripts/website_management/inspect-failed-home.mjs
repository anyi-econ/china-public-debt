// Inspect homepage anchors - dump all candidate-looking text/href
const url = process.argv[2];
const NEWS_HINT = /要闻|新闻|动态|资讯|公告|时政|头条|今日|政务|工作/;
const REJECT = /部门动态|部门信息|单位动态|上级要闻|中央要闻|国务院要闻|省委要闻|省政府要闻|全国要闻|国内要闻|国内新闻|国际要闻|国际新闻|域外新闻|域外要闻|外地新闻|外埠新闻|双语新闻|英文新闻|通知公告|公示公告|政府公告|媒体看|媒体聚焦|视频新闻|图说|影像|专题|乡镇要闻|镇街动态|街道动态|图片新闻|宣传片|访谈|直播/;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function tryFetch(u) {
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9' }, redirect: 'follow' });
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    let html = new TextDecoder('utf-8').decode(buf);
    const enc = (html.match(/charset=["']?([\w-]+)/i) || [])[1];
    if (enc && /gb/i.test(enc)) html = new TextDecoder('gbk').decode(new Uint8Array(buf));
    return html;
  } catch (e) { return null; }
}

const html = await tryFetch(url);
if (!html) { console.log('FAIL'); process.exit(0); }
console.log('html length:', html.length);
const re = /<a\b[^>]*?href\s*=\s*["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi;
const seen = new Set();
const hits = [];
for (const m of html.matchAll(re)) {
  const text = m[2].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, '').trim();
  if (text.length < 2 || text.length > 25) continue;
  if (!NEWS_HINT.test(text)) continue;
  if (REJECT.test(text)) continue;
  const href = m[1];
  if (/^javascript:|^#|^mailto:|^tel:/i.test(href)) continue;
  const key = text + '|' + href;
  if (seen.has(key)) continue;
  seen.add(key);
  hits.push({ text, href });
}
for (const h of hits.slice(0, 30)) console.log(' ', h.text, '->', h.href.slice(0, 90));
