import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const jsonPath = 'data/celma-policy-dynamics.json';
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const root = 'data/celma-major-events-attachments';

function saveJSON() {
  data.updatedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
}

function rebuildLog() {
  const lines = ['"标题","页面 url","附件显示文件名","附件 url","下载是否成功","失败原因","本地文件路径"'];
  for (const item of data.items) {
    if (!item.attachments) continue;
    for (const att of item.attachments) {
      const ok = att.download_status === 'success' ? 'yes' : 'no';
      const err = (att.error || '').replace(/"/g, '""');
      const localPath = att.local_file_path || '';
      lines.push(`"${item.title}","${item.url}","${att.display_name}","${att.url}","${ok}","${err}","${localPath}"`);
    }
  }
  writeFileSync(join(root, 'download-log.csv'), lines.join('\n'), 'utf8');
  return lines.length - 1;
}

async function downloadFile(url, destPath, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    writeFileSync(destPath, buf);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  } finally {
    clearTimeout(timer);
  }
}

function getTimeout(filename) {
  if (!filename) return 30000;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) return 120000;
  return 30000;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========== Retry all failed ==========
async function main() {
  const henanUrls = new Set([
    'https://www.celma.org.cn/zdsxpl/59601.jhtml',
    'https://www.celma.org.cn/zdsxpl/59602.jhtml'
  ]);

  let retried = 0, fixed = 0, errors = 0;

  for (const item of data.items) {
    if (!item.attachments) continue;
    if (henanUrls.has(item.url)) continue; // already handled

    const failedAtts = item.attachments.filter(a => a.download_status === 'failed');
    if (failedAtts.length === 0) continue;

    const folder = item.local_attachment_folder;
    if (!folder) continue;

    try {
      mkdirSync(folder, { recursive: true });
    } catch (e) {
      console.log(`  跳过 (无法创建文件夹): ${folder}`);
      continue;
    }

    for (const att of failedAtts) {
      retried++;
      await sleep(500 + Math.random() * 500);
      const fileName = att.display_name || 'unknown';
      const destPath = join(folder, fileName);
      const timeout = getTimeout(fileName);

      try {
        const result = await downloadFile(att.url, destPath, timeout);
        if (result.ok) {
          att.download_status = 'success';
          att.error = null;
          att.local_file_name = fileName;
          att.local_file_path = destPath;
          att.skipped = false;
          fixed++;
          console.log(`[${retried}] OK ${fileName.slice(0, 60)}`);
        } else {
          att.error = result.error;
          errors++;
          if (retried <= 20 || retried % 50 === 0) {
            console.log(`[${retried}] FAIL ${fileName.slice(0, 40)} -> ${(result.error || '').slice(0, 50)}`);
          }
        }
      } catch (e) {
        errors++;
        if (retried <= 20 || retried % 50 === 0) {
          console.log(`[${retried}] ERR ${fileName.slice(0, 40)} -> ${String(e).slice(0, 50)}`);
        }
      }
    }

    // Update counts for this item
    item.attachment_count = item.attachments.filter(a => a.download_status === 'success').length;
    item.snippet = item.attachment_count > 0
      ? `已同步 ${item.attachment_count} 个附件到本地目录。`
      : '当前页面未发现可下载附件或下载全部失败。';

    // Incremental save every 100 retries
    if (retried % 100 === 0) {
      saveJSON();
      console.log(`  --- 中间保存 @ ${retried}, 修复 ${fixed} ---`);
    }
  }

  console.log(`\n重试完成: ${retried} 个, 修复 ${fixed} 个, 仍失败 ${errors} 个`);

  // Final save
  saveJSON();
  const totalRecords = rebuildLog();
  const totalFailed = data.items.reduce((n, i) => n + (i.attachments || []).filter(a => a.download_status === 'failed').length, 0);
  const totalDirs = readdirSync(root).filter(d => { try { return statSync(join(root, d)).isDirectory(); } catch { return false; } }).length;
  console.log(`JSON saved, log ${totalRecords} records`);
  console.log(`Final failed: ${totalFailed}, dirs: ${totalDirs}`);
}

main().then(() => console.log('Done!')).catch(e => { console.error('FATAL:', e); saveJSON(); rebuildLog(); console.log('Saved despite error'); process.exit(1); });
