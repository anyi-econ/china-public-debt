#!/usr/bin/env node
/**
 * Build data/website-gov.xlsx from gov-flat.json + gov-access-results.json.
 *
 * Adds a "推荐访问方式" column so future agents can pick the cheapest fetch
 * strategy per portal without re-probing.
 *
 * Usage:
 *   node scripts/website_management/build-gov-xlsx.mjs
 */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const FLAT = 'scripts/website_management/gov-flat.json';
const ACCESS = 'scripts/website_management/gov-access-results.json';
const DEST = 'data/website-gov.xlsx';

const flat = JSON.parse(fs.readFileSync(FLAT, 'utf8'));
const access = fs.existsSync(ACCESS) ? JSON.parse(fs.readFileSync(ACCESS, 'utf8')) : [];
const accessByKey = new Map();
for (const r of access) accessByKey.set(r.key, r);

const METHOD_LABEL = {
  'direct': '直连',
  'protocol-switch': '协议切换',
  'ua-mobile': '移动UA',
  'ua-baidu': '百度爬虫UA',
  'slow-direct': '慢速直连',
  'none': '无法访问',
};
const METHOD_NOTE = {
  'direct': '默认 UA + 声明协议即可访问',
  'protocol-switch': '需将 https↔http 翻转后访问',
  'ua-mobile': '需移动端 UA（Pixel 7 Chrome）',
  'ua-baidu': '需 Baiduspider UA（白名单爬虫）',
  'slow-direct': '响应慢，需 25s 超时',
  'none': '5 种策略均失败，需 Playwright 或人工核查',
};

const today = new Date().toISOString().slice(0, 10);
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('gov');
ws.columns = [
  { header: '地区', key: 'region', width: 28 },
  { header: '行政层级', key: 'level', width: 10 },
  { header: '门户名称', key: 'govName', width: 24 },
  { header: '门户URL', key: 'govUrl', width: 46 },
  { header: '推荐访问方式', key: 'methodLabel', width: 14 },
  { header: '访问方式代码', key: 'methodCode', width: 16 },
  { header: '生效URL', key: 'finalUrl', width: 46 },
  { header: '响应字节', key: 'htmlLength', width: 12 },
  { header: '说明', key: 'note', width: 40 },
  { header: '检查时间', key: 'date', width: 12 },
];

const breakdown = {};
for (const flatRow of flat) {
  const a = accessByKey.get(flatRow.key);
  const code = a?.accessMethod || 'unknown';
  breakdown[code] = (breakdown[code] || 0) + 1;
  const govName = flatRow.key.split('/').slice(-1)[0] + '人民政府';
  ws.addRow({
    region: flatRow.key,
    level: flatRow.level,
    govName,
    govUrl: flatRow.url,
    methodLabel: METHOD_LABEL[code] || '未探测',
    methodCode: code,
    finalUrl: a?.finalUrl || '',
    htmlLength: a?.htmlLength || '',
    note: METHOD_NOTE[code] || '尚未探测，运行 probe-access.ts 后再生成',
    date: a?.checkedAt ? a.checkedAt.slice(0, 10) : today,
  });
}

ws.getRow(1).font = { bold: true };
ws.getRow(1).alignment = { vertical: 'middle' };
ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } };
ws.views = [{ state: 'frozen', ySplit: 1 }];

await wb.xlsx.writeFile(DEST);
console.log(`[gov-xlsx] wrote ${DEST} (${flat.length} rows)`);
console.log('[gov-xlsx] access-method breakdown:', breakdown);
