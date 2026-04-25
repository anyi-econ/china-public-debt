#!/usr/bin/env node
/** Apply protocol switches from data/website-gov.xlsx to data/website-gov.ts.
 * Reads rows whose 判断依据 contains "协议切换→http" or "协议切换→https" and rewrites
 * the matching URL string in website-gov.ts to the corrected protocol.
 */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const TS = 'data/website-gov.ts';
const XLSX = 'data/website-gov.xlsx';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const sheet = wb.getWorksheet('政府官网核查');

const switches = []; // { name, original, target }
sheet.eachRow((row, i) => {
  if (i === 1) return;
  const v = row.values;
  const judg = String(v[6] || '');
  const m = judg.match(/协议切换→(https?)/);
  if (!m) return;
  const targetProto = m[1];
  const cell = v[3];
  const url = (cell && typeof cell === 'object' && cell.text) ? cell.text : cell;
  if (!url) return;
  const u = String(url);
  const switched = u.replace(/^https?:/, `${targetProto}:`);
  if (switched === u) return;
  switches.push({ name: v[2], original: u, target: switched });
});

console.log(`switch entries: ${switches.length}`);

let src = fs.readFileSync(TS, 'utf8');
let applied = 0;
let missing = 0;
for (const s of switches) {
  const orig = s.original;
  if (src.includes(orig)) {
    src = src.split(orig).join(s.target);
    applied++;
  } else {
    // Try without trailing slash variant
    const alt = orig.endsWith('/') ? orig.slice(0, -1) : orig + '/';
    if (src.includes(alt)) {
      const target2 = s.target.endsWith('/') ? s.target.slice(0, -1) : s.target + '/';
      src = src.split(alt).join(target2);
      applied++;
    } else {
      console.log('  NOT FOUND in ts:', s.name, orig);
      missing++;
    }
  }
}
fs.writeFileSync(TS, src, 'utf8');
console.log(`applied: ${applied}; not-found: ${missing}`);
