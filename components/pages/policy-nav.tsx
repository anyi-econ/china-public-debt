"use client";

import { POLICY_REGIONS } from "@/data/policy-links";
import { RegionLinkNav } from "./region-link-nav";

export function PolicyNav() {
  return (
    <RegionLinkNav
      regions={POLICY_REGIONS}
      title="地区政策导航"
      parentLinkLabel={(name) => `📑 ${name} 政策文件/政策检索入口`}
    />
  );
}
