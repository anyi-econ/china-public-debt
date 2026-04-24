/**
 * 第 3 层：Playwright 浏览器渲染兜底
 *
 * 对前两层仍无法稳定判断的页面，使用 Playwright 渲染并提取内容。
 * 适用于：JS 渲染页面、需点击展开的 tab、初始空白页等。
 *
 * 运行：node scripts/website_management/layer3-playwright.mjs
 *
 * 输入/输出：scripts/website_management/diagnosis-data.json（增量更新）
 */

import { chromium } from 'playwright';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  loadDiagnosisData, saveDiagnosisData, runFullDiagnosis,
} from './diagnosis-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAGE_TIMEOUT = 30000;
const WAIT_AFTER_LOAD = 3000;

/** 在浏览器页面中尝试点击常见的预决算相关 tab/链接 */
async function tryClickBudgetTabs(page) {
  const selectors = [
    'a:has-text("预决算")',
    'a:has-text("预算公开")',
    'a:has-text("决算公开")',
    'a:has-text("财政预决算")',
    'a:has-text("财政信息")',
    'a:has-text("法定公开内容")',
    'a:has-text("法定主动公开")',
    'span:has-text("预决算")',
    'li:has-text("预决算")',
  ];

  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click();
        await page.waitForTimeout(2000);
        return true;
      }
    } catch {
      // 忽略：元素不存在或不可点击
    }
  }
  return false;
}

/** 从 Playwright page 中提取结构化内容 */
async function extractContent(page) {
  return page.evaluate(() => {
    const title = document.title || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    // 面包屑
    let breadcrumbs = '';
    const bcEls = document.querySelectorAll('.breadcrumb, .location, .position, .crumbs, .place, #position, .weizhi');
    for (const el of bcEls) {
      const t = el.textContent?.replace(/\s+/g, ' ').trim();
      if (t && t.length > 3) { breadcrumbs = t.slice(0, 500); break; }
    }

    // 移除干扰元素后取正文
    const clone = document.body.cloneNode(true);
    for (const tag of clone.querySelectorAll('script, style, noscript, nav, header, footer, .footer, .header')) {
      tag.remove();
    }
    const text = (clone.textContent || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 8000);

    return { title, text, breadcrumbs, keywords };
  });
}

async function processRecord(page, r) {
  try {
    await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
    await page.waitForTimeout(WAIT_AFTER_LOAD);

    // 先提取初始内容
    let content = await extractContent(page);

    // 如果初始内容太少，尝试等待更长时间
    if (content.text.length < 200) {
      await page.waitForTimeout(3000);
      content = await extractContent(page);
    }

    // 如果文本仍然少，尝试点击预决算 tab
    if (content.text.length < 200) {
      const clicked = await tryClickBudgetTabs(page);
      if (clicked) {
        content = await extractContent(page);
      }
    }

    // 更新记录
    const oldLen = (r.pageTextSnippet || '').length;
    if (content.text.length > oldLen) {
      r.pageTitle = content.title || r.pageTitle;
      r.pageTextSnippet = content.text;
      r.breadcrumbs = content.breadcrumbs || r.breadcrumbs;
      r.metaKeywords = content.keywords || r.metaKeywords;
    }
    r.httpStatus = r.httpStatus || 200;
    r.fetchError = null;

    // 重新诊断
    runFullDiagnosis(r);
    r.diagnosisLayer = 3;
    r.needsLayer3 = false;

    return true;
  } catch (err) {
    // Playwright 也失败
    r.fetchError = r.fetchError || err.message?.slice(0, 200);
    runFullDiagnosis(r);
    r.diagnosisLayer = 3;
    r.needsLayer3 = false;
    return false;
  }
}

async function main() {
  const data = loadDiagnosisData(__dirname);
  const records = data.records;

  const toProcess = records.filter(r => r.needsLayer3);
  console.log(`第 3 层：共 ${toProcess.length} 条需要 Playwright 渲染`);

  if (toProcess.length === 0) {
    console.log('  无需处理，跳过。');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    ignoreHTTPSErrors: true,
  });

  let processed = 0;
  let improved = 0;

  // 串行处理（Playwright 页面不适合高并发）
  for (const r of toProcess) {
    const page = await context.newPage();
    try {
      const ok = await processRecord(page, r);
      if (ok) improved++;
    } finally {
      await page.close();
    }

    processed++;
    if (processed % 5 === 0) {
      console.log(`  进度：${processed}/${toProcess.length} — 改善 ${improved} 条`);
      saveDiagnosisData(__dirname, data);
    }
  }

  await context.close();
  await browser.close();
  saveDiagnosisData(__dirname, data);

  console.log(`\n✓ 第 3 层完成：处理 ${processed} 条，改善 ${improved} 条`);
}

main().catch(err => {
  console.error('第 3 层执行失败：', err);
  process.exit(1);
});
