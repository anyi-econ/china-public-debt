/**
 * 导出诊断结果为 Excel
 *
 * 运行：node scripts/website_management/export-xlsx.mjs
 *
 * 输入：scripts/website_management/diagnosis-data.json
 * 输出：data/website-budget.xlsx
 */

import ExcelJS from 'exceljs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadDiagnosisData } from './diagnosis-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');
const OUTPUT_PATH = join(PROJECT_ROOT, 'data', 'website-budget.xlsx');

// ═══════ 列定义 ═══════

const COLUMNS = [
  { header: '省份', key: 'province', width: 16 },
  { header: '城市', key: 'city', width: 14 },
  { header: '区县', key: 'district', width: 16 },
  { header: '地区名称', key: 'name', width: 16 },
  { header: '层级', key: 'level', width: 10 },
  { header: '原始链接', key: 'url', width: 60 },
  { header: '页面是否可用', key: 'pageAvailable', width: 14 },
  { header: '地区是否匹配', key: 'regionMatch', width: 14 },
  { header: '页面类型', key: 'pageType', width: 24 },
  { header: '是否直达目标层级', key: 'directAccess', width: 16 },
  { header: '是否同时包含预算和决算', key: 'bothBudgetAndFinal', width: 20 },
  { header: '是否含下级内容', key: 'hasSubordinateContent', width: 16 },
  { header: '判断说明', key: 'diagnosisNote', width: 55 },
  { header: '是否需人工复核', key: 'needsManualReview', width: 14 },
  { header: 'HTTP状态码', key: 'httpStatus', width: 12 },
  { header: '页面标题', key: 'pageTitle', width: 40 },
  { header: '诊断层级', key: 'diagnosisLayer', width: 10 },
];

// ═══════ 条件格式颜色 ═══════

const FILL_RED = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };
const FILL_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8E1' } };
const FILL_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
const FILL_GRAY = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };

function getValueFill(value) {
  if (value === '是') return FILL_GREEN;
  if (value === '否') return FILL_RED;
  if (value === '存疑') return FILL_YELLOW;
  return null;
}

function getPageTypeFill(value) {
  if (value === '预决算页面') return FILL_GREEN;
  if (value === '法定公开内容页面') return FILL_YELLOW;
  if (value === '财政信息或上层栏目页面') return FILL_YELLOW;
  if (value === '其他') return FILL_RED;
  if (value === '存疑') return FILL_YELLOW;
  return null;
}

const LEVEL_MAP = { province: '省级', city: '地级市', district: '区县' };

