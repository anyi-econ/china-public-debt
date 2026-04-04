/**
 * 分析 validated-urls.json，标记假阳性（域名冲突等）
 */
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('scripts/validated-urls.json', 'utf-8'));

// Known domain collision patterns - these URLs belong to wrong cities
const FALSE_POSITIVE_PATTERNS = [
  { pattern: 'czj.cq.gov.cn', reason: '重庆市财政局域名（非目标城市）' },
  { pattern: 'czj.sh.gov.cn', reason: '上海市财政局域名' },
  { pattern: 'czt.ln.gov.cn', reason: '辽宁省财政厅域名' },
  { pattern: 'czj.dl.gov.cn', reason: '大连市财政局域名' },
  { pattern: 'jiangxi.gov.cn', reason: '江西省政府域名' },
  { pattern: 'www.gy.gov.cn', reason: '贵阳市/广元市政府域名' },
  { pattern: 'zwfw.hlj.gov.cn', reason: '黑龙江政务服务域名' },
  { pattern: 'zwfw.yn.gov.cn', reason: '云南政务服务域名' },
  { pattern: 'zwfw.gxzf.gov.cn', reason: '广西政务服务域名' },
];

// Pages that aren't actually fiscal budget disclosure pages
const NOT_BUDGET_PATTERNS = [
  { test: (info) => info.linkText?.includes('意见征集'), reason: '意见征集页，非预决算' },
  { test: (info) => info.linkText?.includes('征集调查'), reason: '征集调查页，非预决算' },
  { test: (info) => info.linkText?.includes('以案释法'), reason: '案例页，非预决算' },
  { test: (info) => info.linkText?.includes('答记者问') && info.score < 5, reason: '新闻解读页' },
];

const results = { confirmed: [], likely: [], falsePositive: [], notBudget: [], missing: [] };

for (const [prov, cities] of Object.entries(data)) {
  for (const [city, info] of Object.entries(cities)) {
    if (!info.url || info.score === 0) {
      results.missing.push({ prov, city, note: info.note || '' });
      continue;
    }

    // Check false positives
    const fp = FALSE_POSITIVE_PATTERNS.find(p => info.url.includes(p.pattern));
    if (fp) {
      results.falsePositive.push({ prov, city, url: info.url, reason: fp.reason });
      continue;
    }

    // Check not-budget pages
    const nb = NOT_BUDGET_PATTERNS.find(p => p.test(info));
    if (nb) {
      results.notBudget.push({ prov, city, url: info.url, reason: nb.reason, score: info.score });
      continue;
    }

    if (info.score >= 5) {
      results.confirmed.push({ prov, city, url: info.url, source: info.source, score: info.score, linkText: info.linkText?.substring(0, 50) || '' });
    } else {
      results.likely.push({ prov, city, url: info.url, source: info.source || '', score: info.score, linkText: info.linkText?.substring(0, 50) || '' });
    }
  }
}

console.log('═══ 确认有效 ═══');
for (const r of results.confirmed) {
  console.log(`  ${r.prov} ${r.city}: ${r.url}`);
  console.log(`    [${r.source}, score=${r.score}] ${r.linkText}`);
}

console.log(`\n═══ 可能有效（需人工确认）═══`);
for (const r of results.likely) {
  console.log(`  ${r.prov} ${r.city}: ${r.url}`);
  console.log(`    [${r.source}, score=${r.score}] ${r.linkText}`);
}

console.log(`\n═══ 假阳性（域名冲突）═══`);
for (const r of results.falsePositive) {
  console.log(`  ${r.prov} ${r.city}: ${r.url} → ${r.reason}`);
}

console.log(`\n═══ 非预决算页面 ═══`);
for (const r of results.notBudget) {
  console.log(`  ${r.prov} ${r.city}: ${r.url} → ${r.reason}`);
}

console.log(`\n═══ 未找到 ═══`);
for (const r of results.missing) {
  console.log(`  ${r.prov} ${r.city} (${r.note})`);
}

console.log(`\n═══ 汇总 ═══`);
console.log(`确认有效: ${results.confirmed.length}`);
console.log(`可能有效: ${results.likely.length}`);
console.log(`假阳性: ${results.falsePositive.length}`);
console.log(`非预决算: ${results.notBudget.length}`);
console.log(`未找到: ${results.missing.length}`);
console.log(`总计: ${results.confirmed.length + results.likely.length + results.falsePositive.length + results.notBudget.length + results.missing.length}`);
