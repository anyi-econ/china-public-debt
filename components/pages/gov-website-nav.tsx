"use client";

import { GOV_WEBSITES } from "@/data/gov-website-links";
import { RegionLinkNav } from "./region-link-nav";

/**
 * 政府官网导航
 *
 * 复用通用的 `RegionLinkNav` 组件（见 `region-link-nav.tsx`），所有
 * 省/市/县的层级下钻、覆盖率统计、灰色占位样式等逻辑由通用组件承担。
 */
export function GovWebsiteNav() {
  return (
    <RegionLinkNav
      regions={GOV_WEBSITES}
      title="政府官网导航"
      parentLinkLabel={(name) => `🏛 ${name} 政府门户`}
    />
  );
}
