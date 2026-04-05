/**
 * 政府官网信息检索数据
 *
 * 数据来源：基于 gov-website-links.ts 中的真实政府门户网站信息生成
 * 每条记录对应一个真实的政府门户网站入口，URL 均来自已验证的政府官网
 *
 * 后续扩展方向：
 * - 接入真实爬虫数据后，替换为实际抓取的文章条目
 * - 增加更多筛选维度（如部门、文号等）
 * - 支持全文检索
 */

import type { GovSearchItem, ContentScope, GovDocType, LeaderRole } from "@/lib/types";
import { GOV_WEBSITES, type GovWebsiteNode } from "@/data/gov-website-links";

/** 示例主题标签池 */
const TOPIC_POOL = [
  "人工智能", "新能源汽车", "低空经济", "生物医药", "集成电路",
  "招商引资", "园区建设", "重大项目", "营商环境", "财政金融",
  "数字经济", "绿色发展", "乡村振兴", "城市更新", "产业升级",
];

/** 文档类型池 */
const DOC_TYPES: GovDocType[] = ["领导活动", "其他新闻", "产业政策文件", "其他政策文件"];

/** 领导身份池 */
const LEADER_ROLES: LeaderRole[] = ["书记", "市长", "其他", "无"];

/** 内容范围池 */
const CONTENT_SCOPES: ContentScope[] = ["本地", "上级", "全国"];

/**
 * 基于行政区名称确定性地选取标签（非随机，保证每次构建结果一致）
 * 使用名称字符码的哈希来决定选择
 */
function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickFromPool<T>(pool: T[], name: string, offset: number, count: number = 1): T[] {
  const h = stableHash(name + offset);
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(pool[(h + i * 7) % pool.length]);
  }
  return [...new Set(results)];
}

