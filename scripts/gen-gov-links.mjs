/**
 * Generate gov-website-links.ts from fiscal-budget-links.ts structure.
 * Only copies the hierarchical region names (province → city → county) with empty URLs.
 */
import { FISCAL_REGIONS } from "../data/fiscal-budget-links.ts";

function buildNode(node) {
  const result = { name: node.name, url: "" };
  if (node.children && node.children.length > 0) {
    result.children = node.children.map((child) => {
      const c = { name: child.name, url: "" };
      if (child.children && child.children.length > 0) {
        c.children = child.children.map((gc) => ({ name: gc.name, url: "" }));
      }
      return c;
    });
  }
  return result;
}

const output = FISCAL_REGIONS.map(buildNode);

// Generate the TypeScript source
let ts = `/**
 * 政府官网导航数据
 *
 * 链接查找优先级：
 * 1. 该地区正式政府门户网站（www.{region}.gov.cn 形式）
 * 2. 省/市/县人民政府官方网站
 * 3. 无法确认则留空（灰色显示）
 *
 * 注意区分：
 * - 政府门户网站（本文件收录）
 * - 财政局官网（见 fiscal-budget-links.ts）
 * - 门户导航页、信息公开平台等不收录
 *
 * url 为空字符串表示暂未找到可验证的政府门户网站
 */

export interface GovWebsiteNode {
  name: string;
  url: string;
  children?: GovWebsiteNode[];
}

export const GOV_WEBSITES: GovWebsiteNode[] = `;

ts += JSON.stringify(output, null, 2)
  .replace(/"name"/g, "name")
  .replace(/"url"/g, "url")
  .replace(/"children"/g, "children")
  .replace(/"/g, '"');

// Fix: use proper quotes
ts = ts.replace(/\u201c/g, '"').replace(/\u201d/g, '"');

ts += ";\n";

// Write with proper formatting
import { writeFileSync } from "fs";
writeFileSync("data/gov-website-links.ts", ts, "utf-8");
console.log("Generated data/gov-website-links.ts");

// Count stats
let provinces = 0, cities = 0, counties = 0;
for (const p of output) {
  provinces++;
  for (const c of p.children || []) {
    cities++;
    counties += (c.children || []).length;
  }
}
console.log(`Provinces: ${provinces}, Cities: ${cities}, Counties: ${counties}`);
