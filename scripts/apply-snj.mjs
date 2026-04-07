import fs from 'fs';
let c = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const old = 'name: "神农架林区", url: ""';
const nw = 'name: "神农架林区", url: "http://czj.snj.gov.cn/"';
if (c.includes(old)) {
  c = c.replace(old, nw);
  fs.writeFileSync('data/fiscal-budget-links.ts', c);
  console.log('Applied 神农架林区');
} else {
  console.log('Pattern not found');
}
