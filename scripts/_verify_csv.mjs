import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const csv = readFileSync("data/celma-major-events-attachments/download-log.csv", "utf8");
const csvLines = csv.trim().split("\n");
console.log("CSV rows (incl header):", csvLines.length);

// Parse CSV: count success/fail
let csvSuccess = 0, csvFail = 0;
for (let i = 1; i < csvLines.length; i++) {
  // 5th field is "yes" or "no"
  const fields = csvLines[i].match(/"([^"]*)"/g);
  if (fields && fields.length >= 5) {
    const status = fields[4].replace(/"/g, "");
    if (status === "yes") csvSuccess++;
    else csvFail++;
  }
}
console.log("CSV success:", csvSuccess, "fail:", csvFail, "total:", csvSuccess + csvFail);

const d = JSON.parse(readFileSync("data/celma-policy-dynamics.json", "utf8"));
let ja = 0;
for (const it of d.items) {
  if (it.attachments) ja += it.attachments.length;
}
console.log("JSON attachment records:", ja);

let js = 0, jf = 0;
for (const it of d.items) {
  if (!it.attachments) continue;
  for (const a of it.attachments) {
    if (a.download_status === "success") js++;
    else if (a.download_status === "failed") jf++;
  }
}
console.log("JSON success:", js, "fail:", jf, "total:", js + jf);

// Count actual files on disk
const base = "data/celma-major-events-attachments";
const entries = readdirSync(base, { withFileTypes: true });
let diskFiles = 0, emptyFolders = 0;
for (const e of entries) {
  if (e.isDirectory()) {
    const files = readdirSync(path.join(base, e.name));
    if (files.length === 0) emptyFolders++;
    diskFiles += files.length;
  }
}
console.log("Disk files:", diskFiles, "Empty folders:", emptyFolders);

// Check: are all CSV "yes" files actually on disk?
let csvMissing = 0, csvExtra = 0;
const diskPaths = new Set();
for (const e of entries) {
  if (e.isDirectory()) {
    const files = readdirSync(path.join(base, e.name));
    for (const f of files) {
      diskPaths.add(`data/celma-major-events-attachments/${e.name}/${f}`);
    }
  }
}

for (let i = 1; i < csvLines.length; i++) {
  const fields = csvLines[i].match(/"([^"]*)"/g);
  if (!fields || fields.length < 7) continue;
  const status = fields[4].replace(/"/g, "");
  const localPath = fields[6].replace(/"/g, "");
  if (status === "yes" && localPath && !diskPaths.has(localPath)) {
    csvMissing++;
    if (csvMissing <= 5) console.log("  CSV says success but missing on disk:", localPath.slice(0, 80));
  }
}
if (csvMissing > 5) console.log("  ... and", csvMissing - 5, "more");
console.log("CSV 'yes' but not on disk:", csvMissing);

// Check JSON success but not on disk
let jsonMissing = 0;
for (const it of d.items) {
  if (!it.attachments) continue;
  for (const a of it.attachments) {
    if (a.download_status === "success" && a.local_path && !diskPaths.has(a.local_path)) {
      jsonMissing++;
      if (jsonMissing <= 5) console.log("  JSON says success but missing:", a.local_path?.slice(0, 80));
    }
  }
}
if (jsonMissing > 5) console.log("  ... and", jsonMissing - 5, "more");
console.log("JSON 'success' but not on disk:", jsonMissing);
