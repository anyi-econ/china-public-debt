#!/usr/bin/env node
/** Build data/website-policy.xlsx — see build-policy-xlsx.ts for design. */
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const policySrc = fs.readFileSync('data/website-policy.ts', 'utf8');
const entries = [];
const entryRe = /^\s*"([^"]+)":\s*"([^"]+)",?\s*(?:\/\/\s*(.*))?$/gm;
for (const m of policySrc.matchAll(entryRe)) {
  entries.push({ key: m[1], url: m[2], comment: (m[3] || '').trim() });
}

const missingMap = JSON.parse(fs.readFileSync('missing-policy.json', 'utf8'));
const probeRaw = JSON.parse(
  fs.readFileSync('scripts/website_management/policy-probe-results.json', 'utf8'),
);
const probe = Object.values(probeRaw);
const probeByKey = new Map(probe.filter((r) => r && r.key).map((r) => [r.key, r]));
// Overlay PW probe results (if present): pw entries take precedence so the
// missing sheet shows what playwright saw rather than the older http-only result.
try {
  const pw = JSON.parse(
    fs.readFileSync('scripts/website_management/policy-probe-results-pw.json', 'utf8'),
  );
  for (const r of pw) if (r && r.key) probeByKey.set(r.key, r);
} catch {}

const depth = (k) => k.split('/').length;
const levelLabel = (d) => (d === 1 ? '省级' : d === 2 ? '市级' : '县区');
const provOf = (k) => k.split('/')[0];
const cityOf = (k) => {
  const p = k.split('/');
  return p.length >= 2 ? p[1] : '';
};

function classifyEntry(c) {
  if (!c) return { source: 'manual', mode: 'manual', note: '' };
  if (/shared from/.test(c)) {
    const m = /shared from "([^"]+)"/.exec(c);
    const isPw = /pw/.test(c);
    return {
      source: isPw ? 'shared-pw' : 'shared',
      mode: 'shared',
      note: m ? `复用自 ${m[1]}${isPw ? '（playwright 探测）' : ''}` : c,
    };
  }
  if (/手工补录/.test(c)) return { source: 'manual-v7', mode: 'manual', note: c };
  if (/pw\)/.test(c)) {
    const m = /score=(\d+)/.exec(c);
    return { source: 'auto-pw', mode: 'playwright', note: m ? `分数=${m[1]} ${c}` : c };
  }
  if (/score=(\d+)/.test(c)) {
    const m = /score=(\d+)/.exec(c);
    return { source: 'auto', mode: 'auto', note: `分数=${m[1]} ${c}` };
  }
  return { source: 'manual', mode: 'manual', note: c };
}

const entriesRows = entries.map((e) => {
  const cls = classifyEntry(e.comment);
  return {
    key: e.key,
    province: provOf(e.key),
    city: cityOf(e.key),
    level: levelLabel(depth(e.key)),
    url: e.url,
    source: cls.source,
    mode: cls.mode,
    note: cls.note,
  };
});

const missingRows = Object.keys(missingMap).map((k) => {
  const r = probeByKey.get(k);
  let reason = '未探测';
  let pickedUrl = '';
  let pickedText = '';
  let score = '';
  let listLooks = '';
  if (r) {
    if (r.reason) reason = r.reason;
    else reason = 'picked-rejected';
    if (r.picked) {
      pickedUrl = r.picked.url;
      pickedText = r.picked.text;
      score = r.picked.score;
      listLooks = String(r.picked.listLooks);
    }
  }
  return {
    key: k,
    province: provOf(k),
    city: cityOf(k),
    level: levelLabel(depth(k)),
    govUrl: missingMap[k].url,
    reason,
    pickedUrl,
    pickedText,
    score,
    listLooks,
  };
});

