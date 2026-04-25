#!/usr/bin/env node
/**
 * Convert probe results JSON into an xlsx with the standard column-finder schema.
 *
 * Usage:
 *   node scripts/website_management/build-column-xlsx.mjs news
 *   node scripts/website_management/build-column-xlsx.mjs industrial
 */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const cat = (process.argv[2] || '').trim();
if (cat !== 'news' && cat !== 'industrial') {
  console.error('usage: build-column-xlsx.mjs <news|industrial>');
  process.exit(2);
}

const SRC = `scripts/website_management/${cat}-probe-results.json`;
const FLAT = 'scripts/website_management/gov-flat.json';
const DEST = `data/website-${cat}.xlsx`;

const probe = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const flat = JSON.parse(fs.readFileSync(FLAT, 'utf8'));

// Build map keyed by gov key -> { url, level }
const govByKey = new Map();
for (const r of flat) govByKey.set(r.key, r);

// Index probe results by key
const probeByKey = new Map();
for (const r of probe) probeByKey.set(r.key, r);

// Build rows in the order of flat (so all 3209 portals are present)
const today = new Date().toISOString().slice(0, 10);
const wb = new ExcelJS.Workbook();
const sheetName = cat;
const ws = wb.addWorksheet(sheetName);

const isNews = cat === 'news';
const baseCols = [
  { header: '地区', key: 'region', width: 28 },
  { header: '行政层级', key: 'level', width: 10 },
  { header: '政府门户名称', key: 'govName', width: 22 },
  { header: '政府门户首页URL', key: 'govUrl', width: 42 },
  { header: isNews ? '新闻栏目名称' : '涉企栏目名称', key: 'colName', width: 22 },
  { header: isNews ? '新闻栏目URL' : '涉企栏目URL', key: 'colUrl', width: 50 },
  { header: '栏目类型', key: 'tier', width: 10 },
];
const industrialExtras = [
  { header: '是否外部平台', key: 'external', width: 12 },
  { header: '平台运营主体', key: 'operator', width: 18 },
];
const trailing = [
  { header: '是否目标栏目', key: 'isTarget', width: 12 },
  { header: '判断依据', key: 'reason', width: 36 },
  { header: '链接状态', key: 'linkStatus', width: 12 },
  { header: '是否需要复核', key: 'needReview', width: 12 },
  { header: '失败原因/备注', key: 'note', width: 28 },
  { header: '检查时间', key: 'date', width: 12 },
];
ws.columns = isNews ? [...baseCols, ...trailing] : [...baseCols, ...industrialExtras, ...trailing];

let pickedCount = 0;
let failCount = 0;
const tierStats = { A: 0, B: 0, C: 0, D: 0 };

for (const flatRow of flat) {
  const r = probeByKey.get(flatRow.key);
  const govName = flatRow.key.split('/').slice(-1)[0] + '人民政府';
  if (r && r.picked) {
    pickedCount++;
    const p = r.picked;
    const tier = p.tier || (p.score >= 80 ? 'A' : p.score >= 65 ? 'B' : 'C');
    tierStats[tier] = (tierStats[tier] || 0) + 1;
    let externalHost = '';
    try {
      const ph = new URL(p.url).host;
      const gh = new URL(flatRow.url).host;
      // strip leading www. for comparison
      const norm = (h) => h.toLowerCase().replace(/^www\./, '');
      if (norm(ph) !== norm(gh)) externalHost = ph;
    } catch { /* */ }
    const row = {
      region: flatRow.key,
      level: flatRow.level,
      govName,
      govUrl: flatRow.url,
      colName: p.text,
      colUrl: p.url,
      tier: `Tier ${tier}`,
      isTarget: '是',
      reason: `命中关键词「${p.text}」(score=${p.score}, source=${p.source})`,
      linkStatus: '200',
      needReview: tier === 'C' || tier === 'D' ? '是' : '否',
      note: '',
      date: today,
    };
    if (!isNews) {
      row.external = externalHost ? '是' : '否';
      row.operator = externalHost ? `外部域名 ${externalHost}` : '';
    }
    ws.addRow(row);
  } else {
    failCount++;
    const reason = r ? (r.reason || '') : '未探测';
    const linkStatus = /homepage-unreachable/.test(reason)
      ? '首页不可达'
      : /no-route/.test(reason)
        ? '未识别栏目'
        : /error:/.test(reason)
          ? '抓取错误'
          : '未探测';
    const row = {
      region: flatRow.key,
      level: flatRow.level,
      govName,
      govUrl: flatRow.url,
      colName: '',
      colUrl: '',
      tier: '',
      isTarget: '否',
      reason: '',
      linkStatus,
      needReview: '是',
      note: reason,
      date: today,
    };
    if (!isNews) {
      row.external = '';
      row.operator = '';
    }
    ws.addRow(row);
  }
}

// freeze header
ws.views = [{ state: 'frozen', ySplit: 1 }];
ws.getRow(1).font = { bold: true };
ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

fs.mkdirSync('data', { recursive: true });
await wb.xlsx.writeFile(DEST);

console.log(`[${cat}] wrote ${DEST}`);
console.log(`[${cat}] picked=${pickedCount}/${flat.length} (${(pickedCount / flat.length * 100).toFixed(1)}%) fail=${failCount}`);
console.log(`[${cat}] tier breakdown:`, tierStats);
