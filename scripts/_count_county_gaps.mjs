import fs from 'fs';
const c = fs.readFileSync('data/fiscal-budget-links.ts','utf8');
const lines = c.split('\n');
let prov = '', stats = {};
for(let i=0;i<lines.length;i++){
  const pm = lines[i].match(/═══════\s+(.+?)\s+═══════/);
  if(pm) { prov = pm[1]; if(!stats[prov]) stats[prov]={total:0,empty:0}; continue; }
  // County entries are inside children arrays, indented with 6 spaces
  // City entries use 4 spaces. We detect counties by checking if previous lines contain "children:"
  const nm = lines[i].match(/^\s+\{ name: "(.+?)"/);
  // Check if this is a county (inside children) - look for indentation level
  const indent = lines[i].match(/^(\s*)/)?.[1]?.length || 0;
  if(nm && prov && indent >= 6) {
    stats[prov].total++;
    const nl = lines[i+1]||'';
    if(nl.match(/url:\s*""/)) stats[prov].empty++;
  }
}
const sorted = Object.entries(stats).filter(([,v])=>v.total>0).sort((a,b)=>b[1].empty-a[1].empty);
console.log('Province'.padEnd(24)+'| Total | Empty | Fill%');
console.log('-'.repeat(24)+'|-------|-------|------');
for(const [p,s] of sorted){
  const pct = ((s.total-s.empty)/s.total*100).toFixed(0);
  console.log(p.padEnd(24)+'| '+String(s.total).padStart(5)+' | '+String(s.empty).padStart(5)+' | '+pct+'%');
}
