"use client";

import { FISCAL_REGIONS } from "@/data/fiscal-budget-links";
import { RegionLinkNav } from "./region-link-nav";

/**
 * 财政预决算导航
 *
 * 复用通用的 `RegionLinkNav` 组件（见 `region-link-nav.tsx`）。原有
 * 层级下钻 / 覆盖率卡片 / 灰色占位样式等逻辑全部由通用组件承担，
 * 本文件仅注入数据源与文案。
 */
export function FiscalBudgetNav() {
  return (
    <RegionLinkNav
      regions={FISCAL_REGIONS}
      title="财政预决算导航"
      parentLinkLabel={(name) => `📄 ${name} 预决算公开页`}
    />
  );
}
