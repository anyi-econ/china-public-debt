import fs from 'fs';
const all = Object.values(JSON.parse(fs.readFileSync('scripts/website_management/policy-probe-results.json','utf8'))) as any[];
const missing = JSON.parse(fs.readFileSync('missing-policy.json','utf8'));
const stillMissing = new Set(Object.keys(missing));

// Replicate emit-policy classify reasons
function isSpecificDoc(t: string){return /[《》]/.test(t)||t.length>12||/通知|批复|函|关于|解读|公告|公示|办法的|决定的/.test(t);}
function isDetailUrl(u: string){if(/\/detail\//.test(u))return true;if(/\/content\/[a-f0-9]{16,}/i.test(u))return true;if(/\/showArticle|\/article\/\d/.test(u))return true;if(/\.html$/.test(u)&&/\/\d{7,}\//.test(u))return true;return false;}
function host(u:string){try{return new URL(u).host.toLowerCase()}catch{return''}}
function sameOrg(a:string,b:string){const x=host(a),y=host(b);if(!x||!y)return false;if(x===y)return true;const xp=x.split('.'),yp=y.split('.');if(xp.length<3||yp.length<3)return false;return xp.slice(-3).join('.')===yp.slice(-3).join('.');}

const reasons: Record<string,{count:number, samples:any[]}> = {};
function bump(r:string,sample:any){reasons[r]??={count:0,samples:[]};reasons[r].count++;if(reasons[r].samples.length<3)reasons[r].samples.push(sample);}

for (const r of all) {
  if (!r||!stillMissing.has(r.key)||!r.picked) continue;
  const p = r.picked;
  if (isSpecificDoc(p.text)) bump('text 过长/含书名号/含"通知函"', {key:r.key,text:p.text,url:p.url});
  else if (isDetailUrl(p.url)) bump('URL 形如详情页', {key:r.key,text:p.text,url:p.url});
  else if (!sameOrg(p.url, r.provUrl)) bump('跨域 (子区候选指向母市/省门户)', {key:r.key,prov:r.provUrl,url:p.url});
}

for (const [k,v] of Object.entries(reasons).sort((a,b)=>b[1].count-a[1].count)) {
  console.log(`${k}: ${v.count}`);
  for (const s of v.samples) console.log('  ', JSON.stringify(s).slice(0,200));
}
