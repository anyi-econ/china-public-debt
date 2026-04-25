#!/usr/bin/env node
/** Drop cached `no-disclosure-route` results so probe-disclosure-fallback retries
 * them against the expanded constructed-paths list.
 */
import fs from 'node:fs';
const F = 'scripts/website_management/policy-disclosure-fallback-results.json';
const arr = JSON.parse(fs.readFileSync(F, 'utf8'));
const before = arr.length;
const kept = arr.filter((r) => r.picked || !/no-disclosure-route/.test(r.reason || ''));
fs.writeFileSync(F, JSON.stringify(kept, null, 2), 'utf8');
console.log(`cache: ${before} -> ${kept.length}; invalidated ${before - kept.length} no-disclosure-route entries`);
