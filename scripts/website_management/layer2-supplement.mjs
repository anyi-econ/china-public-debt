/**
 * 第 2 层：补充抓取 — 对第 1 层无法稳定判断的页面做增强抓取
 *
 * 策略：
 * - 使用更宽松的 User-Agent 重新请求
 * - 处理 meta refresh 跳转
 * - 尝试从 iframe src 中提取内容
 * - 对编码异常页面重新尝试 GBK 解码
 * - 重新运行诊断规则
 *
 * 运行：node scripts/website_management/layer2-supplement.mjs
 *
 * 输入/输出：scripts/website_management/diagnosis-data.json（增量更新）
 */

import { load } from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  loadDiagnosisData, saveDiagnosisData, runFullDiagnosis,
} from './diagnosis-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONCURRENCY = 8;
const TIMEOUT_MS = 25000;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
};

async function fetchWithDecode(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const truncated = buffer.length > MAX_BODY_BYTES ? buffer.slice(0, MAX_BODY_BYTES) : buffer;
    const ct = resp.headers.get('content-type') || '';

    // 尝试 UTF-8 和 GBK 两种解码
    let html;
    const raw = truncated.toString('latin1');
    const metaMatch = raw.match(/<meta[^>]+charset=["']?([^"';\s>]+)/i);
    const ctMatch = ct.match(/charset=([^\s;]+)/i);
    let charset = (metaMatch?.[1] || ctMatch?.[1] || 'utf-8').toLowerCase().replace(/gb2312|gb_2312-80/gi, 'gbk');

    try {
      html = new TextDecoder(charset).decode(truncated);
    } catch {
      html = new TextDecoder('utf-8', { fatal: false }).decode(truncated);
    }

    return { status: resp.status, html, url: resp.url, error: null };
  } catch (err) {
    clearTimeout(timer);
    return { status: null, html: '', url: null, error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

/** 检查 meta refresh 并跟踪跳转 */
function getMetaRefreshUrl(html, baseUrl) {
  const match = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\d+;\s*url=([^"'\s>]+)/i);
  if (!match) return null;
  try {
    return new URL(match[1], baseUrl).href;
  } catch {
    return null;
  }
}

/** 提取 iframe src */
function getMainIframeSrc(html, baseUrl) {
  const $ = load(html);
  const iframe = $('iframe[src]').filter((_, el) => {
    const w = $(el).attr('width');
    const h = $(el).attr('height');
    // 主内容 iframe 通常较大
    return (!w || parseInt(w) > 300) && (!h || parseInt(h) > 200);
  }).first();
  const src = iframe.attr('src');
  if (!src || src === 'about:blank') return null;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

function parseHtml(html) {
  if (!html) return { title: '', text: '', breadcrumbs: '', keywords: '' };
  const $ = load(html);
  const title = $('title').first().text().trim().slice(0, 500);
  const keywords = ($('meta[name="keywords"]').attr('content') || '').trim().slice(0, 500);

  let breadcrumbs = '';
  for (const sel of ['.breadcrumb', '.location', '.position', '.crumbs', '.place', '.currentPos', '#position', '.weizhi']) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 3) {
      breadcrumbs = el.text().replace(/\s+/g, ' ').trim().slice(0, 500);
      break;
    }
  }

  $('script, style, noscript, nav, header, footer').remove();
  const text = $('body').text().replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 8000);
  return { title, text, breadcrumbs, keywords };
}

async function processRecord(r) {
  // 第 1 次增强抓取
  let result = await fetchWithDecode(r.url);
  if (result.error) {
    // 第 1 层也失败了，不改动
    return false;
  }

  let html = result.html;
  let finalUrl = result.url;

  // meta refresh 跟踪（最多跟踪 1 次）
  const refreshUrl = getMetaRefreshUrl(html, finalUrl);
  if (refreshUrl) {
    const r2 = await fetchWithDecode(refreshUrl);
    if (!r2.error && r2.html.length > html.length) {
      html = r2.html;
      finalUrl = r2.url;
    }
  }

  // iframe 内容提取
  const iframeSrc = getMainIframeSrc(html, finalUrl);
  if (iframeSrc) {
    const r3 = await fetchWithDecode(iframeSrc);
    if (!r3.error && r3.html) {
      // 合并 iframe 内容
      html = html + '\n' + r3.html;
    }
  }

  // 解析
  const parsed = parseHtml(html);

  // 仅在新内容比旧内容更丰富时更新
  const oldLen = (r.pageTextSnippet || '').length;
  const newLen = parsed.text.length;

  if (newLen > oldLen) {
    r.httpStatus = result.status || r.httpStatus;
    r.responseUrl = finalUrl || r.responseUrl;
    r.pageTitle = parsed.title || r.pageTitle;
    r.pageTextSnippet = parsed.text;
    r.breadcrumbs = parsed.breadcrumbs || r.breadcrumbs;
    r.metaKeywords = parsed.keywords || r.metaKeywords;
  }

  // 重新诊断
  runFullDiagnosis(r);
  r.diagnosisLayer = 2;
  r.needsLayer2 = false;

  // 判断是否需要 Layer 3
  const textLen = (r.pageTextSnippet || '').length;
  if (r.pageAvailable === '存疑' || (r.pageAvailable === '是' && textLen < 200)) {
    r.needsLayer3 = true;
  }
  const uncertainFields = [r.regionMatch, r.pageType, r.directAccess].filter(v => v === '存疑').length;
  if (uncertainFields >= 2 && r.pageAvailable !== '否') {
    r.needsLayer3 = true;
  }

  return true;
}

async function runWithConcurrency(tasks, concurrency) {
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
}

async function main() {
  const data = loadDiagnosisData(__dirname);
  const records = data.records;

  const toProcess = records.filter(r => r.needsLayer2);
  console.log(`第 2 层：共 ${toProcess.length} 条需要补充抓取`);

  if (toProcess.length === 0) {
    console.log('  无需处理，跳过。');
    return;
  }

  let processed = 0;
  let improved = 0;

  const tasks = toProcess.map(r => async () => {
    const ok = await processRecord(r);
    if (ok) improved++;
    processed++;
    if (processed % 10 === 0) {
      console.log(`  进度：${processed}/${toProcess.length} — 改善 ${improved} 条`);
    }
    if (processed % 30 === 0) saveDiagnosisData(__dirname, data);
  });

  await runWithConcurrency(tasks, CONCURRENCY);
  saveDiagnosisData(__dirname, data);

  const needL3 = records.filter(r => r.needsLayer3).length;
  console.log(`\n✓ 第 2 层完成：处理 ${processed} 条，改善 ${improved} 条`);
  console.log(`  需第 3 层 Playwright 渲染 ${needL3} 条`);
}

main().catch(err => {
  console.error('第 2 层执行失败：', err);
  process.exit(1);
});
