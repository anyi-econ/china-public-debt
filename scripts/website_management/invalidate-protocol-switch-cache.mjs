#!/usr/bin/env node
/** Invalidate cached probe results whose govUrl host had a protocol switch.
 * Forces probe-disclosure-fallback.ts to re-probe these entries against the
 * corrected URL on the next run.
 */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const CACHE = 'scripts/website_management/policy-disclosure-fallback-results.json';
const XLSX = 'data/website-gov.xlsx';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const sheet = wb.getWorksheet('政府官网核查');
const switchedHosts = new Set();
sheet.eachRow((row, i) => {
  if (i === 1) return;
  const v = row.values;
  const judg = String(v[6] || '');
  if (!/协议切换/.test(judg)) return;
  const cell = v[3];
  const url = (cell && typeof cell === 'object' && cell.text) ? cell.text : cell;
  try { switchedHosts.add(new URL(String(url)).host); } catch {}
});

const cache = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
const before = cache.length;
const kept = cache.filter((r) => {
  try { return !switchedHosts.has(new URL(r.govUrl).host); } catch { return true; }
});
fs.writeFileSync(CACHE, JSON.stringify(kept, null, 2), 'utf8');
console.log(`cache: ${before} -> ${kept.length}; invalidated ${before - kept.length} entries on ${switchedHosts.size} switched hosts`);
