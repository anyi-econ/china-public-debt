"use client";

import { POLICY_REGIONS } from "@/data/website-policy";
import { RegionLinkNav } from "./website-region-nav";

export function PolicyNav() {
  return (
    <RegionLinkNav
      regions={POLICY_REGIONS}
      title="地区政策导航"
      parentLinkLabel={(name) => `📑 ${name} 政策文件/政策检索入口`}
    />
  );
}
