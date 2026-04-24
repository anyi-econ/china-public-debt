/**
 * 生成诊断报告 Markdown
 *
 * 运行：node scripts/website_management/generate-report.mjs
 *
 * 输入：scripts/website_management/diagnosis-data.json
 * 输出：docs/website-budget-diagnosis.md
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadDiagnosisData } from './diagnosis-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');
const OUTPUT_PATH = join(PROJECT_ROOT, 'docs', 'website-budget-diagnosis.md');

function pct(n, total) {
  return total ? `${((n / total) * 100).toFixed(1)}%` : '0%';
}

function count(records, field, value) {
  return records.filter(r => r[field] === value).length;
}

function listRegions(records, field, values) {
  return records
    .filter(r => values.includes(r[field]))
    .map(r => `${r.path}`)
    .join('、');
}

function listRegionsGrouped(records, field, values) {
  const matched = records.filter(r => values.includes(r[field]));
  if (matched.length === 0) return '无';

  // 按省分组
  const groups = {};
  for (const r of matched) {
    if (!groups[r.province]) groups[r.province] = [];
    groups[r.province].push(r.name);
  }

  const lines = [];
  for (const [prov, names] of Object.entries(groups)) {
    if (names.length <= 5) {
      lines.push(`- **${prov}**：${names.join('、')}`);
    } else {
      lines.push(`- **${prov}**：${names.slice(0, 5).join('、')} 等 ${names.length} 个`);
    }
  }
  return lines.join('\n');
}

function main() {
  const data = loadDiagnosisData(__dirname);
  const records = data.records;
  const total = records.length;
  const withUrl = records.filter(r => r.url).length;
  const noUrl = total - withUrl;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // ═══════ 统计 ═══════
  const avail_yes = count(records, 'pageAvailable', '是');
  const avail_no = count(records, 'pageAvailable', '否');
  const avail_unk = count(records, 'pageAvailable', '存疑');

  const region_yes = count(records, 'regionMatch', '是');
  const region_no = count(records, 'regionMatch', '否');
  const region_unk = count(records, 'regionMatch', '存疑');

  const type_budget = count(records, 'pageType', '预决算页面');
  const type_legal = count(records, 'pageType', '法定公开内容页面');
  const type_fiscal = count(records, 'pageType', '财政信息或上层栏目页面');
  const type_other = count(records, 'pageType', '其他');
  const type_unk = count(records, 'pageType', '存疑');

  const direct_yes = count(records, 'directAccess', '是');
  const direct_no = count(records, 'directAccess', '否');
  const direct_unk = count(records, 'directAccess', '存疑');

  const both_yes = count(records, 'bothBudgetAndFinal', '是');
  const both_no = count(records, 'bothBudgetAndFinal', '否');
  const both_unk = count(records, 'bothBudgetAndFinal', '存疑');

  const sub_yes = count(records, 'hasSubordinateContent', '是');
  const sub_no = count(records, 'hasSubordinateContent', '否');
  const sub_unk = count(records, 'hasSubordinateContent', '存疑');

  const review_yes = count(records, 'needsManualReview', '是');

  // ═══════ 生成 Markdown ═══════
  const md = `# 财政预决算链接诊断报告

> 生成时间：${now}

## 一、本轮任务说明

**本轮仅做链接诊断，不做链接优化。**

- 不修改、不删除、不替换原有链接
- 不回写更优路径
- 所有诊断结果作为新增字段输出
- 输出结果可回溯到原始地区和原始链接

### 输入输出

| 类型 | 文件 |
|------|------|
| 输入 | \`data/website-budget.ts\` |
| 主结果 | \`data/website-budget.xlsx\` |
| 诊断报告 | \`docs/website-budget-diagnosis.md\`（本文件） |
| 中间数据 | \`scripts/website_management/diagnosis-data.json\` |

### 诊断字段概览

1. **页面是否可用** — 是 / 否 / 存疑
2. **地区是否匹配** — 是 / 否 / 存疑
3. **页面类型** — 预决算页面 / 法定公开内容页面 / 财政信息或上层栏目页面 / 其他 / 存疑
4. **是否直达目标层级** — 是 / 否 / 存疑
5. **是否同时包含预算和决算** — 是 / 否 / 存疑
6. **是否含下级内容** — 是 / 否 / 存疑
7. **判断说明** — 一句话依据
8. **是否需人工复核** — 是 / 否

## 二、总体统计

| 指标 | 数量 | 占比 |
|------|------|------|
| 总链接数 | ${total} | 100% |
| 有链接 | ${withUrl} | ${pct(withUrl, total)} |
| 无链接 | ${noUrl} | ${pct(noUrl, total)} |

### 页面是否可用

| 取值 | 数量 | 占比 |
|------|------|------|
| 是 | ${avail_yes} | ${pct(avail_yes, total)} |
| 否 | ${avail_no} | ${pct(avail_no, total)} |
| 存疑 | ${avail_unk} | ${pct(avail_unk, total)} |

### 地区是否匹配

| 取值 | 数量 | 占比 |
|------|------|------|
| 是 | ${region_yes} | ${pct(region_yes, total)} |
| 否 | ${region_no} | ${pct(region_no, total)} |
| 存疑 | ${region_unk} | ${pct(region_unk, total)} |

### 页面类型

| 取值 | 数量 | 占比 |
|------|------|------|
| 预决算页面 | ${type_budget} | ${pct(type_budget, total)} |
| 法定公开内容页面 | ${type_legal} | ${pct(type_legal, total)} |
| 财政信息或上层栏目页面 | ${type_fiscal} | ${pct(type_fiscal, total)} |
| 其他 | ${type_other} | ${pct(type_other, total)} |
| 存疑 | ${type_unk} | ${pct(type_unk, total)} |

### 是否直达目标层级

| 取值 | 数量 | 占比 |
|------|------|------|
| 是 | ${direct_yes} | ${pct(direct_yes, total)} |
| 否 | ${direct_no} | ${pct(direct_no, total)} |
| 存疑 | ${direct_unk} | ${pct(direct_unk, total)} |

### 是否同时包含预算和决算

| 取值 | 数量 | 占比 |
|------|------|------|
| 是 | ${both_yes} | ${pct(both_yes, total)} |
| 否 | ${both_no} | ${pct(both_no, total)} |
| 存疑 | ${both_unk} | ${pct(both_unk, total)} |

### 是否含下级内容

| 取值 | 数量 | 占比 |
|------|------|------|
| 是 | ${sub_yes} | ${pct(sub_yes, total)} |
| 否 | ${sub_no} | ${pct(sub_no, total)} |
| 存疑 | ${sub_unk} | ${pct(sub_unk, total)} |

### 需人工复核

| 指标 | 数量 | 占比 |
|------|------|------|
| 需人工复核 | ${review_yes} | ${pct(review_yes, total)} |

## 三、重点问题汇总

### 3.1 地区不匹配（否/存疑）

${listRegionsGrouped(records, 'regionMatch', ['否', '存疑'])}

### 3.2 页面不可用（否/存疑）

${listRegionsGrouped(records, 'pageAvailable', ['否', '存疑'])}

### 3.3 页面类型异常（其他/存疑）

${listRegionsGrouped(records, 'pageType', ['其他', '存疑'])}

### 3.4 需人工复核

${listRegionsGrouped(records, 'needsManualReview', ['是'])}

## 四、简要观察

${generateObservations(records)}

---

*本报告由 \`scripts/website_management/generate-report.mjs\` 自动生成。*
*数据仅反映诊断时刻的页面状态，后续页面可能变化。*
`;

  writeFileSync(OUTPUT_PATH, md, 'utf-8');
  console.log(`✓ 报告已生成：${OUTPUT_PATH}`);
}

function generateObservations(records) {
  const obs = [];
  const total = records.length;
  const withUrl = records.filter(r => r.url).length;

  // 不可用链接比例
  const unavail = records.filter(r => r.pageAvailable === '否').length;
  if (unavail > 0) {
    obs.push(`- 共 ${unavail} 条链接（${pct(unavail, withUrl)}）页面不可用（HTTP 错误、超时或死链），需要排查或更换。`);
  }

  // 法定公开上层占比
  const legalType = records.filter(r => r.pageType === '法定公开内容页面').length;
  if (legalType > 50) {
    obs.push(`- ${legalType} 条链接停留在"法定公开内容"上层页面，需继续点击才能进入预决算栏目。建议后续优化为直达链接。`);
  }

  // 财政信息上层
  const fiscalType = records.filter(r => r.pageType === '财政信息或上层栏目页面').length;
  if (fiscalType > 20) {
    obs.push(`- ${fiscalType} 条链接为"财政信息"上层栏目页面，尚未直达预决算具体入口。`);
  }

  // 直达比例
  const directYes = records.filter(r => r.directAccess === '是').length;
  obs.push(`- 直达预决算目标层级的链接占 ${pct(directYes, withUrl)}（${directYes}/${withUrl}），其余需进一步导航。`);

  // 含下级内容
  const withSub = records.filter(r => r.hasSubordinateContent === '是').length;
  if (withSub > 0) {
    obs.push(`- ${withSub} 个页面混有下级单位（部门/乡镇/学校等）预决算内容。`);
  }

  // 存疑比例
  const uncertainPages = records.filter(r => r.pageAvailable === '存疑').length;
  if (uncertainPages > 0) {
    obs.push(`- ${uncertainPages} 个页面可打开但内容不完整或依赖 JS 渲染，程序无法稳定识别，建议人工复核。`);
  }

  // 地区不匹配
  const regionMismatch = records.filter(r => r.regionMatch === '否').length;
  if (regionMismatch > 0) {
    obs.push(`- ${regionMismatch} 个链接页面地区归属明显不匹配，疑似串链或重定向错误。`);
  }

  if (obs.length === 0) obs.push('- 本轮未发现典型问题。');

  return obs.join('\n');
}

main();
