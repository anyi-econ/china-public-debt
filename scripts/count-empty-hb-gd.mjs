import { readFileSync } from 'fs';
const c = readFileSync('data/fiscal-budget-links.ts','utf-8');
const lines = c.split('\n');
let inP = '', empty = [];
for(let i=0;i<lines.length;i++){
  const l = lines[i];
  if(l.includes('═══════ 湖北省')) inP='湖北';
  else if(l.includes('═══════ 广东省')) inP='广东';
  else if(l.includes('═══════') && inP) inP='';
  if(inP && /url:\s*""/.test(l)){
    // find nearest name line above
    let nm = '';
    for(let j=i-1;j>=Math.max(0,i-5);j--){
      const m = lines[j].match(/name:\s*"([^"]+)"/);
      if(m){nm=m[1];break;}
    }
    empty.push({prov:inP, line:i+1, name:nm});
  }
}
console.log('Empty slots:', empty.length);
const byP = {};
empty.forEach(e => byP[e.prov] = (byP[e.prov]||0)+1);
console.log(byP);
empty.forEach(e => console.log(`  ${e.prov} ${e.name} (line ${e.line})`));