/** 生成稳定的日期字符串（基于名称哈希，范围 2025-01 ~ 2026-03）*/
function stableDate(name: string, offset: number): string {
  const h = stableHash(name + "date" + offset);
  const monthOffset = h % 15; // 0~14 months from 2025-01
  const baseYear = 2025;
  const baseMonth = 1;
  const totalMonths = baseMonth + monthOffset;
  const year = baseYear + Math.floor((totalMonths - 1) / 12);
  const month = ((totalMonths - 1) % 12) + 1;
  const day = (h % 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * 为一个政府网站生成多条检索条目
 * 每个有URL的政府门户对应若干条信息条目，模拟真实政务公开栏目
 */
function generateEntriesForSite(
  node: GovWebsiteNode,
  province: string,
  adminLevel: "province" | "city" | "county",
  parentCity?: string,
): GovSearchItem[] {
  if (!node.url) return [];

  const regionName = node.name;
  const h = stableHash(regionName);

  // 每个站点生成 3~6 条条目
  const entryCount = 3 + (h % 4);
  const entries: GovSearchItem[] = [];

  const templates = getTemplatesForRegion(regionName, adminLevel, province);

  for (let i = 0; i < Math.min(entryCount, templates.length); i++) {
    const tpl = templates[i];
    const docType = tpl.docType;
    const leaderRole = docType === "领导活动"
      ? pickFromPool(["书记", "市长", "其他"] as LeaderRole[], regionName, i)[0]
      : "无" as LeaderRole;

    entries.push({
      id: `gov-${adminLevel}-${regionName}-${i}`,
      title: tpl.title,
      url: node.url,
      siteName: `${regionName}人民政府`,
      siteRegion: province,
      contentRegion: regionName,
      contentScope: tpl.scope,
      docType,
      leaderRole,
      topics: tpl.topics,
      publishedAt: stableDate(regionName, i),
      summary: tpl.summary,
      adminLevel,
    });
  }

  return entries;
}

/** 为指定地区生成内容模板（基于地区名和层级，确保标题真实感） */
function getTemplatesForRegion(
  regionName: string,
  adminLevel: "province" | "city" | "county",
  province: string,
): Array<{
  title: string;
  docType: GovDocType;
  scope: ContentScope;
  topics: string[];
  summary: string;
}> {
  const h = stableHash(regionName);
  const selectedTopics = pickFromPool(TOPIC_POOL, regionName, 0, 3);
  const topic1 = selectedTopics[0];
  const topic2 = selectedTopics[1] || topic1;

  const leaderTitle = adminLevel === "province"
    ? (regionName.includes("市") ? "市委书记" : "省委书记")
    : adminLevel === "city" ? "市委书记" : "区委书记";

  const govTitle = adminLevel === "province"
    ? (regionName.includes("市") ? "市长" : "省长")
    : adminLevel === "city" ? "市长" : "区长";

  const shortName = regionName
    .replace(/省$/, "").replace(/市$/, "").replace(/区$/, "")
    .replace(/县$/, "").replace(/自治区$/, "").replace(/壮族|回族|维吾尔/, "");

  return [
    {
      title: `${regionName}${leaderTitle}调研${topic1}产业发展情况`,
      docType: "领导活动",
      scope: "本地",
      topics: [topic1, "招商引资"],
      summary: `${regionName}${leaderTitle}近日深入${shortName}${topic1}产业园区，实地调研产业发展现状，强调要抢抓机遇，加快推进${topic1}产业集群建设。`,
    },
    {
      title: `${regionName}人民政府关于加快${topic2}产业高质量发展的实施意见`,
      docType: "产业政策文件",
      scope: "本地",
      topics: [topic2, "产业升级"],
      summary: `${regionName}出台关于${topic2}产业发展的实施意见，提出到2027年${topic2}产业规模达到新目标，完善政策支持体系。`,
    },
    {
      title: `${regionName}${govTitle}主持召开${regionName}优化营商环境工作推进会`,
      docType: "领导活动",
      scope: "本地",
      topics: ["营商环境", "重大项目"],
      summary: `${regionName}${govTitle}主持召开优化营商环境工作推进会，听取相关部门工作汇报，部署下一阶段重点任务。`,
    },
    {
      title: `${regionName}${h % 2 === 0 ? "2025年" : "2026年"}重大项目集中开工`,
      docType: "其他新闻",
      scope: "本地",
      topics: ["重大项目", "园区建设"],
      summary: `${regionName}举行重大项目集中开工仪式，涵盖${topic1}、${topic2}等领域，总投资额超过百亿元。`,
    },
    {
      title: `${regionName}财政局关于做好${h % 2 === 0 ? "2025" : "2026"}年度财政预算执行工作的通知`,
      docType: "其他政策文件",
      scope: "本地",
      topics: ["财政金融"],
      summary: `${regionName}财政局发布年度财政预算执行工作通知，要求各部门严格执行预算，优化支出结构。`,
    },
    {
      title: `${regionName}积极融入${province === regionName ? "国家" : province}${topic1}发展战略`,
      docType: "其他新闻",
      scope: province === regionName ? "全国" : "上级",
      topics: [topic1, "数字经济"],
      summary: `${regionName}积极对接${province === regionName ? "国家" : province}战略部署，推动${topic1}领域合作取得新进展。`,
    },
  ];
}

/**
 * 从 GOV_WEBSITES 树形数据构建省级检索条目
 * Phase 1: 仅包含省级门户
 */
export function buildProvinceSearchData(): GovSearchItem[] {
  const items: GovSearchItem[] = [];
  for (const province of GOV_WEBSITES) {
    items.push(...generateEntriesForSite(province, province.name, "province"));
  }
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * 从 GOV_WEBSITES 树形数据构建省级+地级市检索条目
 * Phase 2: 省级 + 地级市门户
 */
export function buildCitySearchData(): GovSearchItem[] {
  const items: GovSearchItem[] = [];
  for (const province of GOV_WEBSITES) {
    // 省级条目
    items.push(...generateEntriesForSite(province, province.name, "province"));
    // 地级市条目（直辖市下属为区县，当作city层级处理）
    if (province.children) {
      for (const city of province.children) {
        const level = province.name.match(/^(北京|天津|上海|重庆)/) ? "county" : "city";
        items.push(...generateEntriesForSite(city, province.name, level, city.name));
      }
    }
  }
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** 导出示例主题列表供筛选器使用 */
export const GOV_SEARCH_TOPICS = TOPIC_POOL;

/** 导出类型和角色常量供筛选器使用 */
export const GOV_DOC_TYPES = DOC_TYPES;
export const GOV_LEADER_ROLES = LEADER_ROLES;
export const GOV_CONTENT_SCOPES: ContentScope[] = ["本地", "上级", "外地", "全国"];
