"use client";

import { PRO_BUSINESS_REGIONS } from "@/data/pro-business-policy-links";
import { RegionLinkNav } from "./region-link-nav";

export function ProBusinessPolicyNav() {
  return (
    <RegionLinkNav
      regions={PRO_BUSINESS_REGIONS}
      title="惠企政策导航"
      parentLinkLabel={(name) => `🏢 ${name} 惠企政策/企业服务平台`}
    />
  );
}
