import { readFileSync } from 'fs';
const c = readFileSync('data/gov-website-links.ts', 'utf8');
const lines = c.split('\n');
let level = 0;
let p = 0, pu = 0, ci = 0, cu = 0, co = 0, cou = 0;
let lastName = '';
for (const l of lines) {
  if (l.includes('children: [')) { level++; }
  const nm = l.match(/name:\s*"([^"]+)"/);
  if (nm) { lastName = nm[1]; }
  const um = l.match(/url:\s*"([^"]*)"/);
  if (um) {
    const hasUrl = um[1].length > 0;
    if (level === 0) { p++; if (hasUrl) pu++; }
    else if (level === 1) { ci++; if (hasUrl) cu++; }
    else if (level === 2) { co++; if (hasUrl) cou++; }
  }
  if (l.trim() === ']' || l.trim() === '],') { level--; }
}
console.log(`Provinces: ${pu}/${p}`);
console.log(`Cities: ${cu}/${ci}`);
console.log(`Counties: ${cou}/${co}`);