const CAPITALS = new Set([
  '河北省/石家庄市','山西省/太原市','内蒙古自治区/呼和浩特市','辽宁省/沈阳市',
  '吉林省/长春市','黑龙江省/哈尔滨市','江苏省/南京市','浙江省/杭州市',
  '安徽省/合肥市','福建省/福州市','江西省/南昌市','山东省/济南市',
  '河南省/郑州市','湖北省/武汉市','湖南省/长沙市','广东省/广州市',
  '广西壮族自治区/南宁市','海南省/海口市','四川省/成都市','贵州省/贵阳市',
  '云南省/昆明市','西藏自治区/拉萨市','陕西省/西安市','甘肃省/兰州市',
  '青海省/西宁市','宁夏回族自治区/银川市','新疆维吾尔自治区/乌鲁木齐市',
]);

const inMap = new Set(entries.map((e) => e.key));
const allKeys = new Set([...inMap, ...Object.keys(missingMap)]);
const totalProv = [...allKeys].filter((k) => depth(k) === 1).length;
const totalCity = [...allKeys].filter((k) => depth(k) === 2).length;
const totalCounty = [...allKeys].filter((k) => depth(k) === 3).length;
const okProv = entries.filter((e) => depth(e.key) === 1).length;
const okCity = entries.filter((e) => depth(e.key) === 2).length;
const okCounty = entries.filter((e) => depth(e.key) === 3).length;
const okCap = [...CAPITALS].filter((c) => inMap.has(c)).length;

const summaryRows = [
  { cohort: '省级', covered: okProv, total: totalProv, ratio: okProv / totalProv },
  { cohort: '省会城市 (27)', covered: okCap, total: CAPITALS.size, ratio: okCap / CAPITALS.size },
  { cohort: '地级市', covered: okCity, total: totalCity, ratio: okCity / totalCity },
  { cohort: '县区', covered: okCounty, total: totalCounty, ratio: okCounty / totalCounty },
  { cohort: '总计', covered: okProv + okCity + okCounty, total: totalProv + totalCity + totalCounty, ratio: (okProv + okCity + okCounty) / (totalProv + totalCity + totalCounty) },
];

const wb = new ExcelJS.Workbook();
wb.creator = 'website-policy build script';
wb.created = new Date();

function addSheet(name, rows, cols) {
  const ws = wb.addWorksheet(name);
  ws.columns = cols.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.addRows(rows);
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
}

addSheet('summary', summaryRows, [
  { header: '维度', key: 'cohort', width: 24 },
  { header: '已覆盖', key: 'covered', width: 10 },
  { header: '总数', key: 'total', width: 10 },
  { header: '覆盖率', key: 'ratio', width: 12 },
]);
wb.getWorksheet('summary').getColumn('ratio').numFmt = '0.0%';

addSheet('entries', entriesRows, [
  { header: 'key', key: 'key', width: 36 },
  { header: '省', key: 'province', width: 14 },
  { header: '市', key: 'city', width: 14 },
  { header: '层级', key: 'level', width: 8 },
  { header: 'URL', key: 'url', width: 60 },
  { header: '来源', key: 'source', width: 12 },
  { header: '模式', key: 'mode', width: 10 },
  { header: '备注', key: 'note', width: 60 },
]);

addSheet('missing', missingRows, [
  { header: 'key', key: 'key', width: 36 },
  { header: '省', key: 'province', width: 14 },
  { header: '市', key: 'city', width: 14 },
  { header: '层级', key: 'level', width: 8 },
  { header: 'gov 门户', key: 'govUrl', width: 50 },
  { header: '失败原因', key: 'reason', width: 22 },
  { header: '探测候选 URL', key: 'pickedUrl', width: 60 },
  { header: '候选文本', key: 'pickedText', width: 36 },
  { header: '分数', key: 'score', width: 8 },
  { header: 'listLooks', key: 'listLooks', width: 10 },
]);

await wb.xlsx.writeFile('data/website-policy.xlsx');
console.log('written: data/website-policy.xlsx');
console.log(`  entries: ${entriesRows.length}`);
console.log(`  missing: ${missingRows.length}`);
console.log(`  summary rows: ${summaryRows.length}`);
