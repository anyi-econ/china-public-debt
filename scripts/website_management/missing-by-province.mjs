#!/usr/bin/env node
/** Bucket missing-policy entries by province + level for prioritization. */
import fs from 'node:fs';
const missing = JSON.parse(fs.readFileSync('missing-policy.json', 'utf8'));
const byProvince = {};
let totalCity = 0, totalCounty = 0, totalProv = 0;
for (const [key, info] of Object.entries(missing)) {
  const parts = key.split('/');
  const prov = parts[0];
  const level = parts.length === 1 ? '省级' : parts.length === 2 ? '地级' : '县区';
  if (level === '省级') totalProv++;
  else if (level === '地级') totalCity++;
  else totalCounty++;
  if (!byProvince[prov]) byProvince[prov] = { 省级: 0, 地级: 0, 县区: 0 };
  byProvince[prov][level]++;
}
console.log(`总缺口 ${Object.keys(missing).length}: 省级 ${totalProv}, 地级 ${totalCity}, 县区 ${totalCounty}\n`);
console.log('省份'.padEnd(14) + '省级  地级  县区  合计');
console.log('─'.repeat(40));
const rows = Object.entries(byProvince).map(([p, c]) => ({ p, ...c, total: c.省级 + c.地级 + c.县区 }));
rows.sort((a, b) => b.total - a.total);
for (const r of rows) {
  console.log(r.p.padEnd(14) + String(r.省级).padStart(4) + String(r.地级).padStart(6) + String(r.县区).padStart(6) + String(r.total).padStart(6));
}
