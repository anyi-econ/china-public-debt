/**
 * Regenerate download-log.csv from the current celma-policy-dynamics.json.
 * Ensures CSV matches actual JSON state (after retries updated download_status).
 */
import { readFileSync, writeFileSync } from "node:fs";

const JSON_PATH = "data/celma-policy-dynamics.json";
const CSV_PATH = "data/celma-major-events-attachments/download-log.csv";

function escapeCSV(val) {
  const s = String(val ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

const header = ["标题", "页面 url", "附件显示文件名", "附件 url", "下载是否成功", "失败原因", "本地文件路径"];
const rows = [header.map(escapeCSV).join(",")];

let success = 0, failed = 0, total = 0;

for (const item of data.items) {
  if (!item.attachments || item.attachments.length === 0) continue;
  for (const att of item.attachments) {
    total++;
    const ok = att.download_status === "success";
    if (ok) success++; else failed++;
    rows.push([
      escapeCSV(item.title),
      escapeCSV(item.url),
      escapeCSV(att.display_name),
      escapeCSV(att.url),
      escapeCSV(ok ? "yes" : "no"),
      escapeCSV(ok ? "" : (att.error || "download failed")),
      escapeCSV(ok ? (att.local_path || "") : ""),
    ].join(","));
  }
}

writeFileSync(CSV_PATH, rows.join("\n"), "utf8");
console.log(`✓ CSV regenerated: ${total} rows (success: ${success}, failed: ${failed})`);
