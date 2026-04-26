const fs = require('fs');
const TIER_A = /本地要闻|本市要闻|本县要闻|本区要闻|要闻速递|今日要闻|政务要闻|时政要闻|头版头条|^.{2,3}(要闻|新闻|动态|资讯)$|^今日.{2,3}$/;
const TIER_B = /政务动态|工作动态|政府要闻|综合要闻|综合新闻|政务新闻|政府新闻/;
const TIER_C = /新闻中心|新闻动态|要闻|新闻/;
const REJECT_TEXT = /部门动态|部门信息|单位动态|上级要闻|中央要闻|国务院要闻|省委要闻|省政府要闻|全国要闻|国内要闻|国内新闻|国际要闻|国际新闻|国内资讯|国际资讯|域外新闻|域外要闻|外地新闻|外埠新闻|双语新闻|英文新闻|要闻转载|新闻转载|区县动态|县区动态|县市区动态|区县新闻|区县要闻|招商资讯|省内资讯|州内资讯|县内资讯|系统动态|网站动态|公告动态|今日(立春|雨水|惊蛰|春分|清明|谷雨|立夏|小满|芒种|夏至|小暑|大暑|立秋|处暑|白露|秋分|寒露|霜降|立冬|小雪|大雪|冬至|小寒|大寒|头条|关注|聚焦|看点|话题|视点)|通知公告|公示公告|政府公告|媒体看|媒体聚焦|视频新闻|图说|影像|专题|乡镇要闻|乡镇动态|乡镇新闻|镇街动态|街道动态|图片新闻|宣传片|访谈|直播/;

const p = 'scripts/website_management/news-probe-results.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
let drop = 0, retag = 0;
for (const r of d) {
  if (!r.picked) continue;
  const t = r.picked.text;
  if (REJECT_TEXT.test(t)) {
    delete r.picked;
    r.reason = 'no-route-found';
    drop++;
    continue;
  }
  let nt;
  if (TIER_B.test(t)) nt = 'B';
  else if (TIER_A.test(t)) nt = 'A';
  else if (TIER_C.test(t)) nt = 'C';
  else nt = r.picked.tier;
  if (nt !== r.picked.tier) {
    r.picked.tier = nt;
    if (nt === 'B') r.picked.score = 75;
    else if (nt === 'A') r.picked.score = 90;
    else if (nt === 'C') r.picked.score = 55;
    retag++;
  }
}
console.log('dropped (new reject):', drop, 'retagged:', retag);
const t = { A: 0, B: 0, C: 0, D: 0 };
for (const r of d) if (r.picked) t[r.picked.tier || 'D']++;
console.log('tiers after:', t);
fs.writeFileSync(p, JSON.stringify(d, null, 2));
