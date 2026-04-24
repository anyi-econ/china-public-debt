/**
 * 第 1 层：批处理 HTTP 抓取与初步分析
 *
 * 对全部有效链接进行 HTTP GET，提取页面标题、可见正文、面包屑等。
 * 用统一规则完成大部分记录的字段判断。
 * 支持断点续跑：已处理的记录不会重复抓取。
 *
 * 运行：node scripts/website_management/layer1-batch-fetch.mjs
 *
 * 输入：scripts/website_management/diagnosis-data.json
 * 输出：同文件（增量更新）
 */

import { load } from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  loadDiagnosisData, saveDiagnosisData, runFullDiagnosis,
} from './diagnosis-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════ 配置 ═══════
const CONCURRENCY = 15;
const TIMEOUT_MS = 20000;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB
const SAVE_INTERVAL = 50;          // 每处理 N 条保存一次

// ═══════ HTTP 抓取 ═══════

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      headers: HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    const status = resp.status;
    const contentType = resp.headers.get('content-type') || '';
    const responseUrl = resp.url;

    // 只处理 HTML
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml') && status === 200) {
      return { status, contentType, responseUrl, html: '', error: null };
    }

    // 读取 body（限制大小）
    const buffer = Buffer.from(await resp.arrayBuffer());
    const truncated = buffer.length > MAX_BODY_BYTES ? buffer.slice(0, MAX_BODY_BYTES) : buffer;

    // 检测编码
    let charset = 'utf-8';
    const ctMatch = contentType.match(/charset=([^\s;]+)/i);
    if (ctMatch) charset = ctMatch[1].toLowerCase();

    // 先尝试检测 <meta charset>
    const rawPeek = truncated.toString('latin1');
    const metaMatch = rawPeek.match(/<meta[^>]+charset=["']?([^"';\s>]+)/i);
    if (metaMatch) charset = metaMatch[1].toLowerCase();

    // 解码
    const normalizedCharset = charset.replace(/gb2312/i, 'gbk').replace(/gb_2312-80/i, 'gbk');
    let html;
    try {
      const decoder = new TextDecoder(normalizedCharset);
      html = decoder.decode(truncated);
    } catch {
      html = truncated.toString('utf-8');
    }

    return { status, contentType, responseUrl, html, error: null };
  } catch (err) {
    clearTimeout(timer);
    const msg = err.name === 'AbortError' ? 'timeout' : (err.message || String(err));
    return { status: null, contentType: null, responseUrl: null, html: '', error: msg };
  }
}

// ═══════ HTML 解析 ═══════

function parseHtml(html) {
  if (!html) return { title: '', text: '', breadcrumbs: '', keywords: '' };

  const $ = load(html);

  // 标题
  const title = $('title').first().text().trim().slice(0, 500);

  // Meta keywords
  const keywords = ($('meta[name="keywords"]').attr('content') || '').trim().slice(0, 500);

  // 面包屑（常见 class/id）
  let breadcrumbs = '';
  const bcSelectors = [
    '.breadcrumb', '.location', '.position', '.crumbs', '.nav-path',
    '.place', '.currentPos', '.column-path', '#position', '#location',
    '.weizhi', '.wzmap', '.daohang',
  ];
  for (const sel of bcSelectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 3) {
      breadcrumbs = el.text().replace(/\s+/g, ' ').trim().slice(0, 500);
      break;
    }
  }

  // 可见正文（去脚本/样式/导航）
  $('script, style, noscript, nav, header, footer, .footer, .header').remove();
  let text = $('body').text()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 8000);

  return { title, text, breadcrumbs, keywords };
}

// ═══════ 并发控制 ═══════

async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

// ═══════ 主流程 ═══════

async function main() {
  const data = loadDiagnosisData(__dirname);
  const records = data.records;
  const total = records.length;

  // 筛选需要处理的记录
  const toProcess = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (r.diagnosisLayer !== null) continue; // 已处理
    if (!r.url) {
      // 无链接：直接标记
      r.pageAvailable = '否';
      r.regionMatch = '存疑';
      r.pageType = '存疑';
      r.directAccess = '存疑';
      r.bothBudgetAndFinal = '存疑';
      r.hasSubordinateContent = '存疑';
      r.diagnosisNote = '无链接';
      r.needsManualReview = '否';
      r.diagnosisLayer = 0;
      continue;
    }
    toProcess.push(i);
  }

  console.log(`第 1 层：共 ${total} 条，需处理 ${toProcess.length} 条（已跳过 ${total - toProcess.length} 条）`);

  let processed = 0;
  let lastSave = 0;

  const tasks = toProcess.map(idx => async () => {
    const r = records[idx];
    const result = await fetchPage(r.url);

    r.httpStatus = result.status;
    r.fetchError = result.error;
    r.responseUrl = result.responseUrl;
    r.contentType = result.contentType;

    if (result.html) {
      const parsed = parseHtml(result.html);
      r.pageTitle = parsed.title;
      r.pageTextSnippet = parsed.text;
      r.breadcrumbs = parsed.breadcrumbs;
      r.metaKeywords = parsed.keywords;
    }

    // 执行诊断
    runFullDiagnosis(r);
    r.diagnosisLayer = 1;

    // 标记是否需要后续层
    // 需要 Layer 2：可访问但内容不足以稳定判断
    const textLen = (r.pageTextSnippet || '').length;
    if (r.pageAvailable === '是' && textLen < 200) {
      r.needsLayer2 = true;
    }
    if (r.pageAvailable === '存疑') {
      r.needsLayer2 = true;
    }
    // 多项存疑
    const uncertainFields = [r.regionMatch, r.pageType, r.directAccess].filter(v => v === '存疑').length;
    if (r.pageAvailable === '是' && uncertainFields >= 2) {
      r.needsLayer2 = true;
    }

    processed++;
    if (processed % 20 === 0) {
      const pct = ((processed / toProcess.length) * 100).toFixed(1);
      console.log(`  进度：${processed}/${toProcess.length} (${pct}%) — 当前：${r.path}`);
    }

    // 定期保存
    if (processed - lastSave >= SAVE_INTERVAL) {
      lastSave = processed;
      saveDiagnosisData(__dirname, data);
    }
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  // 最终保存
  saveDiagnosisData(__dirname, data);

  // 统计
  const needL2 = records.filter(r => r.needsLayer2).length;
  const needL3 = records.filter(r => r.needsLayer3).length;
  const available = records.filter(r => r.pageAvailable === '是').length;
  const unavailable = records.filter(r => r.pageAvailable === '否').length;
  const uncertain = records.filter(r => r.pageAvailable === '存疑').length;

  console.log(`\n✓ 第 1 层完成：共处理 ${processed} 条`);
  console.log(`  可用 ${available} | 不可用 ${unavailable} | 存疑 ${uncertain}`);
  console.log(`  需第 2 层补抓 ${needL2} 条 | 需第 3 层渲染 ${needL3} 条`);
}

main().catch(err => {
  console.error('第 1 层执行失败：', err);
  process.exit(1);
});
