#!/usr/bin/env node
/** Bucket all currently-accepted policy URL paths for pattern mining. */
import fs from 'node:fs';
const src = fs.readFileSync('data/website-policy.ts', 'utf8');
const m = src.match(/POLICY_URL_MAP[^=]*=\s*\{([\s\S]*?)\n\};?/);
if (!m) { console.error('not parsed'); process.exit(1); }
const paths = new Map();
for (const line of m[1].split('\n')) {
  const u = line.match(/"https?:\/\/[^"]+"/);
  if (!u) continue;
  try {
    const url = new URL(u[0].slice(1, -1));
    let p = url.pathname.replace(/\d{4,}/g, '*').replace(/[a-z0-9]{8,}/gi, '*');
    paths.set(p, (paths.get(p) || 0) + 1);
  } catch {}
}
const sorted = [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
for (const [p, c] of sorted) console.log(String(c).padStart(5), p);
