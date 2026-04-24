/**
 * 基于 `gov-website-links.ts` 的行政区划层级，叠加一张"路径 → URL"映射表，
 * 生成一棵新的 `RegionLinkNode` 树，用于"地区要闻""地区政策""惠企政策"
 * 三类导航。
 *
 * 路径字符串规则（与 GOV_WEBSITES 的 name 字段完全一致）：
 *   - 省级："北京市"
 *   - 地级："广东省/广州市"
 *   - 县级："上海市/黄浦区" 或 "广东省/深圳市/福田区"
 *
 * 如此可以避免每个导航都重复维护全国 3000+ 行政区结构，仅维护"已经
 * 人工核验的 URL 覆盖表"。未在映射表中的地区 url 留空，前端会显示为
 * 灰色待补充样式。
 */

import { GOV_WEBSITES, type GovWebsiteNode } from "./gov-website-links";
import type { RegionLinkNode } from "@/components/pages/region-link-nav";

export type RegionUrlMap = Record<string, string>;

export function buildRegionTree(urlMap: RegionUrlMap): RegionLinkNode[] {
  const build = (nodes: GovWebsiteNode[], prefix: string): RegionLinkNode[] =>
    nodes.map((n) => {
      const key = prefix ? `${prefix}/${n.name}` : n.name;
      const url = urlMap[key] ?? "";
      const children = n.children && n.children.length > 0 ? build(n.children, key) : undefined;
      return { name: n.name, url, children };
    });
  return build(GOV_WEBSITES, "");
}
