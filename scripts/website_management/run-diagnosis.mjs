/**
 * 诊断流程编排器 — 依次运行全部步骤
 *
 * 运行：node scripts/website_management/run-diagnosis.mjs
 *
 * 执行顺序：
 *   0. 解析 TS → JSON（parse-budget.ts）
 *   1. 批处理 HTTP 抓取（layer1-batch-fetch.mjs）
 *   2. 补充抓取（layer2-supplement.mjs）
 *   3. Playwright 兜底（layer3-playwright.mjs）—— 可选
 *   4. 导出 Excel（export-xlsx.mjs）
 *   5. 生成诊断报告（generate-report.mjs）
 *
 * 选项：
 *   --skip-parse     跳过 TS 解析（已有 diagnosis-data.json 时）
 *   --skip-layer1    跳过第 1 层（已运行过时）
 *   --skip-layer2    跳过第 2 层
 *   --skip-layer3    跳过第 3 层（Playwright）
 *   --only-export    仅运行导出和报告生成
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flags = new Set(args);

function run(label, command) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶ ${label}`);
  console.log('═'.repeat(60));
  execSync(command, { stdio: 'inherit', cwd: join(__dirname, '..', '..') });
}

async function main() {
  const startTime = Date.now();

  // 步骤 0：解析 TS
  if (!flags.has('--skip-parse') && !flags.has('--only-export')) {
    run('步骤 0：解析 website-budget.ts', 'npx tsx scripts/website_management/parse-budget.ts');
  } else if (!existsSync(join(__dirname, 'diagnosis-data.json'))) {
    console.log('⚠ diagnosis-data.json 不存在，自动运行解析...');
    run('步骤 0：解析 website-budget.ts', 'npx tsx scripts/website_management/parse-budget.ts');
  }

  // 步骤 1：批处理 HTTP 抓取
  if (!flags.has('--skip-layer1') && !flags.has('--only-export')) {
    run('步骤 1：批处理 HTTP 抓取', 'node scripts/website_management/layer1-batch-fetch.mjs');
  }

  // 步骤 2：补充抓取
  if (!flags.has('--skip-layer2') && !flags.has('--only-export')) {
    run('步骤 2：补充抓取', 'node scripts/website_management/layer2-supplement.mjs');
  }

  // 步骤 3：Playwright 兜底
  if (!flags.has('--skip-layer3') && !flags.has('--only-export')) {
    run('步骤 3：Playwright 兜底渲染', 'node scripts/website_management/layer3-playwright.mjs');
  }

  // 步骤 4：导出 Excel
  run('步骤 4：导出 Excel', 'node scripts/website_management/export-xlsx.mjs');

  // 步骤 5：生成诊断报告
  run('步骤 5：生成诊断报告', 'node scripts/website_management/generate-report.mjs');

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✓ 全部完成（耗时约 ${elapsed} 分钟）`);
  console.log(`  Excel：data/website-budget.xlsx`);
  console.log(`  报告：docs/website-budget-diagnosis.md`);
  console.log('═'.repeat(60));
}

main().catch(err => {
  console.error('编排器执行失败：', err);
  process.exit(1);
});
