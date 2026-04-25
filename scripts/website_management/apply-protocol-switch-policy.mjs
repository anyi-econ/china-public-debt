#!/usr/bin/env node
/** Mirror the protocol switches into data/website-policy.ts URLs that share the same host. */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const TS = 'data/website-policy.ts';
const XLSX = 'data/website-gov.xlsx';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const sheet = wb.getWorksheet('政府官网核查');

const hostSwitch = new Map(); // host -> targetProto
sheet.eachRow((row, i) => {
  if (i === 1) return;
  const v = row.values;
  const judg = String(v[6] || '');
  const m = judg.match(/协议切换→(https?)/);
  if (!m) return;
  const cell = v[3];
  const url = (cell && typeof cell === 'object' && cell.text) ? cell.text : cell;
  if (!url) return;
  try {
    const u = new URL(String(url));
    hostSwitch.set(u.host, m[1]);
  } catch {}
});

console.log(`distinct hosts to switch: ${hostSwitch.size}`);

let src = fs.readFileSync(TS, 'utf8');
let edits = 0;
const lines = src.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/"(https?):\/\/([^/"]+)([^"]*)"/);
  if (!m) continue;
  const proto = m[1];
  const host = m[2];
  const target = hostSwitch.get(host);
  if (!target || target === proto) continue;
  const oldUrl = `"${proto}://${host}${m[3]}"`;
  const newUrl = `"${target}://${host}${m[3]}"`;
  lines[i] = line.replace(oldUrl, newUrl);
  edits++;
}
fs.writeFileSync(TS, lines.join('\n'), 'utf8');
console.log(`policy URL edits: ${edits}`);
