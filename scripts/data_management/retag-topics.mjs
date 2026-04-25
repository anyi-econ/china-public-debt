/**
 * One-time script: Re-tag topics for all 重大事项 items using improved rules.
 * Uses both title and attachment display names for classification.
 */
import { readFileSync, writeFileSync } from "node:fs";

const JSON_PATH = "data/celma-policy-dynamics.json";

const TOPIC_RULES = [
  // 顺序重要：先匹配具体的，再匹配宽泛的
  ["资金用途调整", /调整(?:部分|新增)?(?:地方)?政府?(?:专项)?债券(?:资金)?用途|用途调整|调整.*用途|债券用途|资金用途|一案两书|一案二书|调整.*专项债券|调整.*债券项目|调整.*用作.*资本金|资金调整|调整使用情况/],
  ["跟踪评级", /跟踪评级|评级报告|信用评级|评级公告/],
  ["偿还与置换", /提前偿还|偿还.*债券|置换.*债券|再融资.*债券|还本.*调整|还本金额/],
  ["项目变更", /重大事项(?:调整|变更)|项目变更|变更情况|变更.*披露|变更为.*债券/],
  ["发行与披露", /发行.*(?:通知|公告|结果|有关事项)|承销团|信息披露文件|披露文件|募集说明书|法律意见书|财务评价报告|实施方案|存续期公开|存续期信息|簿记建档|发债|自行发债|发行的新增.*债券|招标|柜台业务/],
  ["信息披露与更正", /更正|更正声明|信息的公告|收款账户/],
  ["债务限额", /债务限额/],
  ["隐性债务", /隐性债务|违法违规融资|问责.*案例/],
  ["预决算与财政数据", /经济.*(?:财政|数据)|财政.*(?:经济|数据)|预算.*收支|公共预算/],
  ["人事变动", /董事.*变动|总经理.*变动|人事.*变动/],
];

function determineTopic(title, attachmentNames = []) {
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(title)) return topic;
  }
  const combined = title + " " + attachmentNames.join(" ");
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(combined)) return topic;
  }
  return "其他";
}

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

const changes = { total: 0, changed: 0 };
const topicCounts = {};
const migrations = [];

for (const item of data.items) {
  if (item.category_level2 !== "重大事项") continue;
  changes.total++;

  const attNames = (item.attachments || []).map(a => a.display_name || "");
  const oldTopic = item.topic || "(none)";
  const newTopic = determineTopic(item.title, attNames);

  if (oldTopic !== newTopic) {
    changes.changed++;
    migrations.push({ title: item.title.substring(0, 50), from: oldTopic, to: newTopic });
    item.topic = newTopic;
    // Update summary if it contains old topic
    if (item.summary && item.summary.includes(oldTopic)) {
      item.summary = item.summary.replace(oldTopic, newTopic);
    }
  }

  topicCounts[newTopic] = (topicCounts[newTopic] || 0) + 1;
}

console.log(`\n=== 重新分类结果 ===`);
console.log(`总共 ${changes.total} 条重大事项，${changes.changed} 条主题发生变化\n`);

console.log("主题分布:");
for (const [topic, count] of Object.entries(topicCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${topic}: ${count}`);
}

if (migrations.length > 0) {
  console.log(`\n变更明细 (${migrations.length} 条):`);
  for (const m of migrations) {
    console.log(`  [${m.from}] → [${m.to}] ${m.title}`);
  }
}

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
console.log("\n✓ 已保存 JSON");
