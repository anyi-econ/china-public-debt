"use client";

import { LOCAL_POLICY_REGIONS } from "@/data/local-policy-links";
import { RegionLinkNav } from "./region-link-nav";

export function LocalPolicyNav() {
  return (
    <RegionLinkNav
      regions={LOCAL_POLICY_REGIONS}
      title="地区政策导航"
      parentLinkLabel={(name) => `📑 ${name} 政策文件/政策检索入口`}
    />
  );
}
