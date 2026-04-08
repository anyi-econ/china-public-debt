/**
 * Parallel retry script for failed CELMA attachment downloads.
 * - Checks disk first: skip if file already exists with size > 0
 * - Streaming download to disk (handles 800+ MB files)
 * - Idle timeout: abort if no data received for 60s (not absolute timeout)
 * - 30s connection timeout for initial HTTP response
 * - Saves JSON after every N successes
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, appendFileSync, createWriteStream, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import { Writable } from "node:stream";

const LOG_FILE = "scripts/_retry_log.txt";
function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

const JSON_PATH = "data/celma-policy-dynamics.json";
const CONCURRENCY = parseInt(process.env.DL_CONCURRENCY || "3", 10);
const SAVE_EVERY = 3;
const CONNECT_TIMEOUT = 30_000;  // 30s to get HTTP response
const IDLE_TIMEOUT = 60_000;     // 60s without data → abort

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

/** Stream download to disk with idle timeout */
async function downloadToFile(url, destPath) {
  const controller = new AbortController();

  // Connection timeout
  const connTimer = setTimeout(() => controller.abort(), CONNECT_TIMEOUT);
  let resp;
  try {
    resp = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": UA, referer: "https://www.celma.org.cn/" },
    });
  } finally {
    clearTimeout(connTimer);
  }

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const contentLength = parseInt(resp.headers.get("content-length") || "0", 10);
  const reader = resp.body.getReader();
  const ws = createWriteStream(destPath);

  let received = 0;
  let idleTimer;

  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      controller.abort();
      reader.cancel();
    }, IDLE_TIMEOUT);
  }

  try {
    resetIdle();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetIdle();
      received += value.length;
      // Backpressure: wait for drain if needed
      if (!ws.write(value)) {
        await new Promise(r => ws.once("drain", r));
      }
    }
    clearTimeout(idleTimer);

    await new Promise((resolve, reject) => {
      ws.end(() => resolve());
      ws.on("error", reject);
    });

    return { received, contentLength };
  } catch (err) {
    clearTimeout(idleTimer);
    ws.destroy();
    // Clean up partial file
    try { unlinkSync(destPath); } catch {}
    throw err;
  }
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").substring(0, 200);
}

function findExistingFile(folderPath, fileName) {
  if (!existsSync(folderPath)) return null;
  const exact = join(folderPath, fileName);
  if (existsSync(exact) && statSync(exact).size > 0) return fileName;
  const stem = fileName.replace(/\.[^.]+$/, "");
  try {
    const files = readdirSync(folderPath);
    for (const f of files) {
      if (f.replace(/\.[^.]+$/, "") === stem) {
        const fp = join(folderPath, f);
        if (statSync(fp).size > 0) return f;
      }
    }
  } catch {}
  return null;
}

let dirty = 0;
let data;

function saveJSON() {
  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
  dirty = 0;
}

function markSuccess(item, att, fileName, filePath) {
  att.local_file_name = fileName;
  att.local_file_path = filePath;
  att.download_status = "success";
  att.error = null;
  item.attachment_count = item.attachments.filter(a => a.download_status === "success").length;
  dirty++;
  if (dirty >= SAVE_EVERY) saveJSON();
}

function formatBytes(b) {
  if (b > 1e9) return (b / 1e9).toFixed(1) + "GB";
  if (b > 1e6) return (b / 1e6).toFixed(1) + "MB";
  if (b > 1e3) return (b / 1e3).toFixed(1) + "KB";
  return b + "B";
}

async function main() {
  data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

  const tasks = [];
  for (const item of data.items) {
    if (!item.attachments) continue;
    for (const att of item.attachments) {
      if (att.download_status === "failed") {
        tasks.push({ item, att });
      }
    }
  }

  log(`共 ${tasks.length} 个失败附件，并发数: ${CONCURRENCY}，空闲超时: ${IDLE_TIMEOUT/1000}s`);
  if (tasks.length === 0) return;

  let skipCount = 0;
  let successCount = 0;
  let failCount = 0;
  let processed = 0;

  let running = 0;
  let taskIndex = 0;

  await new Promise((resolveAll) => {
    function tryNext() {
      while (running < CONCURRENCY && taskIndex < tasks.length) {
        const idx = taskIndex++;
        const { item, att } = tasks[idx];
        running++;

        (async () => {
          const folderPath = item.local_attachment_folder;
          const fileName = sanitizeFilename(att.display_name || basename(att.url));
          const filePath = join(folderPath, fileName);

          try {
            const existing = findExistingFile(folderPath, fileName);
            if (existing) {
              markSuccess(item, att, existing, join(folderPath, existing));
              skipCount++;
              log(`⊘ [${processed + 1}/${tasks.length}] 已存在跳过: ${existing.substring(0, 60)}`);
            } else {
              mkdirSync(folderPath, { recursive: true });
              await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
              const start = Date.now();
              const { received, contentLength } = await downloadToFile(att.url, filePath);
              const elapsed = ((Date.now() - start) / 1000).toFixed(1);
              markSuccess(item, att, fileName, filePath);
              successCount++;
              log(`✓ [${processed + 1}/${tasks.length}] ${fileName.substring(0, 50)} ${formatBytes(received)} ${elapsed}s`);
            }
          } catch (err) {
            att.error = err.message || String(err);
            failCount++;
            log(`✗ [${processed + 1}/${tasks.length}] ${(att.display_name || '').substring(0, 50)} → ${(err.message || '').substring(0, 60)}`);
          }

          processed++;
          running--;

          if (processed === tasks.length) {
            saveJSON();
            resolveAll();
          } else {
            tryNext();
          }
        })();
      }
    }

    tryNext();
  });

  log(`\n完成！跳过(已存在): ${skipCount}, 新下载: ${successCount}, 仍失败: ${failCount}, 总计: ${tasks.length}`);

  let totalAttachments = 0, totalSuccess = 0;
  data.items.forEach(it => {
    if (!it.attachments) return;
    totalAttachments += it.attachments.length;
    totalSuccess += it.attachments.filter(a => a.download_status === "success").length;
  });
  log(`全局附件统计: ${totalSuccess}/${totalAttachments} 成功`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