async function main() {
  const data = loadDiagnosisData(__dirname);
  const records = data.records;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'fiscal-diagnosis';
  wb.created = new Date();

  const ws = wb.addWorksheet('诊断结果', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  ws.columns = COLUMNS;

  // 表头样式
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 30;

  // 填充数据
  for (const r of records) {
    const row = ws.addRow({
      province: r.province,
      city: r.city,
      district: r.district,
      name: r.name,
      level: LEVEL_MAP[r.level] || r.level,
      url: r.url || '',
      pageAvailable: r.pageAvailable || '',
      regionMatch: r.regionMatch || '',
      pageType: r.pageType || '',
      directAccess: r.directAccess || '',
      bothBudgetAndFinal: r.bothBudgetAndFinal || '',
      hasSubordinateContent: r.hasSubordinateContent || '',
      diagnosisNote: r.diagnosisNote || '',
      needsManualReview: r.needsManualReview || '',
      httpStatus: r.httpStatus || '',
      pageTitle: (r.pageTitle || '').slice(0, 200),
      diagnosisLayer: r.diagnosisLayer ?? '',
    });

    // URL 超链接
    if (r.url) {
      const urlCell = row.getCell('url');
      urlCell.value = { text: r.url, hyperlink: r.url };
      urlCell.font = { color: { argb: 'FF1565C0' }, underline: true, size: 10 };
    }

    // 条件着色（诊断列）
    const availCell = row.getCell('pageAvailable');
    const af = getValueFill(r.pageAvailable);
    if (af) availCell.fill = af;

    const rmCell = row.getCell('regionMatch');
    const rmf = getValueFill(r.regionMatch);
    if (rmf) rmCell.fill = rmf;

    const ptCell = row.getCell('pageType');
    const ptf = getPageTypeFill(r.pageType);
    if (ptf) ptCell.fill = ptf;

    const daCell = row.getCell('directAccess');
    const daf = getValueFill(r.directAccess);
    if (daf) daCell.fill = daf;

    const bbCell = row.getCell('bothBudgetAndFinal');
    const bbf = getValueFill(r.bothBudgetAndFinal);
    if (bbf) bbCell.fill = bbf;

    const hsCell = row.getCell('hasSubordinateContent');
    const hsf = getValueFill(r.hasSubordinateContent);
    if (hsf) hsCell.fill = hsf;

    const mrCell = row.getCell('needsManualReview');
    if (r.needsManualReview === '是') mrCell.fill = FILL_RED;
    else if (r.needsManualReview === '否') mrCell.fill = FILL_GREEN;

    // 无链接行灰底
    if (!r.url) {
      row.eachCell(cell => { cell.fill = FILL_GRAY; });
    }

    row.alignment = { vertical: 'top', wrapText: true };
  }

  // 筛选器
  ws.autoFilter = { from: 'A1', to: `Q${records.length + 1}` };

  // ═══════ 统计 Sheet ═══════
  const statWs = wb.addWorksheet('统计概览');
  statWs.columns = [
    { header: '指标', key: 'metric', width: 30 },
    { header: '值', key: 'value', width: 15 },
    { header: '占比', key: 'pct', width: 12 },
  ];
  statWs.getRow(1).font = { bold: true };

  const total = records.length;
  const withUrl = records.filter(r => r.url).length;

  function addStat(metric, value) {
    statWs.addRow({ metric, value, pct: total ? `${((value / total) * 100).toFixed(1)}%` : '' });
  }

  addStat('总记录数', total);
  addStat('有链接', withUrl);
  addStat('无链接', total - withUrl);
  statWs.addRow({});

  addStat('页面可用=是', records.filter(r => r.pageAvailable === '是').length);
  addStat('页面可用=否', records.filter(r => r.pageAvailable === '否').length);
  addStat('页面可用=存疑', records.filter(r => r.pageAvailable === '存疑').length);
  statWs.addRow({});

  addStat('地区匹配=是', records.filter(r => r.regionMatch === '是').length);
  addStat('地区匹配=否', records.filter(r => r.regionMatch === '否').length);
  addStat('地区匹配=存疑', records.filter(r => r.regionMatch === '存疑').length);
  statWs.addRow({});

  addStat('页面类型=预决算页面', records.filter(r => r.pageType === '预决算页面').length);
  addStat('页面类型=法定公开内容页面', records.filter(r => r.pageType === '法定公开内容页面').length);
  addStat('页面类型=财政信息或上层栏目页面', records.filter(r => r.pageType === '财政信息或上层栏目页面').length);
  addStat('页面类型=其他', records.filter(r => r.pageType === '其他').length);
  addStat('页面类型=存疑', records.filter(r => r.pageType === '存疑').length);
  statWs.addRow({});

  addStat('直达目标=是', records.filter(r => r.directAccess === '是').length);
  addStat('直达目标=否', records.filter(r => r.directAccess === '否').length);
  addStat('直达目标=存疑', records.filter(r => r.directAccess === '存疑').length);
  statWs.addRow({});

  addStat('同时含预算决算=是', records.filter(r => r.bothBudgetAndFinal === '是').length);
  addStat('同时含预算决算=否', records.filter(r => r.bothBudgetAndFinal === '否').length);
  addStat('同时含预算决算=存疑', records.filter(r => r.bothBudgetAndFinal === '存疑').length);
  statWs.addRow({});

  addStat('含下级内容=是', records.filter(r => r.hasSubordinateContent === '是').length);
  addStat('含下级内容=否', records.filter(r => r.hasSubordinateContent === '否').length);
  addStat('含下级内容=存疑', records.filter(r => r.hasSubordinateContent === '存疑').length);
  statWs.addRow({});

  addStat('需人工复核', records.filter(r => r.needsManualReview === '是').length);

  await wb.xlsx.writeFile(OUTPUT_PATH);
  console.log(`✓ Excel 已导出：${OUTPUT_PATH}`);
  console.log(`  共 ${records.length} 条记录`);
}

main().catch(err => {
  console.error('Excel 导出失败：', err);
  process.exit(1);
});
