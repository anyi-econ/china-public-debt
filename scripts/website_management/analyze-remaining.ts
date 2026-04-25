import fs from 'fs';
const all = Object.values(JSON.parse(fs.readFileSync('scripts/website_management/policy-probe-results.json','utf8'))) as any[];
const missing = JSON.parse(fs.readFileSync('missing-policy.json','utf8'));
const stillMissing = new Set(Object.keys(missing));

const buckets: Record<string, {city:number, county:number, samples:string[]}> = {};
function bump(b: string, key: string) {
  buckets[b] ??= {city:0, county:0, samples:[]};
  const depth = key.split('/').length;
  if (depth === 2) buckets[b].city++;
  else if (depth === 3) buckets[b].county++;
  if (buckets[b].samples.length < 3) buckets[b].samples.push(key);
}

for (const r of all) {
  if (!r || !stillMissing.has(r.key)) continue;
  if (r.reason === 'homepage-unreachable') bump('A. WAF/UA 拒抓首页', r.key);
  else if (r.reason === 'no-candidate') bump('B. 首页无关键词候选 (SPA 入口)', r.key);
  else if (r.reason === 'target-unreachable') bump('C. 候选页本身不可达', r.key);
  else if (r.picked) {
    const p = r.picked;
    if (p.score >= 80 && !p.listLooks) bump('D1. score≥80 但 listLooks=false (JS渲染)', r.key);
    else if (p.score >= 55 && !p.listLooks) bump('D2. score 55-79 listLooks=false', r.key);
    else if (p.score >= 40 && !p.listLooks) bump('D3. score 40-54 listLooks=false', r.key);
    else if (p.score < 40) bump('E. score<40 关键词太弱', r.key);
    else bump('F. 其他被过滤', r.key);
  } else bump('G. 无 picked 无 reason', r.key);
}

const sorted = Object.entries(buckets).sort((a,b)=>(b[1].city+b[1].county)-(a[1].city+a[1].county));
console.log('总缺失：city', sorted.reduce((s,[,v])=>s+v.city,0), 'county', sorted.reduce((s,[,v])=>s+v.county,0));
console.log();
for (const [k,v] of sorted) {
  console.log(`${k}`);
  console.log(`  city ${v.city} + county ${v.county} = ${v.city+v.county}`);
  console.log(`  样例: ${v.samples.join(' | ')}`);
}
