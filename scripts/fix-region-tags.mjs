/**
 * One-time script: Fix province tags in celma-policy-dynamics.json.
 * The old extractRegionFromText used title+context, which picked up "新疆维吾尔自治区"
 * from the CELMA site header. This script re-extracts region from title only.
 */
import { readFileSync, writeFileSync } from "node:fs";

const JSON_PATH = "data/celma-policy-dynamics.json";

const REGION_CANDIDATES = [
  "新疆生产建设兵团",
  "新疆兵团",
  "内蒙古自治区",
  "广西壮族自治区",
  "西藏自治区",
  "宁夏回族自治区",
  "新疆维吾尔自治区",
  "北京市", "天津市", "上海市", "重庆市",
  "河北省", "山西省", "辽宁省", "吉林省", "黑龙江省",
  "江苏省", "浙江省", "安徽省", "福建省", "江西省",
  "山东省", "河南省", "湖北省", "湖南省", "广东省",
  "海南省", "四川省", "贵州省", "云南省", "陕西省",
  "甘肃省", "青海省",
  "大连市", "青岛市", "宁波市", "厦门市", "深圳市",
].sort((a, b) => b.length - a.length);

// Short-name → full-name mapping for title extraction
const SHORT_TO_FULL = {
  "内蒙古": "内蒙古自治区",
  "广西": "广西壮族自治区",
  "西藏": "西藏自治区",
  "宁夏": "宁夏回族自治区",
  "新疆": "新疆维吾尔自治区",
  "北京": "北京市", "天津": "天津市", "上海": "上海市", "重庆": "重庆市",
  "河北": "河北省", "山西": "山西省", "辽宁": "辽宁省", "吉林": "吉林省", "黑龙江": "黑龙江省",
  "江苏": "江苏省", "浙江": "浙江省", "安徽": "安徽省", "福建": "福建省", "江西": "江西省",
  "山东": "山东省", "河南": "河南省", "湖北": "湖北省", "湖南": "湖南省", "广东": "广东省",
  "海南": "海南省", "四川": "四川省", "贵州": "贵州省", "云南": "云南省", "陕西": "陕西省",
  "甘肃": "甘肃省", "青海": "青海省",
  "大连": "大连市", "青岛": "青岛市", "宁波": "宁波市", "厦门": "厦门市", "深圳": "深圳市",
};

function extractRegionFromTitle(title) {
  // First try full names
  for (const candidate of REGION_CANDIDATES) {
    if (title.includes(candidate)) {
      return { region: candidate, region_normalized: candidate };
    }
  }

  // Then try short names (sorted longest first to avoid "山西" matching before "山西省")
  const shortNames = Object.keys(SHORT_TO_FULL).sort((a, b) => b.length - a.length);
  for (const short of shortNames) {
    if (title.includes(short)) {
      const full = SHORT_TO_FULL[short];
      return { region: full, region_normalized: full };
    }
  }

  // Central government keywords
  if (/财政部|国务院|全国人大|国家发展改革委/.test(title)) {
    return { region: "全国", region_normalized: "全国" };
  }

  return null; // No region found in title
}

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

let changed = 0;
const migrations = [];

for (const item of data.items) {
  const result = extractRegionFromTitle(item.title);
  if (!result) continue; // Keep existing region if title gives no result

  const oldRegion = item.region_normalized || "(none)";
  if (oldRegion !== result.region_normalized) {
    changed++;
    migrations.push({
      title: item.title.slice(0, 55),
      from: oldRegion,
      to: result.region_normalized,
    });
    item.region = result.region;
    item.region_normalized = result.region_normalized;
  }
}

// Distribution
const dist = {};
for (const item of data.items) {
  const r = item.region_normalized || "(none)";
  dist[r] = (dist[r] || 0) + 1;
}

console.log(`=== 省份标签修复 ===`);
console.log(`总共 ${data.items.length} 条，${changed} 条省份标签变更\n`);

console.log("省份分布:");
for (const [k, v] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

if (migrations.length > 0 && migrations.length <= 30) {
  console.log(`\n变更明细 (${migrations.length} 条):`);
  for (const m of migrations) {
    console.log(`  [${m.from}] → [${m.to}] ${m.title}`);
  }
} else if (migrations.length > 30) {
  console.log(`\n变更明细 (前30条 / 共${migrations.length}条):`);
  for (const m of migrations.slice(0, 30)) {
    console.log(`  [${m.from}] → [${m.to}] ${m.title}`);
  }
}

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
console.log("\n✓ 已保存 JSON");
