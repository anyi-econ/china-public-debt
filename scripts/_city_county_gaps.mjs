import fs from 'fs';
const c = fs.readFileSync('data/fiscal-budget-links.ts','utf8');
const lines = c.split('\n');
let prov = '', cityName = '';
const targets = ['山东省','河南省','云南省','湖南省','黑龙江省'];
const cityGaps = [];

for(let i=0;i<lines.length;i++){
  const pm = lines[i].match(/═══════\s+(.+?)\s+═══════/);
  if(pm) { prov = pm[1]; continue; }
  if(!targets.includes(prov)) continue;
  
  // City-level entry (multi-line format with name: on its own line)
  const cityMatch = lines[i].match(/^\s+name: "(.+?[市州地区盟])"/);
  if(cityMatch) {
    cityName = cityMatch[1];
    continue;
  }
  
  // County entry (single-line format with both name and url)
  const countyMatch = lines[i].match(/\{ name: "(.+?)", url: "(.*?)" \}/);
  if(countyMatch && cityName) {
    const [_, countyName, url] = countyMatch;
    if(url === '') {
      let rec = cityGaps.find(r => r.prov === prov && r.city === cityName);
      if(!rec) { rec = {prov, city: cityName, empty: 0, counties:[]}; cityGaps.push(rec); }
      rec.empty++;
      rec.counties.push(countyName);
    }
  }
}

cityGaps.sort((a,b) => b.empty - a.empty);

console.log('Top cities by county gaps:\n');
for(const r of cityGaps.slice(0,40)) {
  console.log(`${r.prov} > ${r.city}: ${r.empty} gaps`);
  if(r.empty <= 12) console.log(`  ${r.counties.join(', ')}`);
}
